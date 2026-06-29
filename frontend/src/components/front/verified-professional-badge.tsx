"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/front/ui/dialog";

type VerificationDetails = {
    isPanCardVerified: boolean;
    isAadharVerified: boolean;
    isPoliceVerificationVerified: boolean;
};

type VerificationItem = {
    key: keyof VerificationDetails;
    label: string;
    description: string;
};

const VERIFICATION_ITEMS: VerificationItem[] = [
    {
        key: "isPanCardVerified",
        label: "PAN card",
        description: "Identity verified with a valid PAN card.",
    },
    {
        key: "isAadharVerified",
        label: "Aadhar",
        description: "Identity verified with a valid Aadhar number.",
    },
    {
        key: "isPoliceVerificationVerified",
        label: "Police verification",
        description: "Background check document submitted and reviewed.",
    },
];

export function VerifiedProfessionalBadge({ verification }: { verification: VerificationDetails }) {
    const [open, setOpen] = useState(false);
    const verifiedCount = VERIFICATION_ITEMS.filter((item) => verification[item.key]).length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                type="button"
                className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 transition hover:bg-green-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                aria-label="View verification details"
            >
                <CheckCircle2 className="h-4 w-4" />
                Verified Professional
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-gray-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Verification details
                    </DialogTitle>
                    <DialogDescription>
                        {verifiedCount} of {VERIFICATION_ITEMS.length} checks completed for this professional.
                    </DialogDescription>
                </DialogHeader>
                <ul className="space-y-3">
                    {VERIFICATION_ITEMS.map((item) => {
                        const isVerified = verification[item.key];
                        return (
                            <li
                                key={item.key}
                                className={`flex gap-3 rounded-xl border p-3 ${isVerified ? "border-green-100 bg-green-50/60" : "border-gray-100 bg-gray-50"}`}
                            >
                                {isVerified ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                ) : (
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                                )}
                                <div>
                                    <p className={`text-sm font-semibold ${isVerified ? "text-green-800" : "text-gray-700"}`}>
                                        {item.label} {isVerified ? "verified" : "not verified"}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-5 text-gray-500">{item.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
