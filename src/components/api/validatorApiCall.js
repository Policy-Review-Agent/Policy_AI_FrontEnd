import { getApi } from "./getApi";
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