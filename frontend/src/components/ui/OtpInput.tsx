"use client";

import * as React from "react";
import { cn } from "@/helpers/utils";

type OtpInputCellProps = {
    id?: string;
    value: string;
    placeholder?: string;
    inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
    type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
    autoComplete?: string;
    "aria-label"?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

export type OtpInputProps = {
    value?: string;
    numInputs?: number;
    onChange: (otp: string) => void;
    shouldAutoFocus?: boolean;
    inputType?: "text" | "number" | "tel";
    placeholder?: string;
    renderInput?: (props: OtpInputCellProps, index: number) => React.ReactNode;
    renderSeparator?: React.ReactNode | ((index: number) => React.ReactNode);
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
    inputClassName?: string;
    inputStyle?: React.CSSProperties;
    skipDefaultStyles?: boolean;
    disabled?: boolean;
};

const isStyleObject = (obj: unknown): obj is React.CSSProperties =>
    typeof obj === "object" && obj !== null;

export default function OtpInput({
    value = "",
    numInputs = 6,
    onChange,
    shouldAutoFocus = false,
    inputType = "tel",
    placeholder,
    renderInput,
    renderSeparator,
    containerClassName,
    containerStyle,
    inputClassName,
    inputStyle,
    skipDefaultStyles = false,
    disabled = false
}: OtpInputProps) {
    const [activeInput, setActiveInput] = React.useState(0);

    const otpArray = React.useMemo(() => (value ? value.toString().split("") : []), [value]);
    const isInputNum = inputType === "number" || inputType === "tel";

    const getCellId = (index: number) => `otp-cell-${index}`;

    React.useEffect(() => {
        if (!shouldAutoFocus) return;
        // Focus only after mount so we don't try to access DOM during render.
        const id = window.setTimeout(() => {
            const el = document.getElementById(getCellId(0)) as HTMLInputElement | null;
            el?.focus();
            el?.select();
            setActiveInput(0);
        }, 0);
        return () => window.clearTimeout(id);
    }, [shouldAutoFocus]);

    const getPlaceholderValue = React.useCallback(() => {
        if (typeof placeholder === "string") {
            if (placeholder.length === numInputs) return placeholder;
            if (placeholder.length > 0) {
                console.error("Length of the placeholder should be equal to numInputs.");
            }
        }
        return undefined;
    }, [placeholder, numInputs]);

    const isInputValueValid = (cellValue: string) => {
        const isTypeValid = isInputNum ? !isNaN(Number(cellValue)) : typeof cellValue === "string";
        return isTypeValid && cellValue.trim().length === 1;
    };

    const focusInput = (index: number) => {
        const nextIndex = Math.max(0, Math.min(numInputs - 1, index));
        const el = document.getElementById(getCellId(nextIndex)) as HTMLInputElement | null;
        el?.focus();
        el?.select();
        setActiveInput(nextIndex);
    };

    const updateOtpAtIndex = (index: number, nextChar: string) => {
        const next = Array.from({ length: numInputs }, (_, i) => otpArray[i] ?? "");
        next[index] = nextChar;
        onChange(next.join("")); // keep leading zeros
    };

    const handleChangeAtActive = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = event.target.value;
        const currentCell = activeInput;

        // If user typed/pasted multiple chars into one input, keep only the first valid digit.
        const chars = inputVal.split("");
        const firstValid = chars.find((c) => isInputValueValid(c));
        if (!firstValid) return;

        updateOtpAtIndex(currentCell, firstValid);
        focusInput(currentCell + 1);
    };

    const handleCellKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const otp = Array.from({ length: numInputs }, (_, i) => otpArray[i] ?? "");

        if (disabled) return;

        // Allow common keyboard shortcuts (paste/copy/cut/select-all/undo/redo).
        if ((event.ctrlKey || event.metaKey) && ["a", "c", "v", "x", "z", "y"].includes(event.key.toLowerCase())) {
            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();
            updateOtpAtIndex(activeInput, "");
            focusInput(activeInput - 1);
            return;
        }

        if (event.key === "Delete") {
            event.preventDefault();
            updateOtpAtIndex(activeInput, "");
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            focusInput(activeInput - 1);
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            focusInput(activeInput + 1);
            return;
        }

        // Prevent typing more than 1 char per cell.
        if (event.key.length === 1) {
            if (!isInputValueValid(event.key)) event.preventDefault();
        }

        // Keep space/enter from adding weird chars.
        if ([" ", "Enter"].includes(event.key)) {
            event.preventDefault();
        }

        // If user presses a key equal to what's already there, just move forward.
        if (event.key.length === 1 && event.key === otp[activeInput]) {
            event.preventDefault();
            focusInput(activeInput + 1);
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (disabled) return;

        const pasted = event.clipboardData.getData("text/plain").slice(0, numInputs - activeInput);
        if (isInputNum && pasted.split("").some((c) => !isInputValueValid(c))) return;

        const chars = pasted.split("");
        const next = Array.from({ length: numInputs }, (_, i) => otpArray[i] ?? "");
        chars.forEach((char, offset) => {
            next[activeInput + offset] = char;
        });
        onChange(next.join(""));

        focusInput(Math.min(numInputs - 1, activeInput + chars.length));
    };

    const handleFocus = (index: number) => (event: React.FocusEvent<HTMLInputElement>) => {
        if (disabled) return;
        setActiveInput(index);
        event.target.select();
    };

    const handleBlur = () => setActiveInput((v) => Math.max(0, v - 1));

    const placeholderValue = getPlaceholderValue();

    return (
        <div className={cn("flex items-center gap-2", containerClassName)} style={isStyleObject(containerStyle) ? containerStyle : undefined}>
            {Array.from({ length: numInputs }, (_, index) => {
                const cellValue = otpArray[index] ?? "";
                const cellPlaceholder = placeholderValue ? placeholderValue[index] : undefined;

                const cellProps: OtpInputCellProps = {
                    id: getCellId(index),
                    value: cellValue,
                    placeholder: cellPlaceholder,
                    inputMode: isInputNum ? "numeric" : undefined,
                    type: inputType,
                    autoComplete: "off",
                    "aria-label": `Please enter OTP character ${index + 1}`,
                    disabled,
                    className: skipDefaultStyles ? inputClassName : cn("size-10 rounded-lg border border-indigo-100 bg-white text-center text-lg text-slate-900 outline-none transition focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 disabled:opacity-50 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:ring-indigo-200", !skipDefaultStyles && "shadow-xs", inputClassName),
                    style: skipDefaultStyles ? inputStyle : { width: "3rem", textAlign: "center", ...inputStyle },
                    onChange: handleChangeAtActive,
                    onFocus: handleFocus(index),
                    onBlur: handleBlur,
                    onKeyDown: handleCellKeyDown,
                    onPaste: handlePaste
                };

                if (renderInput) {
                    return <React.Fragment key={index}>
                        {renderInput(cellProps, index)}
                        {index < numInputs - 1
                            ? typeof renderSeparator === "function"
                                ? renderSeparator(index)
                                : renderSeparator
                            : null}
                    </React.Fragment>
                }

                return <React.Fragment key={index}>
                    <input id={getCellId(index)} {...cellProps} />
                    {index < numInputs - 1 ? typeof renderSeparator === "function" ? renderSeparator(index) : renderSeparator : null}
                </React.Fragment>
            })}
        </div>
    );
}

