import { isAxiosError } from "axios";
import { errorData, getAxios } from "./AxiosHelper";

const AxiosHelperAdmin = {
    getData: async (url: string, formData: Record<string, unknown> | null = null) => {
        try {
            return await getAxios(1).get(url, { params: formData ?? undefined });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    },
    postData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios(1).post(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" }
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    },
    putData: async (url: string, formData: unknown, type: boolean = false) => {
        try {
            return await getAxios(1).put(url, formData, {
                headers: { "Content-Type": type ? "multipart/form-data" : "application/json" }
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    },
    deleteData: async (url: string) => {
        try {
            return await getAxios(1).delete(url);
        } catch (error: unknown) {
            if (isAxiosError(error)) return errorData(error);
            return { status: false, message: "Something went wrong..!!", data: error };
        }
    }
};

export default AxiosHelperAdmin;
