import { getApi } from "./getApi";
import { postApi } from "./postApi";
import { deleteApi } from "./deleteApi";
import { putApi } from "./putApi";
export const getValidatorSetupList = async (setValidatorSetupList, dispatch) => {
    try {
        const response = await getApi(`/api/frontend/validators/list/`, {
            //   "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        })
        if (response?.data?.data) {
            dispatch(setValidatorSetupList(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const createValidatorPolicy = async (payload) => {
    try {
        const response = await postApi(`/api/frontend/validators/create/`, payload, {
            // "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",    
        })
        return { data: response?.data || null, error: null };

    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}
export const getValidatorDocDetails = async (setValidatorDocDetails, dispatch, id) => {
    try {
        const response = await getApi(`/api/frontend/validators/detail/${id}/`, {
            //   "X-Frontend-Token": "INSURVIA_FRONTEND_SECURE_TOKEN",
        })
        if (response?.data?.data) {
            dispatch(setValidatorDocDetails(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }

}

export const createValidatorDocDetails = async (payload, id) => {
    try {
        const response = await postApi(`/api/frontend/validators/document/add/${id}/`, payload, {
        })
        return { data: response?.data || null, error: null };
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const deleteValidatorDocDetails = async (id) => {
    try {
        const response = await deleteApi(`/api/frontend/validators/document/delete/${id}/`);
        return { data: response?.data || null, error: null };
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const updateValidatorDocDetails = async (id, payload) => {
    try {
        const response = await putApi(`/api/frontend/validators/document/update/${id}/`, payload, {
        })
        return { data: response?.data || null, error: null };
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}
export const createValidatorCrossCheckDetails = async (id, payload) => {
    try {
        const response = await postApi(`/api/frontend/validators/rule/add/${id}/`, payload, {}
        )
        return { data: response?.data || null, error: null };
    } catch (erroe) {
        console.log("FULL ERORO ", erroe.response)
        return { data: null, error: erroe.response?.data || erroe.message };
    }
}
export const updateValidatorCrossCheckDetails = async (id, payload) => {
    try {
        const response = await putApi(
            `/api/frontend/validators/rule/update/${id}/`,
            payload
        );

        return {
            data: response?.data || null,
            error: response?.error || null,
        };
    } catch (error) {
        console.log("FULL ERROR:", error);
        return {
            data: null,
            error: error.response?.data || error.message,
        };
    }
};
export const deleteValidatorCrossCheckDetails = async (id) => {
    try {
        const response = await deleteApi(`/api/frontend/validators/rule/delete/${id}/`);
        return { data: response?.data || null, error: null };
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}
export const getDocumentTypeOptions = async (setDocumentTypes, dispatch) => {
    try {
        const response = await getApi(`/api/frontend/reference/document-types/`, {
        })
       
        if (response?.data?.data) {
            dispatch(setDocumentTypes(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}

export const getPolicyExtractedFields = async (policyId, dispatch, setPolicyExtractedFields) => {
    try {
        const response = await getApi(`/api/frontend/reference/extract-fields/?document_type=${policyId}`, {});
        if (response?.data?.data) {
            dispatch(setPolicyExtractedFields(response?.data?.data || []))
        }
    } catch (error) {
        console.log("FULL ERROR:", error.response);
        return { data: null, error: error.response?.data || error.message };
    }
}