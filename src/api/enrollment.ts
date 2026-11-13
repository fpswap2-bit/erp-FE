import api from "./axios";

const BASE = "/api/method/surabhierp.api.enrollment.";

export interface EnrollmentRecord {
    name: string;
    name_as_per_10th: string | null;
    docstatus: number;
    registration_no: string | null;
    academic_year: string | null;
    enrollment_number: string | null;
    modified: string;
}

export interface EnrollmentRecordsResponse {
    records: EnrollmentRecord[];
    total: number;
    counts: { total: number; draft: number; submitted: number; cancelled: number };
}

export const enrollmentApi = {
    // Student
    getSchema: () =>
        api.post(`${BASE}get_form_schema`),

    getOptions: () =>
        api.post(`${BASE}get_form_options`),

    getMyEnrollment: () =>
        api.post(`${BASE}get_my_enrollment`),

    save: (data: Record<string, unknown>) =>
        api.post(`${BASE}save_enrollment`, { data }),
    
    uploadFile: (
    file: File,
    docName: string,
    fieldname: string,
    onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("is_private", "1");
    form.append("doctype", "Student Enrollment Form");
    form.append("docname", docName);
    form.append("fieldname", fieldname);
    return api.post("/api/method/upload_file", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
        if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
        }
    },
    });
    },
    getRecords: (params: {
    student_name?: string;
    enrollment_no?: string;
    status?: string;
    start?: number;
    page_length?: number; 
    }) =>
    api.get<{ message: EnrollmentRecordsResponse }>(
        "/api/method/surabhierp.api.enrollment.get_enrollment_records",
        { params }
    ),
    setAttachment: (name: string, fieldname: string, file_url: string) =>
    api.post("/api/method/surabhierp.api.enrollment.set_attachment", {
        name,
        fieldname,
        file_url,
    }),

    // Admin / Academic
    getEnrollment: (name: string) =>
    api.get(`${BASE}get_enrollment`, { params: { name } }),

    submit: (name: string) => api.post(`${BASE}submit_enrollment`, { name }),
    reject: (name: string, reason: string) => api.post(`${BASE}reject_enrollment`, { name, reason }),
    cancel: (name: string, reason?: string) => api.post(`${BASE}cancel_enrollment`, { name, reason }),
    amend: (name: string) => api.post(`${BASE}create_enrollment_amendment`, { name }),

};

