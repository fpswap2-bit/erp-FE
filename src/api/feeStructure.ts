
import api from "./axios";

const METHOD = "/api/method/surabhierp.api.fee_structure.";

export interface FeeStructureData {
    branch: string;
    academic_year: string;
    study_year: string;
    odd_semester_fee: number;
    even_semester_fee: number;
}

export interface FeeStructureOptions {
    branches: string[];
    academic_years: string[];
}

export const getFeeStructureOptions = async () => {
    const { data } = await api.get(
        METHOD + "get_fee_structure_options"
    );

    return data.message as FeeStructureOptions;
};

export const createFeeStructure = async (payload: FeeStructureData) => {
    const { data } = await api.post(
        METHOD + "create_fee_structure",
        { data: payload }
    );

    return data.message as {
        name: string;
        branch: string;
        academic_year: string;
        study_year: string;
    };
};
