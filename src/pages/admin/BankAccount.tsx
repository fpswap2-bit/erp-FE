
import { useEffect, useRef, useState } from "react";
import { Landmark, Upload, Save, X, Loader2 } from "lucide-react";
import { feePaySettingsApi, type FeePaymentSettings } from "../../api/feePaySettings";

const initialSettings: FeePaymentSettings = {
    qr_image: null,
    whatsapp_number: "",
    bank_details: "",
};

export default function BankAccount() {
    const [settings, setSettings] = useState<FeePaymentSettings>(initialSettings);
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [notice, setNotice] = useState("");
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        feePaySettingsApi.get()
            .then(({ data }) => {
                const values = data.message;
                setSettings(values);
                setPreview(values.qr_image || "");
            })
            .catch(() => setNotice("Unable to load bank settings."))
            .finally(() => setLoading(false));
    }, []);

    const handleQRChange = (file?: File) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setNotice("Please select a valid image.");
            return;
        }

        setQrFile(file);
        setPreview(URL.createObjectURL(file));
        setNotice("");
    };

    const saveSettings = async () => {
        setSaving(true);
        setNotice("");

        try {
            let qrImage = settings.qr_image;

            if (qrFile) {
                const { data } = await feePaySettingsApi.uploadQR(
                    qrFile,
                    setUploadProgress
                );
                qrImage = data.message.file_url;
            }

            await feePaySettingsApi.save({
                qr_image: qrImage,
                whatsapp_number: settings.whatsapp_number,
                bank_details: settings.bank_details,
            });

            setSettings((prev) => ({ ...prev, qr_image: qrImage }));
            setQrFile(null);
            setNotice("Bank details saved successfully.");
        } catch (error: any) {
            setNotice(
                error.response?.data?.message || "Unable to save bank details."
            );
        } finally {
            setSaving(false);
            setUploadProgress(0);
        }
    };

    const updateField = (
        field: keyof FeePaymentSettings,
        value: string
    ) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="mr-2 animate-spin" size={20} />
                Loading bank settings...
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-4xl">
            <div className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8e1b1b]">
                    Administration / Fee Configuration
                </p>
                <h1 className="font-serif text-3xl font-bold text-gray-900">
                    Setup Bank Details
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Manage the institutional payment information displayed to students.
                </p>
            </div>

            {notice && (
                <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {notice}
                </div>
            )}

            <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Bank QR Image
                    </label>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Bank payment QR"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Landmark className="mx-auto mb-2" size={32} />
                                    <span className="text-xs">No QR image</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Upload size={16} />
                                Upload QR Image
                            </button>

                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handleQRChange(e.target.files?.[0])}
                            />

                            {qrFile && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                    <span className="max-w-48 truncate">{qrFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQrFile(null);
                                            setPreview(settings.qr_image || "");
                                            if (fileInput.current) fileInput.current.value = "";
                                        }}
                                        className="text-red-600"
                                        aria-label="Remove selected QR image"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {saving && uploadProgress > 0 && (
                                <p className="mt-3 text-xs text-gray-500">
                                    Uploading QR: {uploadProgress}%
                                </p>
                            )}

                            <p className="mt-3 text-xs text-gray-500">
                                Upload a clear bank or UPI QR image.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                        WhatsApp Number for Screenshots
                    </label>
                    <input
                        type="tel"
                        value={settings.whatsapp_number || ""}
                        onChange={(e) => updateField("whatsapp_number", e.target.value)}
                        placeholder="Enter WhatsApp number with country code"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#8e1b1b] focus:ring-1 focus:ring-[#8e1b1b]"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Bank Details
                    </label>
                    <textarea
                        rows={6}
                        value={settings.bank_details || ""}
                        onChange={(e) => updateField("bank_details", e.target.value)}
                        placeholder="Enter bank name, account holder, account number, IFSC, branch, etc."
                        className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#8e1b1b] focus:ring-1 focus:ring-[#8e1b1b]"
                    />
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-5">
                    <button
                        type="button"
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-[#8e1b1b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#701515] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {saving ? "Saving..." : "Save Bank Details"}
                    </button>
                </div>
            </div>
        </section>
    );
}
