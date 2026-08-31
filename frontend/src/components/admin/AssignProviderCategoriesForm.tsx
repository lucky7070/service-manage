import { useEffect, useMemo, useState } from "react";
import { ErrorMessage, Formik, Form, FormikProps } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { CheckCheck, Layers, Loader2, Search, X } from "lucide-react";
import { Button, Input } from "../ui";
import AxiosHelper from "@/helpers/AxiosHelper";

type CategoryOption = { _id: string; name: string };

type AssignProviderCategoriesFormProps = {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onCancel: () => void;
    onSaved: () => void;
    initialValues: { _id: string; serviceCategoryIds: string[] };
    primaryCategoryId: string;
    primaryCategoryName?: string;
    putCategories: (providerId: string, serviceCategoryIds: string[]) => Promise<{ status?: boolean; message?: string; data?: Record<string, string> }>;
};

function AssignProviderCategoriesForm({
    searchQuery,
    onSearchChange,
    onCancel,
    onSaved,
    initialValues,
    primaryCategoryId,
    primaryCategoryName,
    putCategories
}: AssignProviderCategoriesFormProps) {
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        const loadCategories = async () => {
            setLoading(true);
            const { data } = await AxiosHelper.getData("/service-categories-list", { query: searchQuery.trim(), limit: 100, status: 1 });
            if (!active) return;
            if (data.status && Array.isArray(data.data)) {
                setCategoryOptions(data.data.map((row: { value: string; label: string }) => ({ _id: String(row.value), name: String(row.label) })));
            } else {
                setCategoryOptions([]);
            }
            setLoading(false);
        };

        void loadCategories();
        return () => { active = false; };
    }, [searchQuery]);

    const mergedOptions = useMemo(() => {
        const byId = new Map(categoryOptions.map((option) => [option._id, option]));
        if (primaryCategoryId && !byId.has(primaryCategoryId)) {
            byId.set(primaryCategoryId, { _id: primaryCategoryId, name: primaryCategoryName || "Primary category" });
        }
        initialValues.serviceCategoryIds.forEach((id) => {
            if (!byId.has(id)) byId.set(id, { _id: id, name: "Assigned category" });
        });
        return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
    }, [categoryOptions, initialValues.serviceCategoryIds, primaryCategoryId, primaryCategoryName]);

    const filteredCategories = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return mergedOptions;
        return mergedOptions.filter((category) => category.name.toLowerCase().includes(q));
    }, [mergedOptions, searchQuery]);

    const resolveCategoryName = (id: string) => mergedOptions.find((category) => category._id === id)?.name || "Unknown category";

    const categoriesValidationSchema = Yup.object().shape({
        serviceCategoryIds: Yup.array().of(Yup.string().required()).min(1, "At least one service category is required.").required()
    });

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={categoriesValidationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const payloadIds = [...new Set([primaryCategoryId, ...values.serviceCategoryIds].filter(Boolean))];
                const result = await putCategories(values._id, payloadIds);
                if (result?.status) {
                    toast.success(result.message || "Service categories updated.");
                    onSaved();
                } else {
                    toast.error(result?.message || "Could not update service categories.");
                    setErrors(result?.data || {});
                }
                setSubmitting(false);
            }}
        >
            {({ values, setFieldValue, isSubmitting }: FormikProps<{ _id: string; serviceCategoryIds: string[] }>) => {
                const selectedSet = new Set(values.serviceCategoryIds);
                const visibleIds = filteredCategories.map((category) => category._id);
                const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id) || id === primaryCategoryId);
                const someVisibleSelected = visibleIds.some((id) => selectedSet.has(id));

                const toggleCategory = (categoryId: string) => {
                    if (categoryId === primaryCategoryId) return;
                    if (selectedSet.has(categoryId)) {
                        setFieldValue("serviceCategoryIds", values.serviceCategoryIds.filter((id) => id !== categoryId));
                    } else {
                        setFieldValue("serviceCategoryIds", [...values.serviceCategoryIds, categoryId]);
                    }
                };

                const selectVisible = () => {
                    setFieldValue("serviceCategoryIds", [...new Set([...values.serviceCategoryIds, ...visibleIds])]);
                };

                const deselectVisible = () => {
                    const visible = new Set(visibleIds.filter((id) => id !== primaryCategoryId));
                    setFieldValue("serviceCategoryIds", values.serviceCategoryIds.filter((id) => !visible.has(id) || id === primaryCategoryId));
                };

                const displayIds = [...new Set([primaryCategoryId, ...values.serviceCategoryIds].filter(Boolean))];

                return (
                    <Form className="space-y-4">
                        <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/80 to-white p-3 dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-900">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Assigned categories
                                    <span className="ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                        {displayIds.length}
                                    </span>
                                </p>
                            </div>
                            {primaryCategoryId ? (
                                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                                    Primary category: <span className="font-medium text-slate-700 dark:text-slate-200">{primaryCategoryName || resolveCategoryName(primaryCategoryId)}</span>
                                    {" "}(always included)
                                </p>
                            ) : null}
                            {displayIds.length === 0 ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">No categories selected yet.</p>
                            ) : (
                                <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                                    {displayIds.map((id) => {
                                        const isPrimary = id === primaryCategoryId;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => toggleCategory(id)}
                                                disabled={isPrimary}
                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm transition ${isPrimary
                                                    ? "cursor-default border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-100"
                                                    : "border-indigo-200 bg-white text-indigo-800 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-indigo-500/30 dark:bg-slate-800 dark:text-indigo-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                                                    }`}
                                            >
                                                <Layers className="h-3 w-3 shrink-0 opacity-70" />
                                                <span className="max-w-35 truncate">{resolveCategoryName(id)}{isPrimary ? " · Primary" : ""}</span>
                                                {!isPrimary ? <X className="h-3 w-3 shrink-0 opacity-60" /> : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search categories by name..."
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
                                    {loading
                                        ? "Loading categories..."
                                        : searchQuery.trim()
                                            ? `Showing ${filteredCategories.length} match${filteredCategories.length === 1 ? "" : "es"}`
                                            : `${mergedOptions.length} categor${mergedOptions.length === 1 ? "y" : "ies"} available`}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={loading || filteredCategories.length === 0 || allVisibleSelected}
                                        className="font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400"
                                        onClick={selectVisible}
                                    >
                                        Select {searchQuery.trim() ? "matching" : "all"}
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                    <button
                                        type="button"
                                        disabled={loading || !someVisibleSelected}
                                        className="font-medium text-slate-600 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300"
                                        onClick={deselectVisible}
                                    >
                                        Deselect {searchQuery.trim() ? "matching" : "extra"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="relative min-h-55 rounded-xl border border-indigo-100 dark:border-slate-700">
                            {loading ? (
                                <div className="flex h-55 flex-col items-center justify-center gap-2 text-sm text-slate-500">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                    Loading categories...
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="flex h-55 flex-col items-center justify-center gap-1 px-4 text-center text-sm text-slate-500">
                                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    <p>{searchQuery.trim() ? "No categories match your search." : "No active categories found."}</p>
                                </div>
                            ) : (
                                <div className="grid max-h-80 gap-1 overflow-y-auto p-2 sm:grid-cols-2">
                                    {filteredCategories.map((category) => {
                                        const checked = selectedSet.has(category._id) || category._id === primaryCategoryId;
                                        const isPrimary = category._id === primaryCategoryId;
                                        return (
                                            <button
                                                key={category._id}
                                                type="button"
                                                onClick={() => toggleCategory(category._id)}
                                                disabled={isPrimary}
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
                                                <span className="min-w-0 flex-1 truncate font-medium">
                                                    {category.name}
                                                    {isPrimary ? " (Primary)" : ""}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <ErrorMessage className="text-xs text-rose-600" name="serviceCategoryIds" component="small" />
                        <div className="flex justify-end gap-2 border-t border-indigo-100 pt-3 dark:border-slate-700">
                            <Button type="button" variant="secondary" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting || loading || !primaryCategoryId}>
                                {isSubmitting ? "Saving..." : `Save ${displayIds.length} categor${displayIds.length === 1 ? "y" : "ies"}`}
                            </Button>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}

export default AssignProviderCategoriesForm;
