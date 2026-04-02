"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@/components/ui/Image";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Link from "next/link";
import { CircleCheckBig, ImageIcon, Images, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, InputFile, Label, Modal, Select, Textarea } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { PHONE_ERROR_MESSAGE, PHONE_REGEXP, ProfileStatus, SERVICE_PROVIDER_PROFILE_STATUSES } from "@/config";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type ServiceProvider = {
    _id: string;
    name: string;
    mobile: string;
    email: string;
    panCardNumber: string;
    aadharNumber: string;
    image: File | string | null;
    panCardDocument: File | string | null;
    aadharDocument: File | string | null;
    experienceYears: number | "";
    experienceDescription: string;
    profileStatus: ProfileStatus;

    userId?: string;
    isVerified?: boolean;
    isActive?: boolean;
    createdAt?: string;
};

type ServiceProviderRecord = {
    count: number;
    record: ServiceProvider[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "name" | "mobile" | "email" | "userId" | "profileStatus" | "createdAt";
type SortOrder = "asc" | "desc";

const INITIAL_VALUES: ServiceProvider = { _id: "", name: "", mobile: "", email: "", panCardNumber: "", aadharNumber: "", experienceYears: "", experienceDescription: "", image: null, panCardDocument: null, aadharDocument: null, profileStatus: "pending" };

const statusValidationSchema = Yup.object().shape({
    profileStatus: Yup.string().oneOf(SERVICE_PROVIDER_PROFILE_STATUSES).required("Profile status is required."),
    isVerified: Yup.boolean().required("Verification status is required.")
});

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too short.").max(100, "Too long.").required("Name is required.").trim(),
    mobile: Yup.string().matches(PHONE_REGEXP, PHONE_ERROR_MESSAGE).length(10, "10 digits required.").required("Mobile is required."),
    email: Yup.string().email("Invalid email.").required("Email is required."),
    panCardNumber: Yup.string().matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, "PAN format: ABCDE1234F").required("PAN is required."),
    aadharNumber: Yup.string().matches(/^[0-9]{12}$/, "Aadhar must be 12 digits.").required("Aadhar is required."),
    experienceYears: Yup.mixed().test("exp", "0–80 years", (v) => {
        if (v === "" || v === undefined || v === null) return true;
        const n = Number(v);
        return !Number.isNaN(n) && n >= 0 && n <= 80;
    }),
    experienceDescription: Yup.string().max(5000, "Too long.").nullable(),
});

export default function AdminServiceProvidersPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [statusOpen, setStatusOpen] = useState(false);
    const [data, setData] = useState<ServiceProviderRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; profileStatus: "" | ProfileStatus; }>({ limit: 10, pageNo: 1, query: "", sortBy: "createdAt", sortOrder: "desc", profileStatus: "" });
    const [initialValues, setInitialValues] = useState<ServiceProvider>(INITIAL_VALUES);
    const [statusValues, setStatusValues] = useState<{ _id: string; userId: string; name: string; mobile: string; email: string; profileStatus: ProfileStatus; isVerified: boolean }>({
        _id: "",
        userId: "",
        name: "",
        mobile: "",
        email: "",
        profileStatus: "pending",
        isVerified: false
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fetchRows = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/service-providers", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchRows(); }, 500);
    }, [fetchRows]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/service-providers/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchRows();
            } else {
                toast.error(data.message);
            }
        }
    };

    const onSort = (nextSortBy: SortBy) => {
        setParam((prev) => {
            const nextOrder: SortOrder = prev.sortBy === nextSortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc";
            return { ...prev, pageNo: 1, sortBy: nextSortBy, sortOrder: nextOrder };
        });
    };

    const openEdit = async (data: ServiceProvider) => {
        setOpen("edit");
        setInitialValues({
            _id: String(data._id),
            name: String(data.name ?? ""),
            mobile: String(data.mobile ?? ""),
            email: String(data.email ?? ""),
            panCardNumber: String(data.panCardNumber ?? ""),
            aadharNumber: String(data.aadharNumber ?? ""),
            experienceYears: data.experienceYears ?? 0,
            experienceDescription: String(data.experienceDescription ?? ""),
            profileStatus: data.profileStatus || "pending",
            image: data.image || null,
            panCardDocument: data.panCardDocument || null,
            aadharDocument: data.aadharDocument || null,
        });

        if (typeof data.image === 'string') setImagePreview(resolveFileUrl(data.image));
    };

    const openStatusModal = (row: ServiceProvider) => {
        setStatusValues({
            _id: row._id,
            userId: row.userId || "—",
            name: row.name || "—",
            mobile: row.mobile || "—",
            email: row.email || "—",
            profileStatus: row.profileStatus || "pending",
            isVerified: Boolean(row.isVerified)
        });
        setStatusOpen(true);
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Service providers"
                subtitle="Onboard providers with KYC-style fields. Profile status is managed here; verification and live location are system-controlled."
                action={
                    <PermissionBlock permission_id={371}>
                        <Button type="button" variant="primary" size="md" onClick={() => {
                            setInitialValues(INITIAL_VALUES);
                            setOpen("add");
                        }}>
                            <Plus className="h-3.5 w-3.5" />
                            Create service Provider
                        </Button>
                    </PermissionBlock>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search name, mobile, email, user ID, PAN..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={param.profileStatus}
                            onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, profileStatus: e.target.value === "" ? "" : (e.target.value as ProfileStatus) }))}
                            className="max-w-[180px]"
                        >
                            <option value="">All statuses</option>
                            {SERVICE_PROVIDER_PROFILE_STATUSES.map((k) => (
                                <option key={k} value={k} className="capitalize">{k}</option>
                            ))}
                        </Select>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2 w-14"></th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("userId")} name="User ID" active={param.sortBy === "userId"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={param.sortBy === "name"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("mobile")} name="Mobile" active={param.sortBy === "mobile"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("email")} name="Email" active={param.sortBy === "email"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("profileStatus")} name="Profile status" active={param.sortBy === "profileStatus"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Verified</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const thumb = resolveFileUrl(row.image as string | null);
                                return <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 align-middle">
                                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                            {thumb ? (
                                                <Image src={thumb} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-300">{row.userId || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.mobile}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.email}</td>
                                    <td className="px-3 py-2">
                                        <Badge
                                            className="capitalize"
                                            variant={
                                                row.profileStatus === "approved" ? "success"
                                                    : row.profileStatus === "pending" ? "secondary"
                                                        : row.profileStatus === "suspended" ? "warning"
                                                            : row.profileStatus === "rejected" ? "danger"
                                                                : "secondary"
                                            }
                                            size="sm"
                                        >
                                            {row.profileStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.isVerified ? "success" : "warning"} size="sm">
                                            {row.isVerified ? "Yes" : "No"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={378}>
                                                <Link
                                                    href={`/admin/service-providers/${row._id}/images`}
                                                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-secondary-200 px-3 text-xs font-medium text-secondary-900 transition-all hover:bg-secondary-300 dark:bg-secondary-700 dark:text-white dark:hover:bg-secondary-600"
                                                    title="Work Photos"
                                                    aria-label="Work Photos"
                                                >
                                                    <Images className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Link>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={372}>
                                                <Button size="sm" variant="primary" onClick={() => openStatusModal(row)} title="Update status" aria-label="Update status">
                                                    <CircleCheckBig className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={372}>
                                                <Button size="sm" variant="secondary" onClick={() => openEdit(row)} title="Edit" aria-label="Edit">
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={373}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete" aria-label="Delete">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>
                            })}
                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <Modal
                show={!!open}
                onClose={() => setOpen(null)}
                title={open === "add" ? "Create service provider" : "Update service provider"}
                subTitle="Required: name, mobile, email, PAN, Aadhar. Optional: photo, document uploads, experience."
                size="lg"
                scrollable
            >
                <div className="space-y-4">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        validationContext={{ mode: open === "edit" ? "edit" : "add" }}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            if (open === "add") {
                                const { data } = await AxiosHelperAdmin.postData("/service-providers", values, true);
                                if (data.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchRows();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/service-providers/${values._id}`, values, true);
                                if (data.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchRows();
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
                                <div className="space-y-2">
                                    <Label>Profile Photo <span className="font-normal text-slate-500">(optional)</span></Label>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                            {imagePreview && typeof imagePreview === 'string' ? (
                                                <Image src={imagePreview || ""} alt={imagePreview} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                                            )}
                                        </div>
                                        <InputFile
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setFieldValue('image', f);
                                                    setImagePreview(URL.createObjectURL(f));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="sp-name">Name <span className="text-red-500">*</span> </Label>
                                        <Field as={Input} id="sp-name" name="name" />
                                        <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sp-mobile">Mobile <span className="text-red-500">*</span> </Label>
                                        <Field as={Input} id="sp-mobile" name="mobile" placeholder="10 digits" maxLength={10} />
                                        <ErrorMessage className="text-xs text-rose-600" name="mobile" component="small" />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="sp-email">Email <span className="text-red-500">*</span> </Label>
                                        <Field as={Input} id="sp-email" name="email" type="email" />
                                        <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sp-exp-y">Experience (years) <span className="text-red-500">*</span></Label>
                                        <Field as={Input} id="sp-exp-y" name="experienceYears" type="number" min={0} max={80} />
                                        <ErrorMessage className="text-xs text-rose-600" name="experienceYears" component="small" />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="sp-pan">PAN <span className="text-red-500">*</span> </Label>
                                        <Field as={Input} id="sp-pan" name="panCardNumber" className="uppercase" placeholder="ABCDE1234F" maxLength={10} />
                                        <ErrorMessage className="text-xs text-rose-600" name="panCardNumber" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sp-aadhar">Aadhar <span className="text-red-500">*</span> </Label>
                                        <Field as={Input} id="sp-aadhar" name="aadharNumber" placeholder="12 digits" maxLength={12} />
                                        <ErrorMessage className="text-xs text-rose-600" name="aadharNumber" component="small" />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>PAN document</Label>
                                        <InputFile accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" value={typeof values.panCardDocument === 'string' ? values.panCardDocument : undefined} onChange={(e) => setFieldValue('panCardDocument', e.target.files?.[0] ?? null)} />
                                        <ErrorMessage className="text-xs text-rose-600" name="panCardDocument" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aadhar document</Label>
                                        <InputFile accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" value={typeof values.aadharDocument === 'string' ? values.aadharDocument : undefined} onChange={(e) => setFieldValue('aadharDocument', e.target.files?.[0] ?? null)} />
                                        <ErrorMessage className="text-xs text-rose-600" name="aadharDocument" component="small" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sp-exp-d">Experience description <span className="font-normal text-slate-500">(optional)</span></Label>
                                    <Field as={Textarea} id="sp-exp-d" name="experienceDescription" rows={3} />
                                    <ErrorMessage className="text-xs text-rose-600" name="experienceDescription" component="small" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => { setOpen(null); }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                                        {open === "add" ? "Create" : "Save"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>

            <Modal
                show={statusOpen}
                onClose={() => setStatusOpen(false)}
                title="Update provider status"
                subTitle="Update profile and verification status."
                size="md"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-indigo-100 p-3 text-sm dark:border-slate-700">
                        <p><span className="font-medium">User ID:</span> {statusValues.userId}</p>
                        <p><span className="font-medium">Name:</span> {statusValues.name}</p>
                        <p><span className="font-medium">Mobile:</span> {statusValues.mobile}</p>
                        <p><span className="font-medium">Email:</span> {statusValues.email}</p>
                    </div>

                    <Formik
                        initialValues={statusValues}
                        enableReinitialize
                        validationSchema={statusValidationSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                            const payload = {
                                profileStatus: values.profileStatus,
                                isVerified: values.isVerified ? 1 : 0
                            };
                            const { data } = await AxiosHelperAdmin.putData(`/service-providers/${values._id}/status`, payload);
                            if (data?.status) {
                                toast.success(data.message || "Provider status updated.");
                                setStatusOpen(false);
                                fetchRows();
                            } else {
                                toast.error(data?.message || "Unable to update status.");
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, values, setFieldValue }) => (
                            <Form className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="status-profileStatus">Profile status</Label>
                                    <Field as={Select} id="status-profileStatus" name="profileStatus">
                                        {SERVICE_PROVIDER_PROFILE_STATUSES.map((status) => (
                                            <option key={status} value={status} className="capitalize">
                                                {status}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="profileStatus" component="small" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status-isVerified">Verification</Label>
                                    <Select
                                        id="status-isVerified"
                                        value={values.isVerified ? "1" : "0"}
                                        onChange={(e) => setFieldValue("isVerified", e.target.value === "1")}
                                    >
                                        <option value="1">Verified</option>
                                        <option value="0">Not Verified</option>
                                    </Select>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <Button type="button" variant="secondary" onClick={() => setStatusOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Update"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </section>
    );
}
