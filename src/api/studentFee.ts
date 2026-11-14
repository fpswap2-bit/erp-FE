import api from "./axios";

const METHOD = "/api/method/surabhierp.api.student_fee.";

export interface MyFeeItem {
    semester_no: number;
    period: string | null;
    default_amount: number;
    amount: number;
    overridden: number;
}

export interface MyFeeStructure {
    name: string;
    branch: string;
    academic_year: string;
    study_year: string;
    odd_semester_fee: number;
    even_semester_fee: number;
}

export interface MyFeePlan {
    name: string;
    academic_year: string;
    study_year: string;
    branch: string;
    fee_structure: string | null;
    total_amount: number;
    structure: MyFeeStructure | null;
    items: MyFeeItem[];
}

export interface MyFeeOverview {
    student: {
        name: string;
        student_name: string | null;
        enrollment_number: string | null;
    } | null;
    plans: MyFeePlan[];
}

export const getMyFeeOverview = async () => {
    const { data } = await api.get(METHOD + "get_my_fee_overview");
    return data.message as MyFeeOverview;
};