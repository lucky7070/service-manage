import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { getAxios } from "@/helpers/AxiosHelper";

export async function downloadAdminExcel(url: string, params: Record<string, unknown>, filenamePrefix: string) {
    try {
        const response = await getAxios(1).get(url, { params, responseType: "blob" });
        const disposition = response.headers["content-disposition"];
        let filename = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (typeof disposition === "string") {
            const match = /filename="?([^"]+)"?/.exec(disposition);
            if (match?.[1]) filename = match[1];
        }

        const blobUrl = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Export downloaded.");
    } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.data instanceof Blob) {
            try {
                const text = await error.response.data.text();
                const parsed = JSON.parse(text) as { message?: string };
                toast.error(parsed.message || "Export failed.");
                return;
            } catch {
                // fall through
            }
        }
        toast.error("Export failed. Please try again.");
    }
}
