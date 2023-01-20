
import { CoreDataSelectorResponse } from "../../dataAccess";
import { CoreState } from "../../reducers";

export const selectCSRFToken = (
  state: CoreState,
): string => {
  return state.csrfToken;
};

export const selectCSRFTokenData = (
  state: CoreState,
): CoreDataSelectorResponse<string> => {
  return {
    data: state.csrf.csrfToken,
    status: state.csrf.status,
    error: state.csrf.error,
  };
};
