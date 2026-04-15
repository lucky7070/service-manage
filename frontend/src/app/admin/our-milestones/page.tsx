"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Select, Textarea } from "@/components/ui";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type OurMilestone = { _id: string; year: string; event: string; displayOrder: number; status: number };

const ourMilestoneSchema = Yup.object({
    year: Yup.string().trim().min(2, "Too short.").max(20, "Too long.").required("Year is required."),
    event: Yup.string().trim().min(3, "Too short.").max(5000, "Too long.").required("Event is required."),
    displayOrder: Yup.number().min(0, "Cannot be negative.").max(999999, "Too large.").required("Display order required."),
    status: Yup.number().required("Status required")
});

export default function AdminOurMilestonesPage() {
    const [milestones, setMilestones] = useState<OurMilestone[]>([]);
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [milestoneInitial, setMilestoneInitial] = useState<OurMilestone>({ _id: "", year: "", event: "", displayOrder: 0, status: 1 });

    const fetchData = useCallback(async () => {
        const milestoneRes = await AxiosHelperAdmin.getData("/our-milestones", { limit: 200, pageNo: 1 });
        setMilestones(milestoneRes.data?.status ? milestoneRes.data?.data?.record || [] : []);
    }, []);

    useEffect(() => { (async () => { await fetchData(); })(); }, [fetchData]);

    const deleteMilestone = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;
        const { data } = await AxiosHelperAdmin.deleteData(`/our-milestones/${id}`);
        if (data.status) {
            toast.success(data.message);
            fetchData();
        } else {
            toast.error(data.message);
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Our Milestones" subtitle="Manage public timeline milestones on the about page." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Milestones</h3>
                    <PermissionBlock permission_id={441}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setMilestoneInitial({ _id: "", year: "", event: "", displayOrder: 0, status: 1 });
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Milestone
                        </Button>
                    </PermissionBlock>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Year</th>
                                <th className="px-3 py-2">Event</th>
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {milestones.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant="secondary">{row.year}</Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <span className="line-clamp-2">{row.event}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.displayOrder}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                            {row.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-2">
                                            <PermissionBlock permission_id={442}>
                                                <Button size="sm" variant="secondary" onClick={() => { setMilestoneInitial(row); setOpen("edit"); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={443}>
                                                <Button size="sm" variant="danger" onClick={() => deleteMilestone(row._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            <AdminNoTableRecords show={milestones.length === 0} />
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={!!open} onClose={() => setOpen(null)} title={open === "add" ? "Add Our Milestone" : "Update Our Milestone"} size="lg">
                <Formik
                    initialValues={milestoneInitial}
                    enableReinitialize
                    validationSchema={ourMilestoneSchema}
                    onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                        if (open === "add") {
                            const { data } = await AxiosHelperAdmin.postData("/our-milestones", values)
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
                            const { data } = await AxiosHelperAdmin.putData(`/our-milestones/${values._id}`, values);
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
                    {({ isSubmitting }) => (
                        <Form className="space-y-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label>Year</Label>
                                    <Field as={Input} name="year" />
                                    <ErrorMessage name="year" component="small" className="text-xs text-rose-600" />
                                </div>
                                <div>
                                    <Label>Display order</Label>
                                    <Field as={Input} name="displayOrder" type="number" min={0} />
                                    <ErrorMessage name="displayOrder" component="small" className="text-xs text-rose-600" />
                                </div>
                            </div>
                            <div>
                                <Label>Event</Label>
                                <Field as={Textarea} name="event" className="min-h-24" />
                                <ErrorMessage name="event" component="small" className="text-xs text-rose-600" />
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
                                {isSubmitting ? "Saving..." : open === "add" ? "Create Milestone" : "Update Milestone"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
