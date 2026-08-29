"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { downloadAdminExcel } from "@/helpers/adminExcelExport";

type AdminExportButtonProps = {
    url: string;
    params: Record<string, unknown>;
    filenamePrefix: string;
    label?: string;
};

export default function AdminExportButton({ url, params, filenamePrefix, label = "Export Excel" }: AdminExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        const filterParams = Object.fromEntries(
            Object.entries(params).filter(([key]) => key !== "limit" && key !== "pageNo")
        );
        await downloadAdminExcel(url, filterParams, filenamePrefix);
        setExporting(false);
    };

    return (
        <Button type="button" variant="secondary" size="md" onClick={() => void handleExport()} disabled={exporting}>
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {label}
        </Button>
    );
}
