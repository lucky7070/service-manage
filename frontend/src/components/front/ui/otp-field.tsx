"use client";

import OtpInput from "@/components/ui/OtpInput";
import { Label } from "@/components/front/ui";

type Props = {
    value: string;
    onChange: (next: string) => void;
    disabled?: boolean;
    error?: string;
    onResend: () => void | Promise<void>;
};

export default function OtpField({ value, onChange, disabled = false, error, onResend }: Props) {
    return (
        <div>
            <Label>OTP</Label>
            <OtpInput
                value={value}
                onChange={onChange}
                numInputs={6}
                inputType="tel"
                shouldAutoFocus
                disabled={disabled}
                skipDefaultStyles={true}
                inputClassName="h-11 w-11 rounded-md border border-border bg-background py-2 text-center text-base"
            />
            {error ? <small className="mt-1 block text-xs text-rose-600">{error}</small> : null}
            <button
                type="button"
                className="mt-2 text-xs font-medium text-primary hover:underline"
                onClick={onResend}
                disabled={disabled}
            >
                Resend OTP
            </button>
        </div>
    );
}

