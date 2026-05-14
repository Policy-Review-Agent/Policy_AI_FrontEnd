import axios from "axios";
import { baseInstance } from "./instance";

export const putApi = async (urlPath, reqObj) => {
    const controller = new AbortController();

    try {
        const response = await baseInstance.put(urlPath, reqObj, {
            signal: controller.signal,
        });

        return {
            status: response.status,
            data: response.data,
            error: null,
        };
    } catch (error) {
        if (axios.isCancel(error)) {
            return { status: null, data: null, error: "Request canceled" };
        }

        return {
            status: error.response?.status || null,
            data: error.response?.data || null,
            error: error.message,
        };
    }
};