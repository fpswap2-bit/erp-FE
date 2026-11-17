import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { changePassword, getErrorMessage, sendPasswordResetLink } from "@/api/profile";
import { Field } from "./ProfileFields";

export function PasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [mailing, setMailing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldInvalid, setOldInvalid] = useState(false);
  const oldRef = useRef<HTMLInputElement>(null);

  const mismatch = confirm.length > 0 && newPwd !== confirm;
  const canSubmit = !!oldPwd && newPwd.length >= 8 && newPwd === confirm;

  const reset = () => {
    setOldPwd("");
    setNewPwd("");
    setConfirm("");
    setError(null);
    setOldInvalid(false);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    setOldInvalid(false);

    try {
      const res = await changePassword(oldPwd, newPwd);
      if (!res.ok) {
        setOldInvalid(true);
        setError("The current password is incorrect. Please try again.");
        setOldPwd("");
        oldRef.current?.focus();
        return;
      }
      toast.success("Password changed. Other devices were signed out.");
      reset();
      onOpenChange(false);
    } catch (e) {
      const status = (e as { response?: { status?: number } }).response?.status;
      setError(status === 429 ? "Too many attempts. Please wait a few minutes and try again." : getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const emailLink = async () => {
    setMailing(true);
    try {
      await sendPasswordResetLink();
      toast.success("Reset link sent to your email");
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setMailing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md bg-white/65">
        <DialogHeader>
          <DialogTitle>Manage Password</DialogTitle>
          <DialogDescription>
            Choose a new password for your account. Other devices will be signed out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Current Password" htmlFor="old_pwd">
            <Input
              id="old_pwd"
              ref={oldRef}
              type="password"
              autoComplete="current-password"
              value={oldPwd}
              aria-invalid={oldInvalid}
              onChange={(e) => {
                setOldPwd(e.target.value);
                if (oldInvalid) { setOldInvalid(false); setError(null); }
              }}
            />
          </Field>

          <Field label="New Password (minimum 8 characters)" htmlFor="new_pwd">
            <Input id="new_pwd" type="password" autoComplete="new-password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </Field>

          <Field label="Confirm New Password" htmlFor="confirm_pwd">
            <Input id="confirm_pwd" type="password" autoComplete="new-password" value={confirm} aria-invalid={mismatch} onChange={(e) => setConfirm(e.target.value)} />
            {mismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
          </Field>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={emailLink}
          disabled={mailing}
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline disabled:opacity-50"
        >
          {mailing ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
          Forgot your current password? Email me a reset link
        </button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || busy}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Update Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}