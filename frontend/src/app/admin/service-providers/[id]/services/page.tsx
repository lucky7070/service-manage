"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { ArrowLeftIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, Label, Modal, Select } from "@/components/ui";
import AsyncFormSelect, { type AsyncSelectOption } from "@/components/ui/AsyncFormSelect";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { getSweetAlertConfig } from "@/helpers/utils";

type ProviderServiceRow = {
    _id: string;
    serviceTypeId: string;
    serviceTypeName: string;
    categoryName: string;
    basePrice: number | null;
    estimatedTimeMinutes: number | null;
    price: number | null;
    status: 0 | 1;
};

type ServiceTypeOption = AsyncSelectOption & {
    basePrice?: number | null;
};

const validationSchema = Yup.object().shape({
    serviceTypeId: Yup.string().trim().required("Service type is required."),
    price: Yup.number().typeError("Price must be numeric.").min(0, "Price must be 0 or greater.").required("Price is required."),
    status: Yup.number().oneOf([0, 1]).required("Status is required.")
});

export default function ServiceProviderServicesPage() {
    const { id } = useParams();
    const router = useRouter();

    const [providerName, setProviderName] = useState("");
    const [providerCategoryId, setProviderCategoryId] = useState("");
    const [rows, setRows] = useState<ProviderServiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [initialValues, setInitialValues] = useState({ _id: "", serviceTypeId: "", price: "", status: 1 });
    const [serviceType, setServiceType] = useState<ServiceTypeOption | null>(null);

    const getData = useCallback(async (isLoading = true) => {
        if (!id) return;

        setLoading(isLoading);
        const { data } = await AxiosHelperAdmin.getData(`/service-providers/${id}/services`);
        if (data.status && data.data && data.data.provider && data.data.record) {
            setProviderName(String(data.data.provider.name || ""));
            setProviderCategoryId(String(data.data.provider.serviceCategoryId || ""));
            setRows(Array.isArray(data.data.record) ? data.data.record : []);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error(data.message || "Could not load service provider.");
            setRows([]);
            router.push("/admin/service-providers");
            return;
        }
    }, [id, router]);



    useEffect(() => {
        (() => { getData(); })();
    }, [getData]);

    const loadServiceTypeOptions = useCallback(async (inputValue: string): Promise<ServiceTypeOption[]> => {
        if (!providerCategoryId) return [];

        const { data } = await AxiosHelperAdmin.getData("/service-types", { limit: 20, pageNo: 1, status: 1, categoryId: providerCategoryId, query: inputValue || "", sortBy: "name", sortOrder: "asc" });
        if (data.status && Array.isArray(data?.data?.record)) {
            return data.data.record.map((row: { _id: string; name: string; basePrice?: number | null }) => ({
                value: row._id,
                label: row.name,
                basePrice: row.basePrice ?? 0.00
            }));
        }

        return [];
    }, [providerCategoryId]);

    const openAdd = () => {
        setInitialValues({ _id: "", serviceTypeId: "", price: "", status: 1 });
        setServiceType(null);
        setOpen("add");
    };

    const openEdit = (row: ProviderServiceRow) => {
        setInitialValues({ _id: row._id, serviceTypeId: row.serviceTypeId, price: String(row.price ?? ""), status: row.status });
        setServiceType({ value: row.serviceTypeId, label: row.serviceTypeName, basePrice: row.basePrice });
        setOpen("edit");
    };

    const remove = async (row: ProviderServiceRow) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;

        const { data } = await AxiosHelperAdmin.deleteData(`/service-providers/${id}/services/${row._id}`);
        if (data.status) {
            toast.success(data.message || "Provider service removed.");
            setRows((prev) => prev.filter((r) => r._id !== row._id));
        } else {
            toast.error(data.message || "Could not remove provider service.");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Provider Services"
                subtitle={loading ? "Loading..." : providerName ? <>Manage service pricing for <span className="font-medium">{providerName}</span>.</> : "Manage provider service pricing."}
                action={
                    <div className="flex gap-2">
                        <Link href="/admin/service-providers">
                            <Button type="button" variant="secondary" size="md">
                                <ArrowLeftIcon className="h-4 w-4" /> Go Back
                            </Button>
                        </Link>
                        <PermissionBlock permission_id={3710}>
                            <Button type="button" variant="primary" size="md" onClick={openAdd}>
                                <Plus className="h-4 w-4" /> Add Service Price
                            </Button>
                        </PermissionBlock>
                    </div>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
                {loading ? (
                    <p className="py-8 text-center text-slate-500">Loading services...</p>
                ) : rows.length === 0 ? (
                    <p className="py-8 text-center text-slate-500 dark:text-slate-400">No services added for this provider yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th className="px-3 py-2">Service type</th>
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2">Base price</th>
                                    <th className="px-3 py-2">Provider price</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">{row.serviceTypeName}</td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.categoryName || "—"}</td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.basePrice ?? "—"}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.price ?? "—"}</td>
                                        <td className="px-3 py-2">
                                            <Badge variant={row.status === 1 ? "success" : "secondary"} size="sm">
                                                {row.status === 1 ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-2">
                                                <PermissionBlock permission_id={3720}>
                                                    <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(row)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </PermissionBlock>
                                                <PermissionBlock permission_id={3730}>
                                                    <Button type="button" size="sm" variant="danger" onClick={() => void remove(row)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </PermissionBlock>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal show={!!open} onClose={() => setOpen(null)} title={open === "edit" ? "Update Provider Service" : "Add Provider Service"} size="lg">
                <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={async (values, { setSubmitting, setErrors }) => {
                    const payload = { serviceTypeId: values.serviceTypeId, price: Number(values.price), status: values.status };
                    const { data } = open === "edit" ? await AxiosHelperAdmin.putData(`/service-providers/${id}/services/${values._id}`, payload) : await AxiosHelperAdmin.postData(`/service-providers/${id}/services`, payload);
                    if (data.status) {
                        toast.success(data.message || "Provider service saved.");
                        setOpen(null);
                        setSubmitting(false);
                        await getData(false);
                    } else {
                        toast.error(data.message || "Could not save provider service.");
                        setSubmitting(false);
                        setErrors(data.data);
                    }

                }}>
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="provider-service-type">Service Type</Label>
                                <AsyncFormSelect
                                    inputId="provider-service-type"
                                    loadOptions={loadServiceTypeOptions}
                                    value={serviceType}
                                    onChange={(option) => {
                                        const next = option as ServiceTypeOption | null;
                                        setServiceType(next);
                                        setFieldValue("serviceTypeId", next?.value || "");
                                        if (!values.price && next?.basePrice != null) {
                                            setFieldValue("price", String(next.basePrice));
                                        }
                                    }}
                                    placeholder="Search service type..."
                                    isDisabled={!providerCategoryId}
                                />
                                <ErrorMessage className="text-xs text-rose-600" name="serviceTypeId" component="small" />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="provider-service-price">Provider Price</Label>
                                    <Field as={Input} id="provider-service-price" name="price" type="number" min={0} />
                                    <ErrorMessage className="text-xs text-rose-600" name="price" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="provider-service-status">Status</Label>
                                    <Field as={Select} id="provider-service-status" name="status">
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setOpen(null)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
