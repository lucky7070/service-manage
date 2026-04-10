import envConfig from "@/config/env";
import axios, { isAxiosError, type AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";

export const getAxios = (key?: number) => {
    switch (key) {
        case 1:
            return axios.create({
                withCredentials: true,
                baseURL: envConfig.apiUrlAdmin,
                headers: { "x-api-key": envConfig.apiLicence }
            });
        default:
            return axios.create({
                withCredentials: true,
                baseURL: envConfig.apiUrl,
                headers: { "x-api-key": envConfig.apiLicence }
            });
    }
};

let isErrorShow = false;

export const checkError = (error: AxiosError) => {
    if (isErrorShow === false && error?.response?.status === 401 && String(error?.config?.url) !== "/profile") {
        isErrorShow = true;
        toast.error("Token Expired, Please login Again.");
    }
};

export const errorData = (error: AxiosError): AxiosResponse<unknown> | { status: false; message: string; data: unknown } => {
    if (envConfig.logErrorsInConsole) console.log(error?.response);
    if (error.code === "ERR_NETWORK") {
        return { status: false, message: error.message || "Something went wrong..!!", data: error };
    }

    checkError(error);
    return error.response ?? { status: false, message: "Something went wrong..!!", data: error };
};

const AxiosHelper = {
    getData: async (url: string, formData: Record<string, unknown> | null = null) => {
        try {
            return await getAxios().get(url, { params: formData ?? undefined });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    },
    postData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios().post(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" }
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    },
    putData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios().put(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" }
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    },
    deleteData: async (url: string) => {
        try {
            return await getAxios().delete(url);
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    }
};

export default AxiosHelper;
