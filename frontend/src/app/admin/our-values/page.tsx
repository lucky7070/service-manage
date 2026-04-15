"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "@/components/ui/Image";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, InputFile, Label, Modal, Select, Textarea } from "@/components/ui";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type OurValueRow = { _id: string; icon: string; title: string; description: string; displayOrder: number; status: number };
type OurValueForm = { _id: string; icon: string | File | null; title: string; description: string; displayOrder: number; status: number };

const ourValueSchema = Yup.object({
    title: Yup.string().trim().min(2, "Too short.").max(200, "Too long.").required("Title is required."),
    description: Yup.string().trim().min(3, "Too short.").max(5000, "Too long.").required("Description is required."),
    displayOrder: Yup.number().min(0, "Cannot be negative.").max(999999, "Too large.").required("Display order required."),
    status: Yup.number().required("Status required")
});

export default function AdminOurValuesPage() {
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [values, setValues] = useState<OurValueRow[]>([]);
    const [valueInitial, setValueInitial] = useState<OurValueForm>({ _id: "", icon: null, title: "", description: "", displayOrder: 0, status: 1 });

    const fetchData = useCallback(async () => {
        const valueRes = await AxiosHelperAdmin.getData("/our-values", { limit: 200, pageNo: 1 });
        setValues(valueRes.data?.status ? valueRes.data?.data?.record || [] : []);
    }, []);

    useEffect(() => { (async () => { await fetchData(); })(); }, [fetchData]);

    const deleteValue = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;
        const { data } = await AxiosHelperAdmin.deleteData(`/our-values/${id}`);
        if (data.status) {
            toast.success(data.message);
            fetchData();
        } else {
            toast.error(data.message);
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Our Values" subtitle="Manage public “about” values shown on the site." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Values</h3>
                    <PermissionBlock permission_id={431}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setValueInitial({ _id: "", icon: null, title: "", description: "", displayOrder: 0, status: 1 });
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Value
                        </Button>
                    </PermissionBlock>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Icon</th>
                                <th className="px-3 py-2">Title</th>
                                <th className="px-3 py-2">Description</th>
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {values.map((row) => {
                                const thumb = resolveFileUrl(row.icon);
                                return <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2">
                                        <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                            {thumb ? (
                                                <Image src={thumb} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.title}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="line-clamp-2">{row.description}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.displayOrder}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-2">
                                            <PermissionBlock permission_id={432}>
                                                <Button size="sm" variant="secondary" onClick={() => { setValueInitial(row); setOpen("edit"); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={433}>
                                                <Button size="sm" variant="danger" onClick={() => deleteValue(row._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            })}
                            <AdminNoTableRecords show={values.length === 0} />
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={!!open} onClose={() => setOpen(null)} title={open === "add" ? "Add Our Value" : "Update Our Value"} size="lg">
                <Formik
                    initialValues={valueInitial}
                    enableReinitialize
                    validationSchema={ourValueSchema}
                    onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                        if (open === "add" && !(values.icon instanceof File)) {
                            setErrors({ icon: "Icon image is required." });
                            setSubmitting(false);
                            return;
                        }
                        if (open === "add") {
                            const { data } = await AxiosHelperAdmin.postData("/our-values", values, true);
                            if (data?.status) {
                                toast.success(data.message);
                                setOpen(null);
                                fetchData();
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data);
                            }
                        } else {
                            const { data } = await AxiosHelperAdmin.putData(`/our-values/${values._id}`, values, true);
                            if (data?.status) {
                                toast.success(data.message);
                                setOpen(null);
                                fetchData();
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data);
                            }
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="space-y-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label>Icon</Label>
                                    <InputFile
                                        accept="image/*"
                                        value={typeof values.icon === "string" ? values.icon : undefined}
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0] || null;
                                            setFieldValue("icon", file);
                                        }}
                                    />
                                    {typeof values.icon === "string" && values.icon ? (
                                        <div className="mt-2 h-12 w-12 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                                            <Image src={resolveFileUrl(values.icon) || ""} alt="Current icon" width={48} height={48} className="h-full w-full object-cover" />
                                        </div>
                                    ) : null}
                                    <ErrorMessage name="icon" component="small" className="text-xs text-rose-600" />
                                </div>
                                <div>
                                    <Label>Display order</Label>
                                    <Field as={Input} name="displayOrder" type="number" min={0} />
                                    <ErrorMessage name="displayOrder" component="small" className="text-xs text-rose-600" />
                                </div>
                            </div>
                            <div>
                                <Label>Title</Label>
                                <Field as={Input} name="title" />
                                <ErrorMessage name="title" component="small" className="text-xs text-rose-600" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Field as={Textarea} name="description" className="min-h-24" />
                                <ErrorMessage name="description" component="small" className="text-xs text-rose-600" />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Field as={Select} name="status">
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </Field>
                                <ErrorMessage name="status" component="small" className="text-xs text-rose-600" />
                            </div>
                            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : open === "add" ? "Create Value" : "Update Value"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
