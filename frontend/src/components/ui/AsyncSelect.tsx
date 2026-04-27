"use client";

import ReactAsyncSelect from "react-select/async";

export type SelectOption = {
    value: string;
    label: string;
};

export type AsyncFormSelectProps = {
    inputId: string;
    value: SelectOption | null;
    onChange: (option: SelectOption | null) => void;
    placeholder?: string;
    isDisabled?: boolean;
    cacheOptions?: boolean;
    defaultOptions?: boolean;
    options?: SelectOption[];
    loadOptions?: (inputValue: string) => Promise<SelectOption[]>;
    isSearchable?: boolean;
    instanceId?: string;
    unstyled?: boolean;
    isLoading?: boolean;
};

export const selectClassNames = {
    control: (state: { isFocused: boolean }) => `h-9 rounded-md border bg-white px-3 text-sm text-slate-900 shadow-xs transition-[color,box-shadow] dark:bg-slate-800 dark:text-slate-100 ${state.isFocused ? "border-indigo-400 ring-[3px] ring-indigo-200 dark:border-indigo-300 dark:ring-indigo-500/30" : "border-indigo-100 dark:border-indigo-100"}`,
    valueContainer: () => "p-0",
    input: () => "m-0 p-0 text-sm text-slate-900 dark:text-slate-100",
    placeholder: () => "text-slate-400 dark:text-slate-400",
    indicatorsContainer: () => "gap-1",
    indicatorSeparator: () => "hidden",
    dropdownIndicator: () => "text-slate-500 dark:text-slate-300",
    clearIndicator: () => "text-slate-500 dark:text-slate-300",
    menu: () => "mt-1 rounded-md border border-indigo-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800",
    menuList: () => "py-1",
    option: (state: { isFocused: boolean; isSelected: boolean }) => `cursor-pointer px-3 py-2 text-sm ${state.isFocused ? "bg-indigo-50 text-indigo-700 dark:bg-slate-700 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"} ${state.isSelected ? "bg-indigo-100 dark:bg-slate-700" : ""}`,
    noOptionsMessage: () => "px-3 py-2 text-sm text-slate-500 dark:text-slate-400",
    loadingMessage: () => "px-3 py-2 text-sm text-slate-500 dark:text-slate-400",
    singleValue: () => "text-slate-900 dark:text-slate-100"
}

export default function AsyncSelect({
    inputId,
    value,
    loadOptions,
    onChange,
    placeholder = "Search Here...",
    isDisabled = false,
    cacheOptions = true,
    defaultOptions = true,
    isLoading = false
}: AsyncFormSelectProps) {
    return (
        <ReactAsyncSelect
            inputId={inputId}
            cacheOptions={cacheOptions}
            defaultOptions={defaultOptions}
            loadOptions={loadOptions}
            value={value}
            unstyled
            isDisabled={isDisabled}
            onChange={(option) => onChange(option as SelectOption | null)}
            placeholder={placeholder}
            classNames={selectClassNames}
            isLoading={isLoading}
        />
    );
}

