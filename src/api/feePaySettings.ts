
import api from "./axios";

const BASE = "/api/method/surabhierp.api.fee_pay_settings.";

export interface FeePaymentSettings {
    qr_image: string | null;
    whatsapp_number: string | null;
    bank_details: string | null;
}

export const feePaySettingsApi = {
    get: () =>
        api.get<{ message: FeePaymentSettings }>(
            `${BASE}get_fee_payment_settings`
        ),

    save: (data: Partial<FeePaymentSettings>) =>
        api.post(`${BASE}save_fee_payment_settings`, { data }),

    uploadQR: (file: File, onProgress?: (percent: number) => void) => {
        const form = new FormData();
        form.append("file", file, file.name);
        form.append("is_private", "1");
        form.append("doctype", "Fee Payment Settings");
        form.append("docname", "Fee Payment Settings");
        form.append("fieldname", "qr_image");

        return api.post("/api/method/upload_file", form, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            },
        });
    },
};
