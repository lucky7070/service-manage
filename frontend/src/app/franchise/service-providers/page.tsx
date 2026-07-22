"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { CreditCard, ImageIcon, Images, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import Link from "next/link";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminActionsDropdown from "@/components/admin/AdminActionsDropdown";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";
import AxiosHelper from "@/helpers/AxiosHelper";
import { Badge, Button, Input, InputFile, Label, Modal, Select, Option, Textarea } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";
import AsyncSelect from "@/components/ui/AsyncSelect";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";
import { PERSON_NAME_ERROR_MESSAGE, PERSON_NAME_REGEXP, PHONE_ERROR_MESSAGE, PHONE_REGEXP, SERVICE_PROVIDER_PROFILE_STATUSES } from "@/config";
import { checkDocSize, checkDocType, checkImageType } from "@/helpers/validator";

type ProviderRecord = {
    _id: string;
    userId?: string;
    name: string;
    mobile: string;
    email?: string | null;
    cityId?: string;
    serviceCategoryId?: string;
    panCardNumber?: string;
    aadharNumber?: string;
    image?: File | string | null;
    panCardDocument?: File | string | null;
    aadharDocument?: File | string | null;
    policeVerification?: File | string | null;
    experienceYears?: number | "";
    experienceDescription?: string;
    cityName?: string;
    serviceCategoryName?: string;
    currentSubscription?: string | null;
    profileStatus?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    isActive?: boolean;
    createdAt?: string;
};

type ProviderResponse = {
    count: number;
    record: ProviderRecord[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "userId" | "name" | "mobile" | "email" | "profileStatus" | "createdAt";
type SortOrder = "asc" | "desc";

const INITIAL_VALUES: ProviderRecord = {
    _id: "",
    name: "",
    mobile: "",
    email: "",
    cityId: "",
    serviceCategoryId: "",
    panCardNumber: "",
    aadharNumber: "",
    experienceYears: "",
    experienceDescription: "",
    image: null,
    panCardDocument: null,
    aadharDocument: null,
    policeVerification: null
};

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(2, "Too short.")
        .max(100, "Too long.")
        .matches(PERSON_NAME_REGEXP, PERSON_NAME_ERROR_MESSAGE)
        .required("Name is required."),
    mobile: Yup.string().matches(PHONE_REGEXP, PHONE_ERROR_MESSAGE).length(10, "10 digits required.").required("Mobile is required."),
    email: Yup.string().email("Invalid email.").required("Email is required."),
    panCardNumber: Yup.string().matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, "PAN format: ABCDE1234F").required("PAN is required."),
    aadharNumber: Yup.string().matches(/^[0-9]{12}$/, "Aadhar must be 12 digits.").required("Aadhar is required."),
    experienceYears: Yup.number().typeError("Experience years must be numeric.").min(0, "Experience must be 0 or more.").max(80, "Experience cannot exceed 80 years.").required("Experience years is required."),
    cityId: Yup.string().required("City is required."),
    serviceCategoryId: Yup.string().required("Service category is required."),
    image: Yup.mixed().required("Image is required.").test("image-type", "Image must be JPEG, PNG, WebP, or GIF.", checkImageType).test("image-size", "Image must be less than 5MB.", checkDocSize),
    panCardDocument: Yup.mixed().required("PAN card document is required.").test("pan-card-document-type", "PAN card document must be JPEG, PNG, WebP, or GIF, or PDF.", checkDocType).test("pan-card-document-size", "PAN card document must be less than 5MB.", checkDocSize),
    aadharDocument: Yup.mixed().required("Aadhar document is required.").test("aadhar-document-type", "Aadhar document must be JPEG, PNG, WebP, or GIF, or PDF.", checkDocType).test("aadhar-document-size", "Aadhar document must be less than 5MB.", checkDocSize),
    policeVerification: Yup.mixed().nullable().optional().test("police-verification-type", "Police verification document must be JPEG, PNG, WebP, or GIF, or PDF.", checkDocType).test("police-verification-size", "Police verification document must be less than 5MB.", checkDocSize),
    experienceDescription: Yup.string().max(5000, "Too long.").nullable()
});

export default function FranchiseServiceProvidersPage() {
    const searchParams = useSearchParams();
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<ProviderResponse>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{
        limit: number;
        pageNo: number;
        query: string;
        sortBy: SortBy;
        sortOrder: SortOrder;
        profileStatus: string;
    }>({
        limit: 10,
        pageNo: 1,
        query: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        profileStatus: searchParams.get("profileStatus") || ""
    });
    const [initialValues, setInitialValues] = useState<ProviderRecord>(INITIAL_VALUES);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [city, setCity] = useState<{ value: string; label: string } | null>(null);
    const [serviceCategory, setServiceCategory] = useState<{ value: string; label: string } | null>(null);

    const loadCityOptions = async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/cities-with-state", { query: inputValue, limit: 20 });
        return data.status && Array.isArray(data.data) ? data.data : [];
    };

    const loadServiceCategoryOptions = async (inputValue: string) => {
        const { data } = await AxiosHelper.getData("/service-categories-list", { query: inputValue, limit: 20 });
        return data.status && Array.isArray(data.data) ? data.data : [];
    };

    const fetchProviders = useCallback(async () => {
        const { data } = await AxiosHelperFranchise.getData("/service-providers", param);
        if (data?.status && data?.data?.record) {
            setData(data.data);
        } else {
            setData({ count: 0, record: [], totalPages: 0, pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        (() => {
            const status = searchParams.get("profileStatus") || "";
            setParam((prev) => (prev.profileStatus === status ? prev : { ...prev, pageNo: 1, profileStatus: status }));
        })();
    }, [searchParams]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchProviders(); }, 500);
        debouncedFetchRef.current();
        return () => {
            debouncedFetchRef.current.cancel();
        };
    }, [fetchProviders]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperFranchise.deleteData(`/service-providers/${id}`);
            if (data?.status) {
                toast.success(data.message);
                fetchProviders();
            } else {
                toast.error(data?.message);
            }
        }
    };

    const onSort = (nextSortBy: SortBy) => {
        setParam((prev) => {
            const nextOrder: SortOrder = prev.sortBy === nextSortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "asc";
            return { ...prev, pageNo: 1, sortBy: nextSortBy, sortOrder: nextOrder };
        });
    };

    const openCreate = () => {
        setInitialValues(INITIAL_VALUES);
        setCity(null);
        setServiceCategory(null);
        setImagePreview(null);
        setOpen("add");
    };

    const openEdit = (row: ProviderRecord) => {
        setInitialValues({
            _id: String(row._id),
            name: String(row.name ?? ""),
            mobile: String(row.mobile ?? ""),
            email: String(row.email ?? ""),
            cityId: String(row.cityId ?? ""),
            serviceCategoryId: String(row.serviceCategoryId ?? ""),
            panCardNumber: String(row.panCardNumber ?? ""),
            aadharNumber: String(row.aadharNumber ?? ""),
            experienceYears: row.experienceYears ?? 0,
            experienceDescription: String(row.experienceDescription ?? ""),
            image: row.image || null,
            panCardDocument: row.panCardDocument || null,
            aadharDocument: row.aadharDocument || null,
            policeVerification: row.policeVerification || null
        });
        setCity({ value: String(row.cityId ?? ""), label: String(row.cityName ?? "") });
        setServiceCategory({ value: String(row.serviceCategoryId ?? ""), label: String(row.serviceCategoryName ?? "") });
        setImagePreview(typeof row.image === "string" ? resolveFileUrl(row.image) : null);
        setOpen("edit");
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Service providers"
                subtitle="Create and manage service providers under your franchise."
                action={
                    <Button type="button" variant="primary" size="md" onClick={openCreate}>
                        <Plus className="h-3.5 w-3.5" />
                        Create provider
                    </Button>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        className="max-w-xs"
                        placeholder="Search providers..."
                    />
                    <div className="flex items-center gap-2">
                        <Select
                            value={param.profileStatus}
                            onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, profileStatus: e.target.value }))}
                            className="max-w-[180px]"
                        >
                            <Option value="">All statuses</Option>
                            {SERVICE_PROVIDER_PROFILE_STATUSES.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
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
                                    <AdminTableHeader onClick={() => onSort("mobile")} name="Mobile" active={param.sortBy === "mobile"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">City</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("profileStatus")} name="Profile status" active={param.sortBy === "profileStatus"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Current subscription</th>
                                <th className="px-3 py-2">Verified</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const thumb = resolveFileUrl(typeof row.image === "string" ? row.image : null);
                                return (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
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
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p>{row.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{row.userId || "—"}</p>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p>{row.mobile}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{row.email || "—"}</p>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p>{row.cityName || "—"}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{row.serviceCategoryName || "—"}</p>
                                        </td>
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
                                                {row.profileStatus || "—"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            {row.currentSubscription ? (
                                                <Link
                                                    className="font-semibold text-indigo-600 dark:text-indigo-400"
                                                    href={`/franchise/service-providers/${row._id}/subscriptions`}
                                                >
                                                    {row.currentSubscription}
                                                </Link>
                                            ) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            <Badge variant={row.isVerified ? "success" : "warning"} size="sm">
                                                {row.isVerified ? "Yes" : "No"}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            {row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            <AdminActionsDropdown
                                                items={[
                                                    {
                                                        key: "images",
                                                        label: "Work Photos",
                                                        icon: Images,
                                                        href: `/franchise/service-providers/${row._id}/images`,
                                                    },
                                                    {
                                                        key: "services",
                                                        label: "Services",
                                                        icon: Wrench,
                                                        href: `/franchise/service-providers/${row._id}/services`,
                                                    },
                                                    {
                                                        key: "subscriptions",
                                                        label: "Subscriptions",
                                                        icon: CreditCard,
                                                        href: `/franchise/service-providers/${row._id}/subscriptions`,
                                                    },
                                                    {
                                                        key: "edit",
                                                        label: "Edit",
                                                        icon: Pencil,
                                                        onClick: () => openEdit(row),
                                                    },
                                                    {
                                                        key: "delete",
                                                        label: "Delete",
                                                        icon: Trash2,
                                                        danger: true,
                                                        onClick: () => handleDelete(row._id),
                                                    },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            <AdminNoTableRecords show={data.record.length === 0} />
                        </tbody>
                    </table>
                </div>

                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <Modal
                show={["add", "edit"].includes(String(open))}
                onClose={() => setOpen(null)}
                title={open === "add" ? "Create service provider" : "Update service provider"}
                subTitle="Providers you create are linked to your franchise."
                size="xxl"
                scrollable
            >
                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                        if (open === "add") {
                            const { data } = await AxiosHelperFranchise.postData("/service-providers", values, true);
                            if (data.status) {
                                toast.success(data.message);
                                setOpen(null);
                                fetchProviders();
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data || {});
                            }
                        } else {
                            const { data } = await AxiosHelperFranchise.putData(`/service-providers/${values._id}`, values, true);
                            if (data.status) {
                                toast.success(data.message);
                                setOpen(null);
                                fetchProviders();
                                resetForm();
                            } else {
                                toast.error(data.message);
                                setErrors(data.data || {});
                            }
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="space-y-3">
                            <div className="space-y-2">
                                <Label>Profile Photo</Label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                                        )}
                                    </div>
                                    <div>
                                        <InputFile
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setFieldValue("image", f);
                                                    setImagePreview(URL.createObjectURL(f));
                                                }
                                            }}
                                        />
                                        <ErrorMessage className="text-xs text-rose-600" name="image" component="small" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>City <span className="text-red-500">*</span></Label>
                                    <AsyncSelect
                                        inputId="franchise-sp-city"
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={loadCityOptions}
                                        isDisabled={isSubmitting}
                                        placeholder="Search and select city"
                                        value={city}
                                        onChange={(option) => {
                                            setFieldValue("cityId", option?.value || "");
                                            setCity(option || null);
                                        }}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="cityId" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Service category <span className="text-red-500">*</span></Label>
                                    <AsyncSelect
                                        inputId="franchise-sp-category"
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={loadServiceCategoryOptions}
                                        isDisabled={isSubmitting}
                                        placeholder="Select service category"
                                        value={serviceCategory}
                                        onChange={(option) => {
                                            setFieldValue("serviceCategoryId", option?.value || "");
                                            setServiceCategory(option || null);
                                        }}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="serviceCategoryId" component="small" />
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Name <span className="text-red-500">*</span></Label>
                                    <Field as={Input} name="name" placeholder="e.g. John Doe" />
                                    <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile <span className="text-red-500">*</span></Label>
                                    <Field as={Input} name="mobile" placeholder="e.g. 9876543210" />
                                    <ErrorMessage className="text-xs text-rose-600" name="mobile" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email <span className="text-red-500">*</span></Label>
                                    <Field as={Input} name="email" type="email" placeholder="e.g. provider@email.com" />
                                    <ErrorMessage className="text-xs text-rose-600" name="email" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Experience (years) <span className="text-red-500">*</span></Label>
                                    <Field as={Input} name="experienceYears" type="number" min={0} max={80} />
                                    <ErrorMessage className="text-xs text-rose-600" name="experienceYears" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>PAN <span className="text-red-500">*</span></Label>
                                    <Field as={Input} name="panCardNumber" className="uppercase" placeholder="ABCDE1234F" maxLength={10} />
                                    <ErrorMessage className="text-xs text-rose-600" name="panCardNumber" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Aadhar <span className="text-red-500">*</span></Label>
                                    <Field as={Input} name="aadharNumber" placeholder="12 digits" maxLength={12} />
                                    <ErrorMessage className="text-xs text-rose-600" name="aadharNumber" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>PAN document</Label>
                                    <InputFile accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" value={typeof values.panCardDocument === "string" ? values.panCardDocument : undefined} onChange={(e) => setFieldValue("panCardDocument", e.target.files?.[0] ?? null)} />
                                    <ErrorMessage className="text-xs text-rose-600" name="panCardDocument" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Aadhar document</Label>
                                    <InputFile accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" value={typeof values.aadharDocument === "string" ? values.aadharDocument : undefined} onChange={(e) => setFieldValue("aadharDocument", e.target.files?.[0] ?? null)} />
                                    <ErrorMessage className="text-xs text-rose-600" name="aadharDocument" component="small" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Police verification <span className="font-normal text-slate-500">(optional)</span></Label>
                                    <InputFile accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" value={typeof values.policeVerification === "string" ? values.policeVerification : undefined} onChange={(e) => setFieldValue("policeVerification", e.target.files?.[0] ?? null)} />
                                    <ErrorMessage className="text-xs text-rose-600" name="policeVerification" component="small" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience description <span className="font-normal text-slate-500">(optional)</span></Label>
                                <Field as={Textarea} name="experienceDescription" rows={3} />
                                <ErrorMessage className="text-xs text-rose-600" name="experienceDescription" component="small" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setOpen(null)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {open === "add" ? "Create" : "Save"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </section>
    );
}
