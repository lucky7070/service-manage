import { fetchTermsAndConditions } from "../api";
import CmsPageScreen from "../components/cms/CmsPageScreen";

export default function TermsScreen() {
    return (
        <CmsPageScreen
            eyebrow="Legal"
            fallbackTitle="Terms & Conditions"
            loadPage={fetchTermsAndConditions}
        />
    );
}
