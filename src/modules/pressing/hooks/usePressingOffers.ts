import { useCallback, useEffect, useState } from "react";
import { pressingService } from "@/src/modules/pressing/services/pressingService";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";

export const usePressingOffers = () => {
  const [offers, setOffers] = useState<PressingOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextOffers = await pressingService.fetchOffers();
      setOffers(nextOffers);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOffers();
  }, [refreshOffers]);

  const removeOffer = (offerId: string) => {
    setOffers((current) => current.filter((offer) => offer.id !== offerId));
  };

  return {
    offers,
    isLoading,
    refreshOffers,
    removeOffer,
  };
};
