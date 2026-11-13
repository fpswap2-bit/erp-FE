
import api from "./axios";

const METHOD = "/api/method/surabhierp.api.fee_plan.";

export interface FeePlanItem {
    name: string;
    semester_no: number;
    period: string;
    default_amount: number;
    amount: number;
    overridden: number;
    override_reason: string | null;
}

export interface FeePlan {
    name: string;
    student: string;
    student_name: string;
    enrollment_number: string;
    academic_year: string;
    study_year: string;
    branch: string;
    fee_structure: string;
    total_amount: number;
    modified?: string;
}

export interface FeePlanDetails extends Omit<FeePlan, "student_name" | "enrollment_number" | "modified"> {
    items: FeePlanItem[];
}

export const getFeePlans = async (params: {
    search?: string;
    academic_year?: string;
    branch?: string;
    study_year?: string;
    start?: number;
    page_length?: number;
}) => {
    const { data } = await api.get(METHOD + "get_fee_plans", { params });
    return data.message as { records: FeePlan[]; total: number };
};

export const getFeePlan = async (name: string) => {
    const { data } = await api.get(METHOD + "get_fee_plan", {
        params: { name },
    });
    return data.message as FeePlanDetails;
};

export const updateFeePlan = async (
    name: string,
    items: Pick<FeePlanItem, "name" | "amount" | "override_reason">[]
) => {
    const { data } = await api.post(METHOD + "update_fee_plan", {
        name,
        items,
    });
    return data.message as { name: string; total_amount: number };
};
