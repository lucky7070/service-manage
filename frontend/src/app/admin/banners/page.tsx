"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toast } from "react-toastify";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button, Input, InputFile, Label, Modal, Select, Option } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import PermissionBlock from "@/components/admin/PermissionBlock";
import Image from "@/components/ui/Image";
import AdminNoTableRecords from "@/components/admin/AdminNoTableRecords";

type BannerType = "homepage" | "category";

type BannerRow = {
    _id: string;
    bannerTitle: string;
    bannerTitleHi: string;
    bannerSubtitle: string;
    bannerSubtitleHi: string;
    bannerImage: string | File | null;
    bannerType: BannerType;
    link: string;
    displayOrder: number | "";
    createdAt?: string;
};

type BannerRecord = {
    count: number;
    record: BannerRow[];
    totalPages: number;
    pagination: number[];
};

type SortBy = "bannerTitle" | "bannerType" | "displayOrder" | "createdAt";
type SortOrder = "asc" | "desc";

const INITIAL_VALUES: BannerRow = {
    _id: "",
    bannerTitle: "",
    bannerTitleHi: "",
    bannerSubtitle: "",
    bannerSubtitleHi: "",
    bannerImage: null,
    bannerType: "homepage",
    link: "",
    displayOrder: 0
};

const validationSchema = Yup.object().shape({
    bannerTitle: Yup.string().max(255, "Too long."),
    bannerTitleHi: Yup.string().max(255, "Too long."),
    bannerSubtitle: Yup.string().max(255, "Too long."),
    bannerSubtitleHi: Yup.string().max(255, "Too long."),
    bannerType: Yup.string().oneOf(["homepage", "category"], "Select banner type.").required("Banner type required."),
    link: Yup.string()
        .transform((v) => (typeof v === "string" ? v.trim() : ""))
        .max(150, "Link is too long.")
        .test("is-valid-url", "Enter a valid URL (e.g. https://example.com).", (v) => {
            try {
                if (!v) return true;
                return ["http:", "https:"].includes(new URL(v).protocol);
            } catch {
                return false;
            }
        }),
    displayOrder: Yup.mixed().test("displayOrder", "Display order must be 0–999999.", (v) => {
        if (v === "" || v === null || v === undefined) return true;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= 999999;
    }),
    bannerImage: Yup.mixed().test("bannerImage", "Banner image is required.", function (v) {
        const mode = this.options.context?.mode;
        if (mode === "edit") return true;
        if (v instanceof File) return true;
        if (typeof v === "string" && v.trim()) return true;
        return false;
    })
});

export default function AdminBannerPage() {
    const debouncedFetchRef = useRef(debounce(() => { }, 0));
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [data, setData] = useState<BannerRecord>({ count: 0, record: [], totalPages: 0, pagination: [] });
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy: SortBy; sortOrder: SortOrder; bannerType: "" | BannerType; }>({ limit: 10, pageNo: 1, query: "", sortBy: "displayOrder", sortOrder: "asc", bannerType: "" });
    const [initialValues, setInitialValues] = useState<BannerRow>(INITIAL_VALUES);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fetchBanners = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/banners", param);
        if (data.status && data.data) {
            const { count, totalPages, record, pagination } = data.data;
            setData({ count, totalPages, record, pagination });
        } else {
            setData({ count: 0, totalPages: 0, record: [], pagination: [] });
        }
    }, [param]);

    useEffect(() => {
        debouncedFetchRef.current = debounce(() => { fetchBanners(); }, 500);
    }, [fetchBanners]);

    useEffect(() => {
        debouncedFetchRef.current();
        return () => { debouncedFetchRef.current.cancel(); };
    }, [param]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/banners/${id}`);
            if (data.status) {
                toast.success(data.message);
                fetchBanners();
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

    const openEdit = (row: BannerRow) => {
        setInitialValues({
            _id: row._id,
            bannerTitle: row.bannerTitle || "",
            bannerTitleHi: row.bannerTitleHi || "",
            bannerSubtitle: row.bannerSubtitle || "",
            bannerSubtitleHi: row.bannerSubtitleHi || "",
            bannerImage: row.bannerImage || null,
            bannerType: row.bannerType || "homepage",
            link: row.link || "",
            displayOrder: row.displayOrder ?? 0
        });
        setImagePreview(typeof row.bannerImage === "string" ? resolveFileUrl(row.bannerImage) : null);
        setOpen("edit");
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Banners"
                subtitle="Manage promotional banners for homepage/category placements."
                action={
                    <PermissionBlock permission_id={391}>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => {
                                setInitialValues(INITIAL_VALUES);
                                setImagePreview(null);
                                setOpen("add");
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create Banner
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
                        placeholder="Search by title/subtitle..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={param.bannerType}
                            onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, bannerType: e.target.value === "" ? "" : (e.target.value as BannerType) }))}
                            className="max-w-[180px]"
                        >
                            <Option value="">All types</Option>
                            <Option value="homepage">Homepage</Option>
                            <Option value="category">Category</Option>
                        </Select>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="w-14 px-3 py-2" />
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("bannerTitle")} name="Title" active={param.sortBy === "bannerTitle"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("bannerType")} name="Type" active={param.sortBy === "bannerType"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("displayOrder")} name="Order" active={param.sortBy === "displayOrder"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2">Link</th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("createdAt")} name="Created" active={param.sortBy === "createdAt"} sortOrder={param.sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const thumb = resolveFileUrl(row.bannerImage as string | null);
                                return <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2">
                                        <div className="relative h-10 w-10 overflow-hidden rounded border border-indigo-100 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                                            {thumb ? <Image src={thumb} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                                        </div>
                                    </td>
                                    <td className="max-w-[250px] px-3 py-2 text-slate-700 dark:text-slate-200">{row.bannerTitle || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200"><Badge variant="secondary" size="sm" className="capitalize">{row.bannerType}</Badge></td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.displayOrder ?? 0}</td>
                                    <td className="max-w-[220px] px-3 py-2 text-slate-700 dark:text-slate-200">{row.link || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <PermissionBlock permission_id={392}>
                                                <Button size="sm" variant="secondary" onClick={() => openEdit(row)} title="Edit" aria-label="Edit">
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                            <PermissionBlock permission_id={393}>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)} title="Delete" aria-label="Delete">
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </PermissionBlock>
                                        </div>
                                    </td>
                                </tr>;
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
                title={open === "add" ? "Create Banner" : "Update Banner"}
                subTitle="Upload image and manage multilingual titles/subtitles."
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
                                const { data } = await AxiosHelperAdmin.postData("/banners", values, true);
                                if (data.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchBanners();
                                    resetForm();
                                } else {
                                    toast.error(data.message);
                                    setErrors(data.data);
                                }
                            } else {
                                const { data } = await AxiosHelperAdmin.putData(`/banners/${values._id}`, values, true);
                                if (data.status) {
                                    toast.success(data.message);
                                    setOpen(null);
                                    fetchBanners();
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
                                    <Label htmlFor="bannerImage">Banner image <span className="font-normal text-slate-500">(required on create)</span></Label>
                                    <InputFile
                                        id="bannerImage"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0] || null;
                                            setFieldValue("bannerImage", file);
                                            if (file) setImagePreview(URL.createObjectURL(file));
                                        }}
                                    />
                                    <ErrorMessage className="text-xs text-rose-600" name="bannerImage" component="small" />
                                    {imagePreview ? (
                                        <div className="mt-2 h-24 w-44 overflow-hidden rounded border border-slate-200 dark:border-slate-700">
                                            <Image src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    ) : typeof values.bannerImage === "string" && values.bannerImage ? (
                                        <div className="mt-2 h-24 w-44 overflow-hidden rounded border border-slate-200 dark:border-slate-700">
                                            {resolveFileUrl(values.bannerImage) ? (
                                                <Image src={resolveFileUrl(values.bannerImage) || ""} alt="Current" className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="bannerTitle">Banner title</Label>
                                        <Field as={Input} id="bannerTitle" name="bannerTitle" placeholder="Banner title" />
                                        <ErrorMessage className="text-xs text-rose-600" name="bannerTitle" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bannerTitleHi">Banner title (Hindi)</Label>
                                        <Field as={Input} id="bannerTitleHi" name="bannerTitleHi" placeholder="बैनर शीर्षक" />
                                        <ErrorMessage className="text-xs text-rose-600" name="bannerTitleHi" component="small" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="bannerSubtitle">Banner subtitle</Label>
                                        <Field as={Input} id="bannerSubtitle" name="bannerSubtitle" placeholder="Banner subtitle" />
                                        <ErrorMessage className="text-xs text-rose-600" name="bannerSubtitle" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bannerSubtitleHi">Banner subtitle (Hindi)</Label>
                                        <Field as={Input} id="bannerSubtitleHi" name="bannerSubtitleHi" placeholder="बैनर उपशीर्षक" />
                                        <ErrorMessage className="text-xs text-rose-600" name="bannerSubtitleHi" component="small" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="link">Link (optional)</Label>
                                        <Field as={Input} id="link" name="link" placeholder="https://..." />
                                        <ErrorMessage className="text-xs text-rose-600" name="link" component="small" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="displayOrder">Display order</Label>
                                        <Field as={Input} id="displayOrder" name="displayOrder" type="number" min={0} />
                                        <ErrorMessage className="text-xs text-rose-600" name="displayOrder" component="small" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bannerType">Banner type</Label>
                                    <Field as={Select} id="bannerType" name="bannerType">
                                        <Option value="homepage">Homepage</Option>
                                        <Option value="category">Category</Option>
                                    </Field>
                                    <ErrorMessage className="text-xs text-rose-600" name="bannerType" component="small" />
                                </div>

                                <div className="pt-1">
                                    <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : open === "add" ? "Create Banner" : "Update Banner"}
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

