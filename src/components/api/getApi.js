import axios from "axios";
import { baseInstance } from "./instance";

export const getApi = async (urlPath, params = {}) => {
    const controller = new AbortController();

    try {
        const queryParams = new URLSearchParams(params).toString();

        const fullURL =
            queryParams
                ? `${urlPath}${urlPath.includes("?") ? "&" : "?"}${queryParams}`
                : urlPath;

        const response = await baseInstance.get(fullURL, {
            signal: controller.signal,
        });

        if (response.status === 200) {
            return { data: response.data, error: null };
        }
    } catch (error) {
        if (axios.isCancel(error)) {
            return { data: null, error: "Request canceled" };
        }
        return { data: null, error: error.message };
    }
};
