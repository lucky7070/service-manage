import { StyleSheet, View } from "react-native";
import BookServiceSearch from "../components/booking/BookServiceSearch";
import DetailHeader from "../components/ui/DetailHeader";
import Screen from "../components/ui/Screen";
import { useRootNavigation } from "../helpers/common";
import { spacing } from "../theme/colors";
import { screenStyles } from "../theme/screenStyles";

export default function BookServiceScreen() {
    const navigation = useRootNavigation();

    return (
        <View style={screenStyles.stackRoot}>
            <DetailHeader title="Book a service" subtitle="Find verified professionals near you" onBack={() => navigation.goBack()} />
            <Screen safe={false} contentContainerStyle={styles.content}>
                <BookServiceSearch />
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    content: { paddingTop: spacing.md },
});
