import { create } from "zustand";
import { enrollmentApi } from "@/api/enrollment";

export interface FormField {
    fieldname: string;
    label: string;
    fieldtype: string;
    reqd: number;
    read_only?: number;
    options?: string[] | string;
    description?: string;
}

export interface FormOptions {
    select: Record<string, string[]>;
    link: Record<string, string[]>;
}

export type Notice = { text: string; error: boolean } | null;

interface EnrollmentState {
    fields: FormField[];
    options: FormOptions;
    values: Record<string, any>;
    docName: string;
    docstatus: number | null;
    rejectionReason: string;
    loading: boolean;
    saving: boolean;
    acting: boolean;
    notice: Notice;

    loadStudent: () => Promise<void>;
    loadAdmin: (name: string, silent?: boolean) => Promise<void>;
    setValue: (fieldname: string, value: any) => void;
    saveDraft: () => Promise<boolean>;
    submit: () => Promise<boolean>;
    reject: (reason: string) => Promise<boolean>;
    cancel: (reason: string) => Promise<boolean>;
    amend: () => Promise<string | null>;
}

const initial = {
    fields: [] as FormField[],
    options: { select: {}, link: {} } as FormOptions,
    values: {} as Record<string, any>,
    docName: "",
    docstatus: null as number | null,
    rejectionReason: "",
    loading: true,
    saving: false,
    acting: false,
    notice: null as Notice,
};

// Frappe puts readable text in _server_messages (a JSON string of JSON strings)
function errorText(e: any, fallback: string) {
    const raw = e?.response?.data?._server_messages;
    if (raw) {
        try {
            const text = (JSON.parse(raw) as string[])
                .map((m) => JSON.parse(m).message)
                .join(" ")
                .replace(/<[^>]+>/g, "");
            if (text) return text;
        } catch {
            /* fall through */
        }
    }
    return e?.message || fallback;
}

let loadId = 0; // ignores responses from an older load

export const useEnrollmentStore = create<EnrollmentState>((set, get) => {
    const run = async (call: (name: string) => Promise<unknown>, okText: string) => {
        const name = get().docName;
        set({ acting: true, notice: null });
        try {
            await call(name);
            await get().loadAdmin(name, true);
            set({ notice: { text: okText, error: false } });
            return true;
        } catch (e) {
            set({ notice: { text: errorText(e, "Action failed."), error: true } });
            return false;
        } finally {
            set({ acting: false });
        }
    };

    return {
        ...initial,

        loadStudent: async () => {
            const id = ++loadId;
            set({ ...initial });
            try {
                const [schemaRes, optionsRes, enrollmentRes] = await Promise.all([
                    enrollmentApi.getSchema(),
                    enrollmentApi.getOptions(),
                    enrollmentApi.getMyEnrollment(),
                ]);
                if (id !== loadId) return;

                const opts = optionsRes.data.message;
                const enrollment = enrollmentRes.data.message;

                set({
                    fields: schemaRes.data.message,
                    options: { select: opts?.select ?? {}, link: opts?.link ?? {} },
                    values: enrollment.exists ? enrollment.data : {},
                    docName: enrollment.exists ? enrollment.name : "",
                    docstatus: enrollment.exists ? enrollment.docstatus : 0,
                    rejectionReason: enrollment.rejection_reason ?? "",
                    loading: false,
                });
            } catch (e) {
                if (id !== loadId) return;
                set({ loading: false, notice: { text: "Unable to load enrollment form.", error: true } });
            }
        },

        loadAdmin: async (name, silent = false) => {
            const id = ++loadId;
            if (!silent) set({ ...initial });
            try {
                const [optionsRes, recordRes] = await Promise.all([
                    enrollmentApi.getOptions(),
                    enrollmentApi.getEnrollment(name),
                ]);
                if (id !== loadId) return;

                const opts = optionsRes.data.message;
                const record = recordRes.data.message;

                set({
                    fields: record.fields,
                    options: { select: opts?.select ?? {}, link: opts?.link ?? {} },
                    values: record.values,
                    docName: record.name,
                    docstatus: record.docstatus,
                    rejectionReason: record.values?.rejection_reason ?? "",
                    loading: false,
                });
            } catch (e) {
                if (id !== loadId) return;
                set({ loading: false, notice: { text: errorText(e, "Unable to load this record."), error: true } });
            }
        },

        setValue: (fieldname, value) =>
            set((s) => ({ values: { ...s.values, [fieldname]: value } })),

        saveDraft: async () => {
            const { docstatus, values, docName } = get();
            if (docstatus !== 0) return false;

            set({ saving: true, notice: null });
            try {
                const res = await enrollmentApi.save({ ...values, ...(docName && { name: docName }) });
                set({
                    docName: res.data.message.name,
                    notice: { text: "Draft saved successfully.", error: false },
                });
                return true;
            } catch (e) {
                set({ notice: { text: errorText(e, "Unable to save enrollment."), error: true } });
                return false;
            } finally {
                set({ saving: false });
            }
        },

        // Saves the admin's edits first, then submits
        submit: async () => {
            if (!(await get().saveDraft())) return false;
            return run((n) => enrollmentApi.submit(n), "Application approved and submitted.");
        },

        reject: (reason) =>
            run((n) => enrollmentApi.reject(n, reason), "Application rejected and returned to the student."),

        cancel: (reason) =>
            run((n) => enrollmentApi.cancel(n, reason), "Application cancelled."),

        amend: async () => {
            set({ acting: true, notice: null });
            try {
                const res = await enrollmentApi.amend(get().docName);
                return res.data.message.name as string;
            } catch (e) {
                set({ notice: { text: errorText(e, "Unable to create amendment."), error: true } });
                return null;
            } finally {
                set({ acting: false });
            }
        },
    };
});