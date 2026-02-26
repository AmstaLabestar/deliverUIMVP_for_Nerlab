import { APP_CONFIG } from "@/src/core/config/env";
import { AppError } from "@/src/core/errors/AppError";
import { httpClient } from "@/src/core/http/httpClient";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const offersSeed: PressingOffer[] = [
  {
    id: "pressing_001",
    pressingName: "Pressing Etoile",
    pickupAddress: "Zone du Bois, Ouagadougou",
    dropoffAddress: "Pressing Etoile - Koulouba",
    distance: 4.2,
    amount: 12000,
    clientName: "Nadege Savadogo",
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
    clientName: "Abdou Ouedraogo",
    clientPhone: "77000999",
    createdAt: new Date().toISOString(),
    availableVehicles: ["voiture", "fourgonnette"],
  },
];

const mockConfirmationCodes: Record<string, string> = {
  pressing_001: "482913",
  pressing_002: "650214",
};

type VerifyDeliveryCodeInput = {
  courseId: string;
  code: string;
  signal?: AbortSignal;
};

type VerifyDeliveryCodeResponse = {
  isValid?: boolean;
  valid?: boolean;
};

const parseOfferIdFromCourseId = (courseId: string): string => {
  return courseId.startsWith("course_") ? courseId.slice("course_".length) : courseId;
};

const verifyDeliveryCode = async ({
  courseId,
  code,
  signal,
}: VerifyDeliveryCodeInput): Promise<boolean> => {
  try {
    const response = await httpClient.post<
      VerifyDeliveryCodeResponse,
      { courseId: string; code: string }
    >(
      "/pressing/verify-delivery-code",
      {
        courseId,
        code,
      },
      {
        signal,
        retryCount: 1,
      },
    );

    return Boolean(response.isValid ?? response.valid);
  } catch (error) {
    if (
      error instanceof AppError &&
      error.code === "network_error" &&
      APP_CONFIG.auth.enableMockAuthFallback
    ) {
      await wait(180);
      const offerId = parseOfferIdFromCourseId(courseId);
      const expectedCode = mockConfirmationCodes[offerId];
      return expectedCode === code;
    }

    throw error;
  }
};

export const pressingService = {
  fetchOffers: async (): Promise<PressingOffer[]> => {
    await wait(300);
    return offersSeed.map((offer) => ({
      ...offer,
      availableVehicles: [...offer.availableVehicles],
    }));
  },
  verifyDeliveryCode,
};
