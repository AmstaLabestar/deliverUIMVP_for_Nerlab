import { VehicleType } from "@/src/modules/auth/types/authTypes";

export interface PressingOffer {
  id: string;
  pressingName: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: number;
  amount: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  availableVehicles: VehicleType[];
}
