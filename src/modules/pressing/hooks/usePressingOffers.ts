import { pressingService } from "@/src/modules/pressing/services/pressingService";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";
import { useCallback, useEffect, useRef, useState } from "react";

export const usePressingOffers = () => {
  const [offers, setOffers] = useState<PressingOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextOffers = await pressingService.fetchOffers();
      if (!isMountedRef.current) {
        return;
      }

      setOffers(nextOffers);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshOffers();
  }, [refreshOffers]);

  const removeOffer = useCallback((offerId: string) => {
    setOffers((current) => current.filter((offer) => offer.id !== offerId));
  }, []);

  return {
    offers,
    isLoading,
    refreshOffers,
    removeOffer,
  };
};
