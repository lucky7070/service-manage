import { StyleSheet, View } from "react-native";
import BookServiceSearch from "../components/booking/BookServiceSearch";
import DetailHeader from "../components/ui/DetailHeader";
import Screen from "../components/ui/Screen";
import { useRootNavigation } from "../helpers/common";
import { colors, spacing } from "../theme/colors";

export default function BookServiceScreen() {
    const navigation = useRootNavigation();

    return (
        <View style={styles.root}>
            <DetailHeader title="Book a service" subtitle="Find verified professionals near you" onBack={() => navigation.goBack()} />
            <Screen safe={false} contentContainerStyle={styles.content}>
                <BookServiceSearch />
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.muted },
    content: { paddingTop: spacing.md },
});
