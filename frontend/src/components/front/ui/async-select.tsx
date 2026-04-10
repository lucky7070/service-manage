"use client";

import AsyncSelect from "react-select/async";

export type FrontSelectOption = { value: string; label: string };

const asyncSelectClassNames = {
    control: (state: { isFocused: boolean }) => `min-h-11! rounded-md! border bg-transparent text-sm shadow-xs transition-[color,box-shadow] ${state.isFocused ? "border-ring ring-ring/50 ring-[3px]" : "border-input"} dark:bg-input/30`,
    valueContainer: () => "px-3 py-0",
    input: () => "m-0 p-0 text-sm text-foreground",
    placeholder: () => "text-muted-foreground",
    indicatorSeparator: () => "hidden",
    dropdownIndicator: () => "text-muted-foreground",
    clearIndicator: () => "text-muted-foreground",
    menu: () => "mt-1 rounded-md border border-input bg-background shadow-lg",
    menuList: () => "py-1",
    option: (state: { isFocused: boolean; isSelected: boolean }) =>
        `cursor-pointer px-3 py-2 text-sm ${state.isFocused ? "bg-muted text-foreground" : "text-foreground"} ${state.isSelected ? "bg-muted" : ""}`,
    noOptionsMessage: () => "px-3 py-2 text-sm text-muted-foreground",
    loadingMessage: () => "px-3 py-2 text-sm text-muted-foreground",
    singleValue: () => "text-foreground"
};

type FrontAsyncSelectProps = {
    cacheOptions?: boolean;
    defaultOptions?: boolean;
    isSearchable: boolean;
    instanceId: string;
    inputId: string;
    unstyled?: boolean;
    value: FrontSelectOption | null;
    loadOptions: (inputValue: string) => Promise<FrontSelectOption[]>;
    onChange: (option: FrontSelectOption | null) => void;
    placeholder?: string;
    isDisabled?: boolean;
};

export default function FrontAsyncSelect({
    cacheOptions,
    defaultOptions,
    isSearchable,
    unstyled = true,
    instanceId,
    inputId,
    value,
    loadOptions,
    onChange,
    placeholder = "Search...",
    isDisabled = false
}: FrontAsyncSelectProps) {
    return (
        <AsyncSelect<FrontSelectOption, false>
            instanceId={instanceId}
            inputId={inputId}
            cacheOptions={cacheOptions}
            defaultOptions={defaultOptions}
            unstyled={unstyled}
            classNames={unstyled ? asyncSelectClassNames : undefined}
            loadOptions={loadOptions}
            isSearchable={isSearchable}
            isDisabled={isDisabled}
            placeholder={placeholder}
            value={value}
            onChange={(option) => onChange(option)}
        />
    );
}

