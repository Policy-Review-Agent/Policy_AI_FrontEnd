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
        if (response?.data?.data) {
            dispatch(setDocumentData(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

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

export const checkPolicyReviwed = async (id) => {
    try {
        const response = await postApi(`/api/frontend/policies/${id}/mark-reviewed/`, {
            policy_id: id
        })
        return { data: response.data, error: null };
    } catch (error) {
        console.log("Error File Uploading:", error);
        return { data: null, error: error.message };
    }
}