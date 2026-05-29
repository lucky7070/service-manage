import { fetchPrivacyPolicy } from "../api";
import CmsPageScreen from "../components/cms/CmsPageScreen";

export default function PrivacyScreen() {
    return (
        <CmsPageScreen
            eyebrow="Legal"
            fallbackTitle="Privacy Policy"
            loadPage={fetchPrivacyPolicy}
        />
    );
}
