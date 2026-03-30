"use client";

import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../../../components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Label, ToggleSwitch } from "@/components/ui";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PERMISSIONS } from "@/config";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

export default function AdminPermissionsPage({ params }: { params: Promise<{ slug: string }> }) {

    const { slug } = use(params);
    const router = useRouter();
    const [roleName, setRoleName] = useState("Role");
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperAdmin.getData(`/roles/${slug}`);
            if (data?.status) {
                setRoleName(data.data?.name || "Role");
                setSelected(data.data?.permissions || []);
            } else {
                toast.error(data?.message || "Failed to fetch role permissions");
                router.push("/admin/roles");
            }
        })();
    }, [slug, router]);

    const togglePermission = (id: number) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const save = async () => {
        const { data } = await AxiosHelperAdmin.putData(`/roles/${slug}/permissions`, { permissions: selected });
        if (data.status) {
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title={`${roleName} Permissions`}
                subtitle="Assign access rights for this role."
                action={
                    <div className="flex items-center gap-2">
                        <Link href="/admin/roles">
                            <Button type="button" variant="secondary" size="md">
                                <ArrowLeftIcon className="h-4 w-4" /> Go Back
                            </Button>
                        </Link>
                        <Button type="button" variant="primary" size="md" onClick={save}>
                            <SaveIcon className="h-4 w-4" /> Save Permissions
                        </Button>
                    </div>
                }
            />

            <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                {PERMISSIONS.map((group) => (
                    <div key={group.name}>
                        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{group.name}</h3>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {group.permissions.map((perm) => (
                                <Label
                                    key={perm.id}
                                    className="!mb-0 cursor-pointer rounded-md border border-indigo-100 px-3 py-2 text-slate-700 dark:border-indigo-100 dark:text-slate-200"
                                >
                                    <ToggleSwitch checked={selected.includes(perm.id)} onCheckedChange={() => togglePermission(perm.id)} />
                                    <span className="text-sm">{perm.label}</span>
                                </Label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
