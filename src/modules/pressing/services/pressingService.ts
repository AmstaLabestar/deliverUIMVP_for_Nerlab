import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const offersSeed: PressingOffer[] = [
  {
    id: "pressing_001",
    pressingName: "Pressing Étoile",
    pickupAddress: "Zone du Bois, Ouagadougou",
    dropoffAddress: "Pressing Étoile - Koulouba",
    distance: 4.2,
    amount: 12000,
    clientName: "Nadège Savadogo",
    clientPhone: "77000111",
    createdAt: new Date().toISOString(),
    availableVehicles: ["moto", "voiture", "tricycle"],
  },
  {
    id: "pressing_002",
    pressingName: "Net Plus",
    pickupAddress: "Ouaga 2000",
    dropoffAddress: "Net Plus - Patte d'Oie",
    distance: 8.5,
    amount: 18000,
    clientName: "Abdou Ouédraogo",
    clientPhone: "77000999",
    createdAt: new Date().toISOString(),
    availableVehicles: ["voiture", "fourgonnette"],
  },
];

export const pressingService = {
  fetchOffers: async (): Promise<PressingOffer[]> => {
    await wait(300);
    return offersSeed.map((offer) => ({
      ...offer,
      availableVehicles: [...offer.availableVehicles],
    }));
  },
};
