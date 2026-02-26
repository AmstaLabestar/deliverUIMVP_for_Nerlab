import { VehicleType } from "@/src/modules/auth/types/authTypes";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "@/src/shared/theme";
import { formatMoney } from "@/src/shared/utils/formatters";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PressingOfferCardProps = {
  offer: PressingOffer;
  selectedVehicle: VehicleType | null;
  onSelectVehicle: (offerId: string, vehicle: VehicleType) => void;
  onAccept: (offerId: string) => void;
};

const vehicleLabelMap: Record<VehicleType, string> = {
  moto: "Moto",
  voiture: "Voiture",
  fourgonnette: "Fourgonnette",
  tricycle: "Tricycle",
};

const PressingOfferCardComponent = ({
  offer,
  selectedVehicle,
  onSelectVehicle,
  onAccept,
}: PressingOfferCardProps) => {
  const handleAccept = useCallback(() => {
    onAccept(offer.id);
  }, [offer.id, onAccept]);

  const buildVehiclePressHandler = useCallback(
    (vehicle: VehicleType) => () => {
      onSelectVehicle(offer.id, vehicle);
    },
    [offer.id, onSelectVehicle],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{offer.pressingName}</Text>
      <Text style={styles.meta}>
        {offer.pickupAddress}
        {" -> "}
        {offer.dropoffAddress}
      </Text>
      <Text style={styles.meta}>
        {offer.distance} km - {formatMoney(offer.amount)}
      </Text>
      <Text style={styles.meta}>Client: {offer.clientName}</Text>

      <View style={styles.vehicles}>
        {offer.availableVehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle}
            style={[
              styles.vehicleButton,
              selectedVehicle === vehicle && styles.vehicleButtonSelected,
            ]}
            onPress={buildVehiclePressHandler(vehicle)}
          >
            <Text
              style={[
                styles.vehicleText,
                selectedVehicle === vehicle && styles.vehicleTextSelected,
              ]}
            >
              {vehicleLabelMap[vehicle]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
        <Text style={styles.acceptButtonText}>Accepter l'offre pressing</Text>
      </TouchableOpacity>
    </View>
  );
};

export const PressingOfferCard = React.memo(PressingOfferCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  title: {
    ...Typography.label,
    color: COLORS.black,
  },
  meta: {
    ...Typography.caption,
    color: COLORS.darkGray,
    marginTop: Spacing.xs,
  },
  vehicles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  vehicleButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: COLORS.bgSecondary,
  },
  vehicleButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  vehicleText: {
    ...Typography.caption,
    color: COLORS.darkGray,
  },
  vehicleTextSelected: {
    color: COLORS.white,
  },
  acceptButton: {
    marginTop: Spacing.md,
    backgroundColor: COLORS.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  acceptButtonText: {
    ...Typography.label,
    color: COLORS.white,
  },
});
