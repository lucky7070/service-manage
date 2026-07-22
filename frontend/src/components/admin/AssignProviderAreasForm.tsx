import { useMemo } from "react";
import { ErrorMessage, Formik, Form, FormikProps } from "formik";
import * as Yup from "yup";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { toast } from "react-toastify";
import { CheckCheck, Loader2, MapPin, Search, X } from "lucide-react";
import { Button, Input } from "../ui";

type AreaOption = { _id: string; name: string };
type AssignProviderAreasFormProps = {
    areaOptions: AreaOption[];
    areasLoading: boolean;
    areasTotalCount: number;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onCancel: () => void;
    onSaved: () => void;
    initialValues: { _id: string; areaIds: string[] };
};

function AssignProviderAreasForm({
    areaOptions,
    areasLoading,
    areasTotalCount,
    searchQuery,
    onSearchChange,
    onCancel,
    onSaved,
    initialValues
}: AssignProviderAreasFormProps) {
    const filteredAreas = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return areaOptions;
        return areaOptions.filter((area) => area.name.toLowerCase().includes(q));
    }, [areaOptions, searchQuery]);

    const resolveAreaName = (id: string) => areaOptions.find((area) => area._id === id)?.name || "Unknown area";

    const areasValidationSchema = Yup.object().shape({
        areaIds: Yup.array().of(Yup.string().required()).required()
    });

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={areasValidationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const { data } = await AxiosHelperAdmin.putData(`/service-providers/${values._id}/areas`, { areaIds: values.areaIds });
                if (data?.status) {
                    toast.success(data.message);
                    onSaved();
                } else {
                    toast.error(data?.message);
                    setErrors(data?.data || {});
                }
                setSubmitting(false);
            }}
        >
            {({ values, setFieldValue, isSubmitting }: FormikProps<{ _id: string; areaIds: string[] }>) => {
                const selectedSet = new Set(values.areaIds);
                const visibleIds = filteredAreas.map((area) => area._id);
                const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
                const someVisibleSelected = visibleIds.some((id) => selectedSet.has(id));

                const toggleArea = (areaId: string) => {
                    if (selectedSet.has(areaId)) {
                        setFieldValue("areaIds", values.areaIds.filter((id) => id !== areaId));
                    } else {
                        setFieldValue("areaIds", [...values.areaIds, areaId]);
                    }
                };

                const selectVisible = () => {
                    setFieldValue("areaIds", [...new Set([...values.areaIds, ...visibleIds])]);
                };

                const deselectVisible = () => {
                    const visible = new Set(visibleIds);
                    setFieldValue("areaIds", values.areaIds.filter((id) => !visible.has(id)));
                };

                return (
                    <Form className="space-y-4">
                        <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/80 to-white p-3 dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-900">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Selected areas
                                    <span className="ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                        {values.areaIds.length}
                                    </span>
                                </p>
                                {values.areaIds.length > 0 ? (
                                    <button
                                        type="button"
                                        className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                                        onClick={() => setFieldValue("areaIds", [])}
                                    >
                                        Clear all
                                    </button>
                                ) : null}
                            </div>
                            {values.areaIds.length === 0 ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">No areas selected yet. Search below and pick the areas this provider serves.</p>
                            ) : (
                                <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                                    {values.areaIds.map((id) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => toggleArea(id)}
                                            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-800 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-indigo-500/30 dark:bg-slate-800 dark:text-indigo-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                                        >
                                            <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                                            <span className="max-w-35 truncate">{resolveAreaName(id)}</span>
                                            <X className="h-3 w-3 shrink-0 opacity-60" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search areas by name..."
                                    className="pl-9 pr-9"
                                    autoComplete="off"
                                />
                                {searchQuery ? (
                                    <button
                                        type="button"
                                        aria-label="Clear search"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                        onClick={() => onSearchChange("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                    {areasLoading
                                        ? "Loading areas..."
                                        : searchQuery.trim()
                                            ? `Showing ${filteredAreas.length} match${filteredAreas.length === 1 ? "" : "es"}`
                                            : `${areasTotalCount || areaOptions.length} area${(areasTotalCount || areaOptions.length) === 1 ? "" : "s"} in city`}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={areasLoading || filteredAreas.length === 0 || allVisibleSelected}
                                        className="font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400"
                                        onClick={selectVisible}
                                    >
                                        Select {searchQuery.trim() ? "matching" : "all"}
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                    <button
                                        type="button"
                                        disabled={areasLoading || !someVisibleSelected}
                                        className="font-medium text-slate-600 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300"
                                        onClick={deselectVisible}
                                    >
                                        Deselect {searchQuery.trim() ? "matching" : "all"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="relative min-h-55 rounded-xl border border-indigo-100 dark:border-slate-700">
                            {areasLoading ? (
                                <div className="flex h-55 flex-col items-center justify-center gap-2 text-sm text-slate-500">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                    Loading areas...
                                </div>
                            ) : filteredAreas.length === 0 ? (
                                <div className="flex h-55 flex-col items-center justify-center gap-1 px-4 text-center text-sm text-slate-500">
                                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    <p>{searchQuery.trim() ? "No areas match your search." : "No active areas found for this city."}</p>
                                </div>
                            ) : (
                                <div className="grid max-h-80 gap-1 overflow-y-auto p-2 sm:grid-cols-2">
                                    {filteredAreas.map((area) => {
                                        const checked = selectedSet.has(area._id);
                                        return (
                                            <button
                                                key={area._id}
                                                type="button"
                                                onClick={() => toggleArea(area._id)}
                                                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition ${checked
                                                    ? "border-indigo-300 bg-indigo-50 text-indigo-900 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-100"
                                                    : "border-transparent bg-slate-50 text-slate-700 hover:border-indigo-100 hover:bg-white dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked
                                                    ? "border-indigo-500 bg-indigo-500 text-white"
                                                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                                                    }`}>
                                                    {checked ? <CheckCheck className="h-3.5 w-3.5" /> : null}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate font-medium">{area.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <ErrorMessage className="text-xs text-rose-600" name="areaIds" component="small" />
                        <div className="flex justify-end gap-2 border-t border-indigo-100 pt-3 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting || areasLoading}>
                                {isSubmitting ? "Saving..." : `Save ${values.areaIds.length} area${values.areaIds.length === 1 ? "" : "s"}`}
                            </Button>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}

export default AssignProviderAreasForm