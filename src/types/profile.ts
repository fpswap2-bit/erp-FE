
export const EDITABLE_FIELDS = [
  "language",
  "time_zone",
  "gender",
  "birth_date",
  "phone",
  "mobile_no",
  "location",
  "interest",
  "bio",
] as const;

export type EditableField = (typeof EDITABLE_FIELDS)[number];

/** Form state: only editable fields. */
export type ProfileForm = Record<EditableField, string>;

export interface ProfileData {
  // Read-only basic information
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string;

  // Editable more information
  language: string | null;
  time_zone: string | null;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  mobile_no: string | null;
  location: string | null;
  interest: string | null;
  bio: string | null;

  // Profile picture
  user_image: string | null;

  // Other read-only metadata
  full_name: string;
  user_type: string;
  last_login: string | null;
  last_active: string | null;
}

export interface ProfileOptions {
  languages: { name: string; language_name: string }[];
  genders: string[];
  time_zones: string[];
}

export interface ProfileResponse {
  profile: ProfileData;
  options: ProfileOptions;
}
