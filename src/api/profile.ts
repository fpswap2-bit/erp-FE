import api from "./axios"; // your existing axios instance (baseURL + CSRF header + withCredentials)
import type {
  EditableField,
  ProfileData,
  ProfileResponse,
} from "@/types/profile";

const M = "/api/method/surabhierp.api.profile";

type Msg<T> = { message: T };

export const fetchProfile = async (): Promise<ProfileResponse> =>
  (await api.get<Msg<ProfileResponse>>(`${M}.get_profile`)).data.message;


export const updateProfile = async (
  data: Partial<Record<EditableField, string | null>>,
): Promise<ProfileData> =>
  (await api.post<Msg<ProfileData>>(`${M}.update_profile`, { data })).data
    .message;


export const uploadProfileImage = async (file: File): Promise<ProfileData> => {
  const body = new FormData();
  body.append("file", file);
  return (
    await api.post<Msg<ProfileData>>(`${M}.upload_profile_image`, body, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data.message;
};

export const removeProfileImage = async (): Promise<ProfileData> =>
  (await api.post<Msg<ProfileData>>(`${M}.remove_profile_image`)).data.message;

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "incorrect_password" };

export const changePassword = async (
  old_password: string,
  new_password: string,
): Promise<ChangePasswordResult> =>
  (
    await api.post<Msg<ChangePasswordResult>>(`${M}.change_password`, {
      old_password,
      new_password,
    })
  ).data.message;

export const sendPasswordResetLink = async (): Promise<void> => {
  await api.post(`${M}.send_password_reset_link`);
};

/** Turns a Frappe error response into a readable string. */
export function getErrorMessage(err: unknown): string {
  const e = err as {
    message?: string;
    response?: { data?: { _server_messages?: string; exception?: string } };
  };
  const raw = e?.response?.data?._server_messages;
  if (raw) {
    try {
      const text = (JSON.parse(raw) as string[])
        .map((m) => (JSON.parse(m) as { message: string }).message)
        .join(" ");
      return text.replace(/<[^>]*>/g, "");
    } catch {
      /* fall through */
    }
  }
  const exc = e?.response?.data?.exception;
  if (exc) return exc.split(": ").slice(1).join(": ") || exc;
  return e?.message ?? "Something went wrong";
}

/** Frappe returns /files/xyz.png — prefix with the backend origin if the SPA is on another origin. */
export const assetUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.VITE_FRAPPE_URL ?? ""}${path}`;
};