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
    isLoading = false,
    menuPortalTarget,
    menuPosition,
    isClearable = false
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
            isClearable={isClearable}
            placeholder={placeholder}
            value={value}
            onChange={(option) => onChange(option as SelectOption | null)}
            menuPortalTarget={menuPortalTarget ?? undefined}
            menuPosition={menuPosition}
            styles={menuPortalTarget ? { menuPortal: (base) => ({ ...base, zIndex: 10000 }) } : undefined}
        />
    );
}
