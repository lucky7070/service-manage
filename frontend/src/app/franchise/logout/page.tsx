"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AxiosHelperFranchise from "@/helpers/AxiosHelperFranchise";
import { deleteFranchiseAuthCookie } from "@/app/franchise/actions";
import { useAppDispatch } from "@/store/hooks";
import { resetFranchise } from "@/store/slices/franchiseSlice";
import PageLoader from "@/components/admin/PageLoader";

export default function FranchiseLogoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        (async () => {
            await AxiosHelperFranchise.postData("/logout", {});
            await deleteFranchiseAuthCookie();
            dispatch(resetFranchise());
            toast.success("Logged out successfully");
            router.replace("/franchise/login");
            router.refresh();
        })();
    }, [dispatch, router]);

    return <PageLoader />;
}
