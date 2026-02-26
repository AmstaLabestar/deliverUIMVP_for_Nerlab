import { useNetworkStatus } from "@/src/infrastructure/network/useNetworkStatus";
import { useOfflineSync } from "@/src/infrastructure/offline/useOfflineSync";
import {
  OfflineMutationAction,
  OfflineMutationPayload,
} from "@/src/infrastructure/offline/offlineQueueTypes";
import { VehicleType } from "@/src/modules/auth/types/authTypes";
import {
  useCoursesActions,
  useCoursesData,
} from "@/src/modules/courses/hooks/useCourses";
import { Course } from "@/src/modules/courses/types/courseTypes";
import { useNotificationPreferencesActions } from "@/src/modules/notifications/hooks/useNotificationPreferences";
import { useWalletActions } from "@/src/modules/portefeuille/hooks/useWallet";
import { pressingService } from "@/src/modules/pressing/services/pressingService";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";
import { formatRoute } from "@/src/shared/utils/formatters";
import { useCallback, useMemo } from "react";

const COMMISSION_RATE = 0.1;

export type PressingCompletionStatus =
  | "completed"
  | "invalid_code"
  | "no_active_pressing";

export type PressingCompletionResult = {
  status: PressingCompletionStatus;
  completedCourse: Course | null;
};

const toPressingCourse = (
  offer: PressingOffer,
  vehicle: VehicleType,
): Course => {
  return {
    id: `course_${offer.id}`,
    quartierDepart: offer.pickupAddress,
    quartierArrivee: offer.dropoffAddress,
    distance: offer.distance,
    montant: offer.amount,
    typeLivraison: "pressing",
    statut: "disponible",
    dateCreation: new Date().toISOString(),
    clientId: `client_${offer.id}`,
    infosClient: {
      nom: offer.clientName,
      telephone: offer.clientPhone,
      adresse: offer.pickupAddress,
    },
    typePaiement: "deja_paye",
    notes: `Livraison pressing - ${offer.pressingName}`,
    vehiculeAttribue: vehicle,
  };
};

export const useReservations = () => {
  const { activeCourse } = useCoursesData();
  const {
    acceptCourse: acceptCourseAction,
    rejectCourse: rejectCourseAction,
    assignExternalCourse,
    startActiveCourse: startActiveCourseAction,
    completeActiveCourse: completeActiveCourseAction,
  } = useCoursesActions();
  const { settleCompletedCourse } = useWalletActions();
  const { notifyPackageAccepted } = useNotificationPreferencesActions();
  const { isOffline } = useNetworkStatus();
  const { enqueueMutation } = useOfflineSync();

  const enqueueOfflineMutation = useCallback(
    async (action: OfflineMutationAction, payload: OfflineMutationPayload) => {
      if (!isOffline) {
        return;
      }

      await enqueueMutation({
        action,
        payload,
        conflictStrategy: "server_wins",
      });
    },
    [enqueueMutation, isOffline],
  );

  const acceptCourse = useCallback(
    async (courseId: string) => {
      const accepted = await acceptCourseAction(courseId);

      if (accepted.typeLivraison === "colis") {
        await notifyPackageAccepted(formatRoute(accepted.quartierDepart, accepted.quartierArrivee));
      }

      await enqueueOfflineMutation("courses.accept", {
        courseId: accepted.id,
        amount: accepted.montant,
        type: accepted.typeLivraison,
      });

      return accepted;
    },
    [acceptCourseAction, enqueueOfflineMutation, notifyPackageAccepted],
  );

  const rejectCourse = useCallback(
    async (courseId: string) => {
      await rejectCourseAction(courseId);
      await enqueueOfflineMutation("courses.reject", {
        courseId,
      });
    },
    [enqueueOfflineMutation, rejectCourseAction],
  );

  const acceptPressingOffer = useCallback(
    async (offer: PressingOffer, vehicle: VehicleType) => {
      const course = toPressingCourse(offer, vehicle);
      const acceptedCourse = await assignExternalCourse(course);

      await enqueueOfflineMutation("pressing.accept", {
        offerId: offer.id,
        courseId: acceptedCourse.id,
        vehicle,
      });

      return acceptedCourse;
    },
    [assignExternalCourse, enqueueOfflineMutation],
  );

  const startActiveCourse = useCallback(async () => {
    const activeCourseId = activeCourse?.id ?? null;
    await startActiveCourseAction();
    await enqueueOfflineMutation("courses.start", {
      courseId: activeCourseId,
    });
  }, [activeCourse?.id, enqueueOfflineMutation, startActiveCourseAction]);

  const completeActiveCourse = useCallback(async () => {
    const completedCourse = await completeActiveCourseAction();

    if (!completedCourse) {
      return null;
    }

    const commissionAmount = Math.round(completedCourse.montant * COMMISSION_RATE);
    await settleCompletedCourse({
      courseId: completedCourse.id,
      courseAmount: completedCourse.montant,
      commissionAmount,
    });

    await enqueueOfflineMutation("courses.complete", {
      courseId: completedCourse.id,
      amount: completedCourse.montant,
      commissionAmount,
    });

    return completedCourse;
  }, [completeActiveCourseAction, enqueueOfflineMutation, settleCompletedCourse]);

  const completePressingCourseWithCode = useCallback(
    async (code: string, signal?: AbortSignal): Promise<PressingCompletionResult> => {
      if (!activeCourse || activeCourse.typeLivraison !== "pressing") {
        return {
          status: "no_active_pressing" as const,
          completedCourse: null,
        };
      }

      if (!/^\d{6}$/.test(code)) {
        return {
          status: "invalid_code" as const,
          completedCourse: null,
        };
      }

      const isCodeValid = await pressingService.verifyDeliveryCode({
        courseId: activeCourse.id,
        code,
        signal,
      });

      if (!isCodeValid) {
        return {
          status: "invalid_code" as const,
          completedCourse: null,
        };
      }

      const completedCourse = await completeActiveCourse();
      return {
        status: completedCourse ? ("completed" as const) : ("no_active_pressing" as const),
        completedCourse,
      };
    },
    [activeCourse, completeActiveCourse],
  );

  return useMemo(
    () => ({
      acceptCourse,
      rejectCourse,
      acceptPressingOffer,
      startActiveCourse,
      completeActiveCourse,
      completePressingCourseWithCode,
    }),
    [
      acceptCourse,
      rejectCourse,
      acceptPressingOffer,
      startActiveCourse,
      completeActiveCourse,
      completePressingCourseWithCode,
    ],
  );
};
