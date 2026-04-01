"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/ui/Image";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ArrowLeftIcon, GripVertical, Trash2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, FileDropzone, SortableList } from "@/components/ui";
import PermissionBlock from "@/components/admin/PermissionBlock";
import { getSweetAlertConfig, resolveFileUrl } from "@/helpers/utils";
import Modal from "@/components/ui/Modal";

type WorkPhoto = {
    _id: string;
    photoUrl: string;
    displayOrder: number;
};

export default function ServiceProviderWorkPhotosPage() {
    const { id } = useParams();
    const router = useRouter();

    const [providerName, setProviderName] = useState<string>("");
    const [photos, setPhotos] = useState<WorkPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        const { data } = await AxiosHelperAdmin.getData(`/service-providers/${id}`);
        if (data.status && data.data) {
            setProviderName(String(data.data?.name ?? ""));
            const nextPhotos = Array.isArray(data.data.photos) ? data.data.photos : [];
            setPhotos(nextPhotos);
            setLoading(false);
        } else {
            toast.error(data.message || "Could not load photos.");
            router.push("/admin/service-providers");
        }
    }, [id, router]);

    useEffect(() => { (() => { getData() })() }, [getData]);

    const uploadFiles = async (fileList: File[]) => {
        if (!id || !fileList.length) return;

        const images = fileList.filter((f) => f.type.startsWith("image/"));
        if (!images.length) {
            toast.error("Please choose image files only.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        images.forEach((f) => formData.append("photos", f));

        const { data } = await AxiosHelperAdmin.postData(`/service-providers/${id}/photos`, formData, true);
        setUploading(false);
        if (data.status) {
            toast.success(data.message || "Photos uploaded.");
            getData();
        } else {
            toast.error(data.message || "Upload failed.");
        }
    };

    const removePhoto = async (photo: WorkPhoto) => {
        if (!id) return;

        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({}));
        if (!isConfirmed) return;

        const { data } = await AxiosHelperAdmin.deleteData(`/service-providers/${id}/photos/${photo._id}`);
        if (data.status) {
            toast.success(data.message || "Photo removed.");
            setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
        } else {
            toast.error(data?.message || "Could not remove photo.");
        }
    };

    const persistOrder = async (next: WorkPhoto[]) => {
        if (!id) return;

        const orderedIds = next.map((p) => p._id);
        const { data } = await AxiosHelperAdmin.putData(`/service-providers/${id}/photos/reorder`, { orderedIds }, false);
        if (data.status) {
            const reordered = Array.isArray(data.data) ? data.data : next;
            setPhotos(reordered);
        } else {
            toast.error(data.message || "Could not save order.");
            getData();
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Work Photos"
                subtitle={
                    loading
                        ? "Loading…"
                        : providerName
                            ? `Portfolio images for ${providerName}.`
                            : "Portfolio images for this service provider."
                }
                action={
                    <Link href="/admin/service-providers">
                        <Button type="button" variant="secondary" size="md">
                            <ArrowLeftIcon className="h-4 w-4" /> Go Back
                        </Button>
                    </Link>
                }
            />

            <PermissionBlock permission_id={375}>
                <FileDropzone
                    accept="image/*"
                    multiple
                    uploading={uploading}
                    disabled={uploading}
                    onFilesSelected={(files) => void uploadFiles(files)}
                >
                    {({ openFileDialog }) => (
                        <p>
                            Drag and drop images here, or {" "} <span
                                role="button"
                                tabIndex={0}
                                className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
                                onClick={openFileDialog}
                            >
                                Browse
                            </span>
                        </p>
                    )}
                </FileDropzone>
            </PermissionBlock>

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
                {loading ? (
                    <p className="py-8 text-center text-slate-500">Loading photos…</p>
                ) : photos.length === 0 ? (
                    <p className="py-8 text-center text-slate-500 dark:text-slate-400">No work photos yet.</p>
                ) : (
                    <SortableList
                        list={photos}
                        setList={setPhotos}
                        getId={(item) => String(item._id)}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        disabled={loading}
                        onEnd={persistOrder}
                        renderItem={(p) => <li key={p._id} className="group relative overflow-hidden rounded-xl border border-indigo-100 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
                            <div role="button" tabIndex={0} className="block w-full text-left cursor-pointer" onClick={() => setPreviewUrl(resolveFileUrl(p.photoUrl))}>
                                <Image src={resolveFileUrl(p.photoUrl) ?? ""} alt="" className="h-44 w-full object-cover sm:h-48" />
                            </div>

                            <PermissionBlock permission_id={376}>
                                <div
                                    className="drag-handle absolute left-2 top-2 cursor-grab rounded-md bg-white/90 p-1 shadow active:cursor-grabbing dark:bg-slate-900/90"
                                    title="Drag to Reorder"
                                >
                                    <GripVertical className="h-4 w-4 text-slate-600" aria-hidden />
                                </div>
                            </PermissionBlock>

                            <PermissionBlock permission_id={377}>
                                <div className="absolute right-2 top-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="danger"
                                        className="opacity-90 shadow"
                                        title="Remove"
                                        aria-label="Remove Photo"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            void removePhoto(p);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </PermissionBlock>
                        </li>}
                    />
                )}
            </div>

            <Modal show={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Preview" size="xl" showFooter={false}>
                {previewUrl ? <Image src={previewUrl} alt="" className="max-h-[70vh] w-full object-contain" /> : null}
            </Modal>
        </section>
    );
}
