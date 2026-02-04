import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { Course } from '../types/course';

interface CourseCardProps {
    course: Course;
    onPress?: () => void;
    actionLabel?: string;
    onAction?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, actionLabel, onAction }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.header}>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{course.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.price}>{course.price.toLocaleString()} FCFA</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Départ</Text>
                        <Text style={styles.address}>{course.pickupAddress}</Text>
                    </View>
                </View>

                <View style={styles.connector} />

                <View style={styles.row}>
                    <Ionicons name="flag-outline" size={20} color={COLORS.success} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Arrivée</Text>
                        <Text style={styles.address}>{course.dropoffAddress}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.distance}>{course.distance}</Text>
                    {actionLabel && (
                        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                            <Text style={styles.actionText}>{actionLabel}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        marginVertical: SPACING.s,
        marginHorizontal: SPACING.m,
        padding: SPACING.m,
        ...SHADOWS.small,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    badgeContainer: {
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 4,
    },
    textContainer: {
        marginLeft: SPACING.s,
        flex: 1,
    },
    label: {
        fontSize: 10,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    address: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    connector: {
        height: 15,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.gray,
        marginLeft: 9,
        marginVertical: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.s,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    distance: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.m,
        paddingVertical: 6,
        borderRadius: SPACING.s,
    },
    actionText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default CourseCard;
