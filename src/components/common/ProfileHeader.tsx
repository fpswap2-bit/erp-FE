import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Mail, Pencil, Save, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { assetUrl, getErrorMessage, removeProfileImage, uploadProfileImage } from "@/api/profile";
import type { ProfileData } from "@/types/profile";

const MAX_IMAGE_MB = 2;

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

const fmtDateTime = (v?: string | null) =>
  v ? new Date(v.replace(" ", "T")).toLocaleString() : "—";

interface ProfileHeaderProps {
  profile: ProfileData;
  editing: boolean;
  saving: boolean;
  dirty: boolean;
  onProfileUpdate: (p: ProfileData) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileHeader({
  profile, editing, saving, dirty, onProfileUpdate, onEdit, onCancel, onSave,
}: ProfileHeaderProps) {
  const [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      return toast.error("Please choose a JPG, PNG or WEBP image");
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return toast.error(`Image must be ${MAX_IMAGE_MB} MB or smaller`);
    }

    setImageBusy(true);
    try {
      onProfileUpdate(await uploadProfileImage(file));
      toast.success("Profile photo updated");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setImageBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onRemoveImage = async () => {
    setImageBusy(true);
    try {
      onProfileUpdate(await removeProfileImage());
      toast.success("Profile photo removed");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setImageBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-white">
      <div className="h-1 bg-primary" />
      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="relative mx-auto sm:mx-0">
          <Avatar className="size-24 border-4 border-background bg-slate-200 shadow-md">
            <AvatarImage src={assetUrl(profile.user_image)} alt={profile.full_name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="default"
            aria-label="Change profile photo"
            disabled={imageBusy}
            onClick={() => fileRef.current?.click()}
            className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {imageBusy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          </Button>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void onPickImage(e.target.files?.[0])}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
          <h2 className="truncate text-xl font-semibold">{profile.full_name}</h2>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </p>
          <p className="pt-1 text-xs text-muted-foreground">
            Last login: {fmtDateTime(profile.last_login)}
          </p>

          {profile.user_image && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 px-2 text-xs text-muted-foreground"
              disabled={imageBusy}
              onClick={onRemoveImage}
            >
              <Trash2 className="mr-1 size-3.5" />
              Remove photo
            </Button>
          )}
        </div>

        <div className="flex justify-center gap-2 sm:justify-end">
          {editing ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                <X className="mr-1 size-4" /> Cancel
              </Button>
              <Button onClick={onSave} disabled={!dirty || saving}>
                {saving ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Save className="mr-1 size-4" />}
                Save changes
              </Button>
            </>
          ) : (
            <Button variant="default" onClick={onEdit}>
              <Pencil className="mr-2 size-4" /> Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}