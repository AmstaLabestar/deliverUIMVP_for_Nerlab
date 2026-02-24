import { VehicleType } from "@/src/modules/auth/types/authTypes";
import { useCourses } from "@/src/modules/courses/hooks/useCourses";
import { Course } from "@/src/modules/courses/types/courseTypes";
import { useNetworkStatus } from "@/src/infrastructure/network/useNetworkStatus";
import { useOfflineSync } from "@/src/infrastructure/offline/useOfflineSync";
import {
  OfflineMutationAction,
  OfflineMutationPayload,
} from "@/src/infrastructure/offline/offlineQueueTypes";
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/useNotificationPreferences";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";
import { useWallet } from "@/src/modules/portefeuille/hooks/useWallet";

const COMMISSION_RATE = 0.1;

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
  const courses = useCourses();
  const wallet = useWallet();
  const notifications = useNotificationPreferences();
  const { isOffline } = useNetworkStatus();
  const { enqueueMutation } = useOfflineSync();

  const enqueueOfflineMutation = async (
    action: OfflineMutationAction,
    payload: OfflineMutationPayload,
  ) => {
    if (!isOffline) {
      return;
    }

    await enqueueMutation({
      action,
      payload,
      conflictStrategy: "server_wins",
    });
  };

  const acceptCourse = async (courseId: string) => {
    const accepted = await courses.acceptCourse(courseId);

    if (accepted.typeLivraison === "colis") {
      await notifications.notifyPackageAccepted(
        `${accepted.quartierDepart} -> ${accepted.quartierArrivee}`,
      );
    }

    await enqueueOfflineMutation("courses.accept", {
      courseId: accepted.id,
      amount: accepted.montant,
      type: accepted.typeLivraison,
    });

    return accepted;
  };

  const rejectCourse = async (courseId: string) => {
    await courses.rejectCourse(courseId);
    await enqueueOfflineMutation("courses.reject", {
      courseId,
    });
  };

  const acceptPressingOffer = async (offer: PressingOffer, vehicle: VehicleType) => {
    const course = toPressingCourse(offer, vehicle);
    const acceptedCourse = await courses.assignExternalCourse(course);

    await enqueueOfflineMutation("pressing.accept", {
      offerId: offer.id,
      courseId: acceptedCourse.id,
      vehicle,
    });

    return acceptedCourse;
  };

  const startActiveCourse = async () => {
    const activeCourseId = courses.activeCourse?.id ?? null;
    await courses.startActiveCourse();
    await enqueueOfflineMutation("courses.start", {
      courseId: activeCourseId,
    });
  };

  const completeActiveCourse = async () => {
    const completedCourse = await courses.completeActiveCourse();

    if (!completedCourse) {
      return null;
    }

    const commissionAmount = Math.round(completedCourse.montant * COMMISSION_RATE);
    await wallet.settleCompletedCourse({
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
  };

  return {
    acceptCourse,
    rejectCourse,
    acceptPressingOffer,
    startActiveCourse,
    completeActiveCourse,
  };
};
