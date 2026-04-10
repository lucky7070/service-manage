"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Input, InputFile, Label, Select, Textarea } from "@/components/ui";
import PermissionBlock from "@/components/admin/PermissionBlock";

type SettingRow = {
    _id: string;
    setting_type: number;
    setting_name: string;
    filed_label: string;
    filed_type: "text" | "file" | "number" | "textarea" | "check";
    filed_value: string;
    status: number;
};

type GroupedSettings = Record<string, SettingRow[]>;

const TYPE_LABELS: Record<number, string> = {
    1: "Application Setting",
    2: "Social Links",
    3: "Email Setting",
    4: "Payment Setting",
    5: "SMS Setting",
    6: "App Controls"
};

export default function AdminSettingsPage() {
    const [grouped, setGrouped] = useState<GroupedSettings>({});
    const [selectedType, setSelectedType] = useState<number>(1);
    const [loading, setLoading] = useState(false);

    const currentSettings = useMemo(() => grouped[String(selectedType)] || [], [grouped, selectedType]);

    const initialValues = useMemo(() => {
        const out: Record<string, string | File> = {};
        currentSettings.forEach((row) => {
            out[row.setting_name] = row.filed_value || "";
        });
        return out;
    }, [currentSettings]);

    const validationSchema = useMemo(() => {
        const shape: Record<string, Yup.StringSchema> = {};
        currentSettings.forEach((row) => {
            if (row.filed_type === "file") return;

            let validator = Yup.string().required(`${row.filed_label} is required.`);
            if (row.setting_name.toLowerCase().includes("email")) validator = validator.email("Invalid email");
            if (row.filed_type === "number") validator = validator.matches(/^\d+(\.\d+)?$/, `${row.filed_label} must be numeric.`);
            shape[row.setting_name] = validator;
        });
        return Yup.object().shape(shape);
    }, [currentSettings]);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await AxiosHelperAdmin.getData("/settings");
            if (data.status && data.data) {
                setGrouped(data.data);
                const availableTypes = Object.keys(data.data).map((x) => Number(x));
                if (availableTypes.length && !availableTypes.includes(selectedType)) setSelectedType(availableTypes[0]);
            } else {
                setGrouped({});
            }
        } catch {
            setGrouped({});
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    }, [selectedType]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Settings" subtitle="Update platform configuration and operations controls." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {Object.keys(grouped).map((key) => {
                        const type = Number(key);
                        return <Button key={key} type="button" size="sm" variant={selectedType === type ? "primary" : "secondary"} onClick={() => setSelectedType(type)}>
                            {TYPE_LABELS[type] || `Type ${type}`}
                        </Button>
                    })}
                </div>

                {!currentSettings.length ? (
                    <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                        {loading ? "Loading settings..." : "No settings found. Defaults are loaded via the backend seed script (see project README)."}
                    </div>
                ) : (
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting, setErrors }) => {
                            const formData = new FormData();
                            currentSettings.forEach((row) => {
                                const value = values[row.setting_name];
                                if (value instanceof File) {
                                    formData.append(row.setting_name, value);
                                } else if (value !== undefined && value !== null) {
                                    formData.append(row.setting_name, String(value));
                                }
                            });

                            const { data } = await AxiosHelperAdmin.putData(`/settings/${selectedType}`, formData, true);
                            if (data?.status) {
                                toast.success(data.message || "Settings updated");
                                fetchSettings();
                            } else {
                                toast.error(data?.message || "Update failed");
                                if (data?.data && typeof data.data === "object") setErrors(data.data);
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, setFieldValue }) => (
                            <Form className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    {currentSettings.map((row) => (
                                        <div key={row._id} className={row.filed_type === "textarea" ? "space-y-1 md:col-span-2" : "space-y-1"}>
                                            <Label htmlFor={row.setting_name}>{row.filed_label}</Label>

                                            {row.filed_type === "textarea" ? (
                                                <Field as={Textarea} id={row.setting_name} name={row.setting_name} className="min-h-24" />
                                            ) : row.filed_type === "check" ? (
                                                <Field as={Select} id={row.setting_name} name={row.setting_name}>
                                                    <option value="1">Enabled</option>
                                                    <option value="0">Disabled</option>
                                                </Field>
                                            ) : row.filed_type === "file" ? (
                                                <div className="space-y-2">
                                                    <InputFile
                                                        id={row.setting_name}
                                                        name={row.setting_name}
                                                        accept="image/*"
                                                        className="w-full"
                                                        onChange={(e) => {
                                                            const file = e.currentTarget.files?.[0];
                                                            if (file) setFieldValue(row.setting_name, file);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <Field
                                                    as={Input}
                                                    id={row.setting_name}
                                                    name={row.setting_name}
                                                    type={row.filed_type === "number" ? "number" : "text"}
                                                />
                                            )}

                                            <ErrorMessage className="text-xs text-rose-600" name={row.setting_name} component="small" />
                                        </div>
                                    ))}
                                </div>

                                <PermissionBlock permission_id={100}>
                                    <div className="flex justify-end">
                                        <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                                            {isSubmitting ? "Saving..." : "Save Settings"}
                                        </Button>
                                    </div>
                                </PermissionBlock>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </section>
    );
}
