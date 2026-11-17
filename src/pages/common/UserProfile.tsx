import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchProfile, getErrorMessage, updateProfile } from "@/api/profile";
import { EDITABLE_FIELDS, type EditableField, type ProfileData, type ProfileForm, type ProfileOptions } from "@/types/profile";

import { ProfileSkeleton } from "@/components/common/ProfileFields";
import { ProfileHeader } from "@/components/common/ProfileHeader";
import { BasicInfoCard } from "@/components/common/BasicInfoCard";
import { MoreInfoCard } from "@/components/common/MoreInfoCard";
import { SecurityCard } from "@/components/common/SecurityCard";
import { PasswordDialog } from "@/components/common/PasswordDialog";

const toForm = (p: ProfileData): ProfileForm =>
  Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, p[f] ?? ""])) as ProfileForm;

export default function UserProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [options, setOptions] = useState<ProfileOptions | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const applyProfile = useCallback((p: ProfileData) => {
    setProfile(p);
    setForm(toForm(p));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProfile();
      applyProfile(res.profile);
      setOptions(res.options);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => { void load(); }, [load]);

  const changes = useMemo(() => {
    if (!profile || !form) return {};
    const original = toForm(profile);
    return Object.fromEntries(
      EDITABLE_FIELDS.filter((f) => form[f] !== original[f]).map((f) => [f, form[f]])
    ) as Partial<Record<EditableField, string>>;
  }, [profile, form]);

  const dirty = Object.keys(changes).length > 0;

  const onSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      applyProfile(await updateProfile(changes));
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (profile) setForm(toForm(profile));
    setEditing(false);
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !profile || !form || !options) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-20 text-center">
        <p className="text-sm text-destructive">{error ?? "Could not load profile"}</p>
        <Button variant="outline" onClick={load}>Try again</Button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl p-4 pb-12 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </div>

      <ProfileHeader
        profile={profile}
        editing={editing}
        saving={saving}
        dirty={dirty}
        onProfileUpdate={setProfile}
        onEdit={() => setEditing(true)}
        onCancel={onCancel}
        onSave={onSave}
      />

      <BasicInfoCard profile={profile} />

      <MoreInfoCard
        form={form}
        options={options}
        editing={editing}
        onChange={(f, val) => setForm((prev) => (prev ? { ...prev, [f]: val } : prev))}
      />

      <SecurityCard onManagePassword={() => setPwdOpen(true)} />

      <PasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
    </main>
  );
}