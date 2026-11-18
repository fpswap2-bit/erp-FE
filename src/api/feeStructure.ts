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

export interface FeeStructure extends FeeStructureData {
    name: string;
    modified: string;
}

export interface FeeStructureFilters {
    search?: string;
    academic_year?: string;
    branch?: string;
    study_year?: string;
    start?: number;
    page_length?: number;
}

export interface FeeStructureResponse {
    records: FeeStructure[];
    total: number;
}

export const getFeeStructureOptions = () =>
    api.get(METHOD + "get_fee_structure_options")
        .then(({ data }) => data.message as FeeStructureOptions);

export const createFeeStructure = (payload: FeeStructureData) =>
    api.post(METHOD + "create_fee_structure", { data: payload })
        .then(({ data }) => data.message as Pick<FeeStructure, "name" | "branch" | "academic_year" | "study_year">);

export const getFeeStructures = (filters: FeeStructureFilters) =>
    api.get(METHOD + "get_fee_structures", { params: filters })
        .then(({ data }) => data.message as FeeStructureResponse);