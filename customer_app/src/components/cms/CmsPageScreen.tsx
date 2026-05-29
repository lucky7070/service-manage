import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { ApiResponse, CmsPageData, GeneralSettings } from "../../api";
import { fetchGeneralSettings } from "../../api";
import ContactDetailsCard from "./ContactDetailsCard";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import HtmlContent from "../ui/HtmlContent";
import PageHero from "../ui/PageHero";
import Screen from "../ui/Screen";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../helpers/date";
import { colors, spacing } from "../../theme/colors";
import { screenStyles } from "../../theme/screenStyles";

type CmsPageScreenProps = {
    eyebrow: string;
    fallbackTitle: string;
    loadPage: () => Promise<ApiResponse<CmsPageData>>;
    showContactBox?: boolean;
};

export default function CmsPageScreen({ eyebrow, fallbackTitle, loadPage, showContactBox = true }: CmsPageScreenProps) {
    const { user } = useAuth();
    const [page, setPage] = useState<CmsPageData | null>(null);
    const [settings, setSettings] = useState<GeneralSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [pageRes, settingsRes] = await Promise.all([loadPage(), fetchGeneralSettings()]);
            if (pageRes.status && pageRes.data) setPage(pageRes.data);
            else setPage(null);
            if (settingsRes.status && settingsRes.data) setSettings(settingsRes.data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loadPage]);

    useFocusEffect(useCallback(() => { void load(); }, [load]));

    const title = page?.title || page?.pageTitle || fallbackTitle;
    const html = user.preferredLanguage === "hi" && page?.contentHi?.trim()
        ? page.contentHi
        : page?.content || "";

    return (
        <Screen
            safe={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
        >
            <PageHero eyebrow={eyebrow} title={title} subtitle={page?.metaDescription || undefined} />

            {loading ? (
                <View style={screenStyles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : !page ? (
                <Card elevated><EmptyState icon="file-text" title="Content unavailable" message="This page could not be loaded right now. Pull to refresh." /></Card>
            ) : (
                <>
                    {page.updatedAt ? (
                        <Text style={styles.updated}>Last updated: {formatDate(page.updatedAt)}</Text>
                    ) : null}

                    <Card large style={styles.contentCard}>
                        {html ? <HtmlContent html={html} /> : (
                            <EmptyState icon="file-text" title="No content yet" message="Check back later for updated information." />
                        )}
                    </Card>

                    {showContactBox ? (
                        <ContactDetailsCard
                            settings={settings}
                            description="If you have questions about this page, contact us using the details below."
                        />
                    ) : null}
                </>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    updated: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginBottom: spacing.md,
        marginTop: -spacing.sm,
    },
    contentCard: {
        marginBottom: spacing.lg,
        paddingBottom: spacing.sm,
    },
});
