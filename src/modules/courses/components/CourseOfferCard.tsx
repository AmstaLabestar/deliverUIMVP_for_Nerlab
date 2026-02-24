import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Course } from "@/src/modules/courses/types/courseTypes";
import { BorderRadius, COLORS, Shadows, Spacing, Typography } from "@/src/shared/theme";
import { formatMoney } from "@/src/shared/utils/formatters";

type CourseOfferCardProps = {
  course: Course;
  onAccept: (courseId: string) => void;
  onReject: (courseId: string) => void;
};

const getTypeIcon = (type: Course["typeLivraison"]): string => {
  switch (type) {
    case "colis":
      return "📦";
    case "nourriture":
      return "🍔";
    case "documents":
      return "📄";
    case "pressing":
      return "🧺";
    default:
      return "🚚";
  }
};

const getPaymentLabel = (type: Course["typePaiement"]): string => {
  return type === "deja_paye" ? "Déjà payé" : "Paiement à la livraison";
};

export const CourseOfferCard = ({ course, onAccept, onReject }: CourseOfferCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.typeIcon}>{getTypeIcon(course.typeLivraison)}</Text>
          <Text style={styles.typeLabel}>{course.typeLivraison.toUpperCase()}</Text>
        </View>
        <Text style={styles.amount}>{formatMoney(course.montant)}</Text>
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.routeLabel}>Départ</Text>
        <Text style={styles.routeValue}>{course.quartierDepart}</Text>
      </View>
      <View style={styles.routeContainer}>
        <Text style={styles.routeLabel}>Arrivée</Text>
        <Text style={styles.routeValue}>{course.quartierArrivee}</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>{course.distance} km</Text>
        <Text style={styles.metaText}>{getPaymentLabel(course.typePaiement)}</Text>
      </View>

      <View style={styles.clientRow}>
        <Text style={styles.clientText}>{course.infosClient.nom}</Text>
        <Text style={styles.clientText}>📞 {course.infosClient.telephone}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => onReject(course.id)}>
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => onAccept(course.id)}>
          <Text style={[styles.actionText, { color: COLORS.white }]}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  typeIcon: {
    fontSize: 18,
  },
  typeLabel: {
    ...Typography.label,
    color: COLORS.black,
  },
  amount: {
    ...Typography.h3,
    color: COLORS.success,
  },
  routeContainer: {
    marginBottom: Spacing.sm,
  },
  routeLabel: {
    ...Typography.caption,
    color: COLORS.gray,
  },
  routeValue: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "600",
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
});
