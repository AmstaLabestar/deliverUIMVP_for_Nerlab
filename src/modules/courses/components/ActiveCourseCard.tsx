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
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ActiveCourseCardProps = {
  course: Course;
  onStart: () => void;
  onComplete: () => void;
  onCallClient: () => void;
};

const getStatusLabel = (status: Course["statut"]): string => {
  if (status === "en_cours") {
    return "En cours";
  }

  if (status === "en_attente") {
    return "En attente de demarrage";
  }

  return "Terminee";
};

const ActiveCourseCardComponent = ({
  course,
  onStart,
  onComplete,
  onCallClient,
}: ActiveCourseCardProps) => {
  const canStart = course.statut === "en_attente";
  const canComplete = course.statut === "en_cours";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Course active</Text>
      <Text style={styles.status}>{getStatusLabel(course.statut)}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Trajet</Text>
        <RouteSummary
          from={course.quartierDepart}
          to={course.quartierArrivee}
          variant="stacked"
          fromLabel="Depart"
          toLabel="Arrivee"
        />
        <Text style={styles.subValue}>
          {course.distance} km - {formatMoney(course.montant)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Client</Text>
        <Text style={styles.value}>{course.infosClient.nom}</Text>
        <Text style={styles.subValue}>{course.infosClient.telephone}</Text>
        <Text style={styles.subValue}>{course.infosClient.adresse}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.callButton} onPress={onCallClient}>
          <Text style={styles.callButtonText}>Appeler le client</Text>
        </TouchableOpacity>
        {canStart ? (
          <TouchableOpacity style={styles.primaryButton} onPress={onStart}>
            <Text style={styles.primaryButtonText}>Demarrer</Text>
          </TouchableOpacity>
        ) : null}
        {canComplete ? (
          <TouchableOpacity style={styles.successButton} onPress={onComplete}>
            <Text style={styles.primaryButtonText}>Terminer</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export const ActiveCourseCard = React.memo(ActiveCourseCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  title: {
    ...Typography.h3,
    color: COLORS.black,
  },
  status: {
    ...Typography.caption,
    color: COLORS.primary,
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: Spacing.md,
  },
  sectionLabel: {
    ...Typography.caption,
    color: COLORS.gray,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "600",
  },
  subValue: {
    ...Typography.caption,
    color: COLORS.darkGray,
    marginTop: Spacing.xs,
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  callButton: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  callButtonText: {
    ...Typography.label,
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  successButton: {
    backgroundColor: COLORS.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  primaryButtonText: {
    ...Typography.label,
    color: COLORS.white,
  },
});
