"use client";

import AxiosHelper from '@/helpers/AxiosHelper';
import { useAppDispatch } from '@/store/hooks';
import { updateUser, UserState } from '@/store/slices/userSlice';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import { deleteCustomerAuthCookie } from '../admin/actions';
import { setLoading } from '@/store/slices/appSlice';

const Provider = ({ children }: { children: React.ReactNode }) => {

    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    const isProtectedRoute = useMemo(() => pathname.startsWith("/user"), [pathname]);

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            const { data } = await AxiosHelper.getData("/customer/profile");
            if (data.status) {
                dispatch(updateUser(data.data as UserState));
            } else {
                await deleteCustomerAuthCookie();
                if (isProtectedRoute) router.push("/login");
            }
            dispatch(setLoading(false));
        }, 0);

        return () => window.clearTimeout(timer);
    }, [dispatch, isProtectedRoute, router]);

    return children
}

export default Provider
