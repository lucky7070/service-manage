import React from 'react'
import { StyleProp, ViewStyle, View, StyleSheet } from 'react-native'
import { colors, radius } from '../../theme/colors';

export default function Badge({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) {
    return (
        <View style={[styles.badge, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
        borderRadius: radius.x2,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,

    },
});