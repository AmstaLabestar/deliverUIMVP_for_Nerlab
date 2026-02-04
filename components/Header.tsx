import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightIcon?: string;
    onRightPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, rightIcon, onRightPress }) => {
    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.container}>
                {showBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholder} />
                )}

                <Text style={styles.title}>{title}</Text>

                {rightIcon ? (
                    <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                        <Ionicons name={rightIcon as any} size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholder} />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        fontFamily: FONTS.bold,
    },
    iconButton: {
        padding: SPACING.s,
    },
    placeholder: {
        width: 40,
    }
});

export default Header;
