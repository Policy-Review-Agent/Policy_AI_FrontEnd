import axios from "axios";
import { baseInstance } from "./instance";

export const getUserInfo = async (urlPath, token) => {
  try {
    const response = await baseInstance.get(urlPath, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { data: response.data.data, error: null };
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      return { data: null, error: "Request canceled" };
    }
    return { data: null, error: error.response.data.errors?.date_range[0] || error.response.data?.detail|| "An error occurred in get User" };
  }
};
