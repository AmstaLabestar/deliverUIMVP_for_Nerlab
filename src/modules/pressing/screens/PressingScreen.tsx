import { VehicleType } from "@/src/modules/auth/types/authTypes";
import { PressingOfferCard } from "@/src/modules/pressing/components/PressingOfferCard";
import { usePressingOffers } from "@/src/modules/pressing/hooks/usePressingOffers";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";
import { useReservations } from "@/src/modules/reservations/hooks/useReservations";
import { COLORS, Spacing, Typography } from "@/src/shared/theme";
import { AdaptiveList } from "@/src/shared/components/AdaptiveList";
import { FLASH_LIST_THRESHOLD, LIST_PRESETS } from "@/src/shared/performance/listPresets";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from "react-native";

export const PressingScreen = () => {
  const router = useRouter();
  const { offers, isLoading, removeOffer } = usePressingOffers();
  const { acceptPressingOffer } = useReservations();
  const [selectedVehicles, setSelectedVehicles] = useState<
    Record<string, VehicleType | null>
  >({});

  const offersById = useMemo(
    () => new Map(offers.map((offer) => [offer.id, offer])),
    [offers],
  );

  const handleSelectVehicle = useCallback((offerId: string, vehicle: VehicleType) => {
    setSelectedVehicles((previous) => {
      if (previous[offerId] === vehicle) {
        return previous;
      }

      return { ...previous, [offerId]: vehicle };
    });
  }, []);

  const handleAccept = useCallback(
    async (offerId: string) => {
      const offer = offersById.get(offerId);
      if (!offer) {
        return;
      }

      const selectedVehicle = selectedVehicles[offerId];
      if (!selectedVehicle) {
        Alert.alert(
          "Vehicule requis",
          "Choisis un type de vehicule avant d'accepter.",
        );
        return;
      }

      await acceptPressingOffer(offer, selectedVehicle);
      removeOffer(offerId);

      Alert.alert("Offre pressing acceptee", "Course ajoutee dans Reservations.");
      router.replace("/reservations" as Href);
    },
    [acceptPressingOffer, offersById, removeOffer, router, selectedVehicles],
  );

  const renderOfferItem = useCallback(
    ({ item }: ListRenderItemInfo<PressingOffer>) => (
      <PressingOfferCard
        offer={item}
        selectedVehicle={selectedVehicles[item.id] ?? null}
        onSelectVehicle={handleSelectVehicle}
        onAccept={handleAccept}
      />
    ),
    [handleAccept, handleSelectVehicle, selectedVehicles],
  );

  const keyExtractor = useCallback((item: PressingOffer) => item.id, []);

  const listHeader = useMemo(
    () => (
      <View>
        <Text style={styles.title}>Offres de livraison Pressing</Text>
        <Text style={styles.subtitle}>
          Choisis le vehicule adapte puis accepte une offre.
        </Text>
      </View>
    ),
    [],
  );

  const listEmpty = useMemo(
    () =>
      isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune offre pressing pour le moment.</Text>
        </View>
      ),
    [isLoading],
  );

  return (
    <AdaptiveList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={offers}
      keyExtractor={keyExtractor}
      renderItem={renderOfferItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      flashListThreshold={FLASH_LIST_THRESHOLD}
      estimatedItemSize={LIST_PRESETS.pressing.estimatedItemSize}
      initialNumToRender={LIST_PRESETS.pressing.initialNumToRender}
      maxToRenderPerBatch={LIST_PRESETS.pressing.maxToRenderPerBatch}
      windowSize={LIST_PRESETS.pressing.windowSize}
      removeClippedSubviews
      updateCellsBatchingPeriod={LIST_PRESETS.pressing.updateCellsBatchingPeriod}
    />
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
