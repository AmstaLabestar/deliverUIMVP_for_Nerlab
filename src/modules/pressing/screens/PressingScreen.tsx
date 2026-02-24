import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { VehicleType } from "@/src/modules/auth/types/authTypes";
import { usePressingOffers } from "@/src/modules/pressing/hooks/usePressingOffers";
import { PressingOfferCard } from "@/src/modules/pressing/components/PressingOfferCard";
import { useReservations } from "@/src/modules/reservations/hooks/useReservations";
import { COLORS, Spacing, Typography } from "@/src/shared/theme";

export const PressingScreen = () => {
  const router = useRouter();
  const { offers, removeOffer } = usePressingOffers();
  const { acceptPressingOffer } = useReservations();
  const [selectedVehicles, setSelectedVehicles] = useState<
    Record<string, VehicleType | null>
  >({});

  const handleAccept = async (offerId: string) => {
    const offer = offers.find((item) => item.id === offerId);
    if (!offer) {
      return;
    }

    const selectedVehicle = selectedVehicles[offerId];
    if (!selectedVehicle) {
      Alert.alert("Véhicule requis", "Choisis un type de véhicule avant d'accepter.");
      return;
    }

    await acceptPressingOffer(offer, selectedVehicle);
    removeOffer(offerId);

    Alert.alert("Offre pressing acceptée", "Course ajoutée dans Réservations.");
    router.replace("/reservations" as Href);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Offres de livraison Pressing</Text>
      <Text style={styles.subtitle}>
        Choisis le véhicule adapté puis accepte une offre.
      </Text>

      {offers.map((offer) => (
        <PressingOfferCard
          key={offer.id}
          offer={offer}
          selectedVehicle={selectedVehicles[offer.id] ?? null}
          onSelectVehicle={(vehicle) => {
            setSelectedVehicles((previous) => ({ ...previous, [offer.id]: vehicle }));
          }}
          onAccept={() => {
            void handleAccept(offer.id);
          }}
        />
      ))}

      {offers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune offre pressing pour le moment.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: COLORS.black,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: COLORS.gray,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: COLORS.gray,
  },
});
