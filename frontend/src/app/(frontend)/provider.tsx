"use client";

import AxiosHelper from '@/helpers/AxiosHelper';
import { useAppDispatch } from '@/store/hooks';
import { updateUser, UserState } from '@/store/slices/userSlice';
import React, { useEffect } from 'react';

const Provider = ({ children }: { children: React.ReactNode }) => {

    const dispatch = useAppDispatch();

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            const { data } = await AxiosHelper.getData("/customer/profile");
            if (data.status) {
                dispatch(updateUser(data.data as UserState));
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [dispatch]);

    return children
}

export default Provider