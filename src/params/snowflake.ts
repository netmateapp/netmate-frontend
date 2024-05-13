import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => {
    return /^\d{1,20}$/.test(param);
}
