
import api from "./axios";

const METHOD = "/api/method/surabhierp.api.fee_receipt.";

export interface FeeReceipt {
    name: string;
    payment: string;
    student: string;
    student_name: string;
    enrollment_number: string;
    semester: string;
    amount: number;
    transaction_id: string | null;
    issued_on: string | null;
    issued_by: string | null;
}

export interface FeeReceiptDetails extends FeeReceipt {
    payment_screenshot: string | null;
    academic_year: string | null;
    branch: string | null;
}

export const feeReceiptApi = {
    async getRecords(params: {
        search?: string;
        start?: number;
        page_length?: number;
    }) {
        const { data } = await api.get(METHOD + "get_fee_receipts", {
            params,
        });

        return data.message as {
            records: FeeReceipt[];
            total: number;
        };
    },

    async getReceipt(name: string) {
        const { data } = await api.get(METHOD + "get_fee_receipt", {
            params: { name },
        });

        return data.message as FeeReceiptDetails;
    },
};
