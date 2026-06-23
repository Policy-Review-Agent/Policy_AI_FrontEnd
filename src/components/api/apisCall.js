import { Upload } from "lucide-react";
import { getApi } from "./getApi"
import { postApi } from "./postApi";

export const getDashboardStats = async (setDashboardStats, dispatch) => {
    try {
        const response = await getApi("/api/frontend/batches/stats/", {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        });

        if (response?.data?.data) {
            dispatch(setDashboardStats(response?.data?.data || []))
        }

    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}



export const getDashboardList = async (setDashboardList, dispatch) => {
    try {
        const response = await getApi("/api/frontend/batches/list/", {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        });

        if (response?.data?.data) {
            dispatch(setDashboardList(response?.data?.data || []))
        }

    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const getPolicySummary = async (setPolicysummary, id, dispatch) => {
    try {
        const response = await getApi(`/api/frontend/batches/${id}/summary/`, {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        });

        if (response?.data?.data) {
            dispatch(setPolicysummary(response?.data?.data || []))
        }

    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const getPolicyList = async (setPolicyList, id, dispatch) => {
    try {
        const response = await getApi(`/api/frontend/batches/${id}/policies/`, {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        });
        if (response?.data?.data) {
            dispatch(setPolicyList(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const getChecklistSummary = async (setChecklistSummary, id, dispatch) => {
    try {
        const response = await getApi(`/api/frontend/policies/${id}/checklist/summary/`, {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        });
        if (response?.data?.data) {
            dispatch(setChecklistSummary(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const getPolicyCheckList = async (setPolicyCheckList, id, dispatch) => {
    try {
        const response = await getApi(`/api/frontend/policies/${id}/checklist/items/`, {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        });
        if (response?.data?.data) {
            dispatch(setPolicyCheckList(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}
export const getDocumentData = async (setDocumentData, id, dispatch, checklistId) => {
    try {
        const response = await getApi(`/api/frontend/policies/${id}/documents/`, {
            "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
            checklist_item_id: checklistId,
        });
        console.log("response", response)
        if (response?.data?.data) {
            dispatch(setDocumentData(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const getDocumentPage = async (id, dispatch, setDocumentPageData) => {
  try {
    const response = await getApi(
      `/api/frontend/documents/${id}/stream/`,
      { "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN" }
    );

    const payload = response?.data?.data || response?.data;

    if (typeof payload === "string" && payload.startsWith("%PDF")) {
      // Convert raw PDF string to bytes binary-safe
      const bytes = new Uint8Array(payload.length);
      for (let i = 0; i < payload.length; i++) {
        bytes[i] = payload.charCodeAt(i) & 0xff;
      }

      // Create blob URL here — store only the string URL in Redux (serializable)
      const blob      = new Blob([bytes], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(blob);

      dispatch(setDocumentPageData({ objectUrl, contentType: "application/pdf" }));
      return;
    }

    console.warn("getDocumentPage: unrecognised payload", payload);
  } catch (error) {
    console.error("getDocumentPage error:", error);
  }
};

export const UploadCSVFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);  // "file" matches your Postman key

        const response = await postApi(
            "/api/frontend/documents/upload/",
            formData,
            { "Content-Type": "multipart/form-data" }  // 👈 override here
        );

        return { data: response.data, error: null };
    } catch (error) {
        console.log("Error File Uploading:", error);
        return { data: null, error: error.message };
    }
};

export const checkPolicyReviwed = async (setPolicyValidated, dispatch, id) => {
    try {
        const response = await postApi(`/api/frontend/policies/${id}/mark-reviewed/`, {
            policy_id: id
        })
        if (response?.data?.data) {
            dispatch(setPolicyValidated(response?.data?.data || []))
        }
    } catch (error) {
        console.log("Error File Uploading:", error);
        return { data: null, error: error.message };
    }
}

