"use client";

import AxiosHelper from '@/helpers/AxiosHelper';
import { useAppDispatch } from '@/store/hooks';
import { updateUser, UserState } from '@/store/slices/userSlice';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const UserLayout = ({ children }: { children: React.ReactNode }) => {

    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            const { data } = await AxiosHelper.getData("/customer/profile");
            if (data.status) {
                dispatch(updateUser(data.data as UserState));
            } else {
                toast.error(data.message || "Could not load profile.");
            }

            setLoading(false);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [dispatch]);

    return loading ? <div className="flex items-center justify-center min-h-120"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> : children
}

export default UserLayout