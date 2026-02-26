import { toErrorMessage } from "@/src/core/errors/toErrorMessage";
import { Course } from "@/src/modules/courses/types/courseTypes";
import { PressingDeliveryCodeSheet } from "@/src/modules/pressing/components/PressingDeliveryCodeSheet";
import { PressingCompletionResult } from "@/src/modules/reservations/hooks/useReservations";
import { toastService } from "@/src/shared/services/toastService";
import { formatMoney } from "@/src/shared/utils/formatters";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const DELIVERY_CODE_LENGTH = 6;

export type PressingDeliveryCodeManagerHandle = {
  open: () => void;
};

type PressingDeliveryCodeManagerProps = {
  activeCourse: Course | null;
  completePressingCourseWithCode: (
    code: string,
    signal?: AbortSignal,
  ) => Promise<PressingCompletionResult>;
};

const PressingDeliveryCodeManagerComponent = (
  { activeCourse, completePressingCourseWithCode }: PressingDeliveryCodeManagerProps,
  ref: React.Ref<PressingDeliveryCodeManagerHandle>,
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const verificationAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      verificationAbortRef.current?.abort();
      verificationAbortRef.current = null;
    };
  }, []);

  const open = useCallback(() => {
    if (!activeCourse || activeCourse.typeLivraison !== "pressing") {
      return;
    }

    setHasError(false);
    setCode("");
    setIsVisible(true);
  }, [activeCourse]);

  useImperativeHandle(
    ref,
    () => ({
      open,
    }),
    [open],
  );

  const close = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsVisible(false);
    setCode("");
    setHasError(false);
  }, [isSubmitting]);

  const handleCodeChange = useCallback((nextCode: string) => {
    setCode(nextCode);
    setHasError(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (code.length !== DELIVERY_CODE_LENGTH) {
      setHasError(true);
      toastService.warning("Code incomplet", "Le code doit contenir 6 chiffres.");
      return;
    }

    verificationAbortRef.current?.abort();
    const abortController = new AbortController();
    verificationAbortRef.current = abortController;

    setIsSubmitting(true);
    try {
      const result = await completePressingCourseWithCode(code, abortController.signal);

      if (result.status === "invalid_code") {
        setHasError(true);
        toastService.error(
          "Code invalide",
          "Le code saisi ne correspond pas a la commande.",
        );
        return;
      }

      if (result.status !== "completed" || !result.completedCourse) {
        toastService.error(
          "Validation impossible",
          "Aucune course pressing active a valider.",
        );
        return;
      }

      setIsVisible(false);
      setCode("");
      setHasError(false);
      toastService.success(
        "Livraison confirmee",
        `Course terminee (${formatMoney(result.completedCourse.montant)}).`,
        "bottom",
      );
    } catch (error) {
      toastService.error("Erreur verification", toErrorMessage(error));
    } finally {
      if (verificationAbortRef.current === abortController) {
        verificationAbortRef.current = null;
      }
      setIsSubmitting(false);
    }
  }, [code, completePressingCourseWithCode]);

  return (
    <PressingDeliveryCodeSheet
      visible={isVisible}
      code={code}
      isSubmitting={isSubmitting}
      hasError={hasError}
      onCodeChange={handleCodeChange}
      onConfirm={handleConfirm}
      onClose={close}
    />
  );
};

export const PressingDeliveryCodeManager = React.memo(
  forwardRef(PressingDeliveryCodeManagerComponent),
);
