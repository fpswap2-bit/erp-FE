import api from "./axios";

const METHOD = "/api/method/surabhierp.api.fee_payment.";

export interface StudentPaymentItem {
    semester: string;
    period: string;
    amount: number;
    status: "Pending Verification" | "Verified" | "Rejected" | null;
    payment_id: string | null;
}

export interface StudentPaymentContext {
    student: {
        name: string;
        name_as_per_10th: string;
        enrollment_number: string;
        academic_year: string;
        branch: string;
    };
    fee_plan: {
        name: string;
        academic_year: string;
        study_year: string;
        branch: string;
        total_amount: number;
        items: StudentPaymentItem[];
    };
}

export interface StudentPaymentSettings {
    qr_image?: string;
    whatsapp_number?: string;
    bank_details?: string;
}

export const studentFeePaymentApi = {
    async getContext() {
        const { data } = await api.get(
            METHOD + "get_student_payment_context"
        );
        return data.message as StudentPaymentContext;
    },

    async getSettings() {
        const { data } = await api.get(
            METHOD + "get_student_payment_settings"
        );
        return data.message as StudentPaymentSettings;
    },
    uploadScreenshot: (file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("is_private", "1");
    return api.post("/api/method/upload_file", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
            if (onProgress && e.total) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        },
    });
    },
    async createPayment(payload: {
        fee_plan: string;
        semester: string;
        transaction_id: string;
        screenshot: string;
    }) {
        const { data } = await api.post(
            METHOD + "create_student_fee_payment",
            payload
        );
        return data.message as { name: string; amount: number };
    },
};