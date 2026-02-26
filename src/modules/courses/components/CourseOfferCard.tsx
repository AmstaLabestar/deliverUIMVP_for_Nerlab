import { Course } from "@/src/modules/courses/types/courseTypes";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "@/src/shared/theme";
import { RouteSummary } from "@/src/shared/components/RouteSummary";
import { formatMoney } from "@/src/shared/utils/formatters";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CourseOfferCardProps = {
  course: Course;
  onAccept: (courseId: string) => void;
  onReject: (courseId: string) => void;
};

const getTypeLabel = (type: Course["typeLivraison"]): string => {
  switch (type) {
    case "colis":
      return "COLIS";
    case "nourriture":
      return "FOOD";
    case "documents":
      return "DOCS";
    case "pressing":
      return "PRESS";
    default:
      return "COURSE";
  }
};

const getPaymentLabel = (type: Course["typePaiement"]): string => {
  return type === "deja_paye" ? "Deja paye" : "Paiement a la livraison";
};

const CourseOfferCardComponent = ({
  course,
  onAccept,
  onReject,
}: CourseOfferCardProps) => {
  const handleReject = useCallback(() => {
    onReject(course.id);
  }, [course.id, onReject]);

  const handleAccept = useCallback(() => {
    onAccept(course.id);
  }, [course.id, onAccept]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.typeLabel}>{getTypeLabel(course.typeLivraison)}</Text>
        </View>
        <Text style={styles.amount}>{formatMoney(course.montant)}</Text>
      </View>

      <RouteSummary
        from={course.quartierDepart}
        to={course.quartierArrivee}
        variant="stacked"
        fromLabel="Depart"
        toLabel="Arrivee"
      />

      <View style={styles.meta}>
        <Text style={styles.metaText}>{course.distance} km</Text>
        <Text style={styles.metaText}>{getPaymentLabel(course.typePaiement)}</Text>
      </View>

      <View style={styles.clientRow}>
        <Text style={styles.clientText}>{course.infosClient.nom}</Text>
        <Text style={styles.clientText}>{course.infosClient.telephone}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <Text style={[styles.actionText, styles.rejectText]}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
        >
          <Text style={[styles.actionText, styles.acceptText]}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CourseOfferCard = React.memo(CourseOfferCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typeLabel: {
    ...Typography.label,
    color: COLORS.black,
  },
  amount: {
    ...Typography.h3,
    color: COLORS.success,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.bgSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  metaText: {
    ...Typography.caption,
    color: COLORS.darkGray,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  clientText: {
    ...Typography.caption,
    color: COLORS.darkGray,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  actionText: {
    ...Typography.label,
  },
  rejectText: {
    color: COLORS.danger,
  },
  acceptText: {
    color: COLORS.white,
  },
});
