"use client";

import { Button } from "@/components/ui";
import AxiosHelper from "@/helpers/AxiosHelper"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function HomePage() {

    const router = useRouter();
    const [user, setUser] = useState<unknown>(null);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelper.getData("/auth/profile");
            if (data.status) {
                setUser(data.data);
            } else {
                toast.error(data.message);
            }
        })();
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <h1>Dashboard</h1>
            <pre>{JSON.stringify(user, null, 2)}</pre>

            <Button variant="outline" onClick={async () => {
                const { data } = await AxiosHelper.postData("/auth/logout", {});
                if (data.status) {
                    router.push("/login");
                } else {
                    toast.error(data.message);
                }
            }}>Logout</Button>
        </div>
    )
}
