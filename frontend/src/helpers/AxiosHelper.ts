import envConfig from "@/config/env";
import axios, { InternalAxiosRequestConfig, isAxiosError, type AxiosError, type AxiosResponse } from "axios";
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
    if (isErrorShow === false && error?.response?.status === 401) {
        toast.error("Token Expired, Please login Again.");
        isErrorShow = true;
    }
};

export const axiosResponse = (data: unknown, status: number = 200): AxiosResponse<unknown> => ({ data: data, status: status, statusText: "OK", headers: {}, config: {} as InternalAxiosRequestConfig<unknown> })
export const errorData = (error: AxiosError): AxiosResponse<unknown> => {
    if (envConfig.logErrorsInConsole) console.log(error?.response);
    if (["ERR_NETWORK", "ERR_BAD_REQUEST", "ECONNREFUSED", "ECONNABORTED"].includes(error.code ?? "")) {
        return axiosResponse({ status: false, message: error.message || "Something went wrong..!!", data: error }, 500);
    }

    checkError(error);
    if (typeof error === "string") {
        return axiosResponse({ status: false, message: error, data: error }, 500);
    } if (typeof error.response === "string") {
        return axiosResponse({ status: false, message: error.response, data: error.response }, error.status ?? 500);
    } else if (typeof error.response === "object") {
        return axiosResponse(error.response as AxiosResponse<unknown>, error.status ?? 422);
    } else {
        return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, error.status ?? 500);
    }
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
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" }
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return axiosResponse({ status: false, message: "Something went wrong..!!", data: error }, 500);
        }
    },
    putData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios().put(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" }
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
    }
};

export default AxiosHelper;
