import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import DetailHeader from "./DetailHeader";
import { screenStyles } from "../../theme/screenStyles";

type StackScreenProps = ScrollViewProps & {
    title: string;
    subtitle?: string;
    onBack: () => void;
    keyboard?: boolean;
};

export default function StackScreen({ title, subtitle, onBack, keyboard, children, contentContainerStyle, ...props }: StackScreenProps) {
    const body = (
        <ScrollView
            {...props}
            contentContainerStyle={[screenStyles.formContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    );

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader title={title} subtitle={subtitle} onBack={onBack} />
            {keyboard ? (
                <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    {body}
                </KeyboardAvoidingView>
            ) : (
                body
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
});
