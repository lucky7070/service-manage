import axios, { InternalAxiosRequestConfig, isAxiosError, type AxiosError, type AxiosInstance, type AxiosResponse } from "axios";
import env from "../config/env";
import { getToken } from "../storage/token";

let axiosInstance: AxiosInstance | null = null;

export const getAxios = () => {
    if (!axiosInstance) {
        axiosInstance = axios.create({
            withCredentials: true,
            baseURL: env.apiUrl,
            timeout: 30000,
            headers: { "x-api-key": env.apiLicence },
        });

        axiosInstance.interceptors.request.use(async (config) => {
            const token = await getToken();
            if (token) config.headers.Authorization = `Bearer ${token}`;

            return config;
        });
    }

    return axiosInstance;
};

let isErrorShow = false;
export const checkError = (error: AxiosError) => {
    if (isErrorShow === false && error?.response?.status === 401) {
        isErrorShow = true;
    }
};

export const axiosResponse = (data: unknown, status: number = 200): AxiosResponse<unknown> => ({
    data,
    status,
    statusText: "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig<unknown>,
});

export const errorData = (error: AxiosError): AxiosResponse<unknown> => {
    if (env.logErrorsInConsole) console.log(error?.response);
    if (["ERR_NETWORK", "ECONNREFUSED", "ECONNABORTED"].includes(error.code ?? "")) {
        return axiosResponse({ status: false, message: error.message || "Something went wrong..!!", data: error }, 500);
    }

    if (typeof error === "string") {
        return axiosResponse({ status: false, message: error, data: error }, 500);
    }

    if (typeof error.response === "string") {
        return axiosResponse({ status: false, message: error.response, data: error.response }, error.status ?? 500);
    }

    if (typeof error.response?.data === "object") {
        return axiosResponse(error.response?.data, error.status ?? 422);
    }

    if (typeof error.response === "object") {
        return axiosResponse(error.response, error.status ?? 422);
    }

    return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, error.status ?? 500);
};

const AxiosHelper = {
    getData: async (url: string, formData: Record<string, unknown> | null = null) => {
        try {
            return await getAxios().get(url, { params: formData ?? undefined });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, 500);
        }
    },
    postData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios().post(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" },
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, 500);
        }
    },
    putData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios().put(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" },
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, 500);
        }
    },
    deleteData: async (url: string) => {
        try {
            return await getAxios().delete(url);
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, 500);
        }
    },
};

export default AxiosHelper;

export function resolveUploadUrl(path?: string | null) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;

    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${env.uploadUrl}${normalized}`;
}