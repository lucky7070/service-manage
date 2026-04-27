"use client";

import Select from "react-select";
import { AsyncFormSelectProps, selectClassNames, SelectOption } from "./AsyncSelect";

export default function ReactSelect({
    options,
    isSearchable = true,
    unstyled = true,
    instanceId,
    inputId,
    value,
    onChange,
    placeholder = "Select...",
    isDisabled = false,
    isLoading = false
}: AsyncFormSelectProps) {
    return (
        <Select<SelectOption, false>
            instanceId={instanceId}
            inputId={inputId}
            options={options}
            unstyled={unstyled}
            classNames={unstyled ? selectClassNames : undefined}
            isSearchable={isSearchable}
            isDisabled={isDisabled}
            isLoading={isLoading}
            placeholder={placeholder}
            value={value}
            onChange={(option) => onChange(option as SelectOption | null)}
        />
    );
}
