import { VehicleType } from "@/src/modules/auth/types/authTypes";
import { PressingOfferCard } from "@/src/modules/pressing/components/PressingOfferCard";
import { usePressingOffers } from "@/src/modules/pressing/hooks/usePressingOffers";
import { PressingOffer } from "@/src/modules/pressing/types/pressingTypes";
import { useReservations } from "@/src/modules/reservations/hooks/useReservations";
import { ListSkeleton } from "@/src/shared/components/ListSkeleton";
import { COLORS, Spacing, Typography } from "@/src/shared/theme";
import { AdaptiveList } from "@/src/shared/components/AdaptiveList";
import { FLASH_LIST_THRESHOLD, LIST_PRESETS } from "@/src/shared/performance/listPresets";
import { toastService } from "@/src/shared/services/toastService";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
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
  const [submittingOfferId, setSubmittingOfferId] = useState<string | null>(null);

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
      if (submittingOfferId === offerId) {
        return;
      }

      const offer = offersById.get(offerId);
      if (!offer) {
        return;
      }

      const selectedVehicle = selectedVehicles[offerId];
      if (!selectedVehicle) {
        toastService.warning(
          "Vehicule requis",
          "Choisis un type de vehicule avant d'accepter.",
        );
        return;
      }

      setSubmittingOfferId(offerId);
      try {
        await acceptPressingOffer(offer, selectedVehicle);
        removeOffer(offerId);
        toastService.success(
          "Offre pressing acceptee",
          "Course ajoutee dans Reservations.",
          "bottom",
        );
        router.replace("/reservations");
      } catch (error) {
        toastService.error("Echec acceptation", "Impossible d'accepter cette offre.");
      } finally {
        setSubmittingOfferId((current) => (current === offerId ? null : current));
      }
    },
    [acceptPressingOffer, offersById, removeOffer, router, selectedVehicles, submittingOfferId],
  );

  const renderOfferItem = useCallback(
    ({ item }: ListRenderItemInfo<PressingOffer>) => (
      <PressingOfferCard
        offer={item}
        selectedVehicle={selectedVehicles[item.id] ?? null}
        onSelectVehicle={handleSelectVehicle}
        onAccept={handleAccept}
        isSubmitting={submittingOfferId === item.id}
      />
    ),
    [handleAccept, handleSelectVehicle, selectedVehicles, submittingOfferId],
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

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return <ListSkeleton itemCount={3} itemHeight={LIST_PRESETS.pressing.estimatedItemSize} />;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune offre pressing pour le moment.</Text>
      </View>
    );
  }, [isLoading]);

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
