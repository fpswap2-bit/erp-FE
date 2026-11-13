
import api from "./axios";

const METHOD = "/api/method/surabhierp.api.fee_payment.";

export type FeePaymentStatus =
    | "Pending Verification"
    | "Verified"
    | "Rejected";

export interface FeePayment {
    name: string;
    student: string;
    student_name: string;
    enrollment_number: string;
    fee_plan: string;
    semester: string;
    amount: number;
    transaction_id: string;
    status: FeePaymentStatus;
    creation: string;
}

export interface FeePaymentDetails extends FeePayment {
    screenshot: string | null;
    remarks: string | null;
    verified_by: string | null;
    receipt: {
        name: string;
        issued_on: string;
        issued_by: string;
    } | null;
}

export const feePaymentApi = {
    async getRecords(params: {
        search?: string;
        status?: string;
        start?: number;
        page_length?: number;
    }) {
        const { data } = await api.get(
            METHOD + "get_fee_payments",
            { params }
        );
        return data.message as {
            records: FeePayment[];
            total: number;
        };
    },

    async getPayment(name: string) {
        const { data } = await api.get(
            METHOD + "get_fee_payment",
            { params: { name } }
        );
        return data.message as FeePaymentDetails;
    },

    async verify(
        payment: string,
        action: "Verified" | "Rejected",
        remarks?: string
    ) {
        const { data } = await api.post(
            METHOD + "verify_fee_payment",
            { payment, action, remarks }
        );
        return data.message as {
            payment: string;
            status: FeePaymentStatus;
            receipt: string | null;
        };
    },
};
