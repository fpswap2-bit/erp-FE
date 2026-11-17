import { Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Value } from "./ProfileFields";
import type { EditableField, ProfileForm, ProfileOptions } from "@/types/profile";

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50";

interface MoreInfoCardProps {
  form: ProfileForm;
  options: ProfileOptions;
  editing: boolean;
  onChange: (field: EditableField, value: string) => void;
}

export function MoreInfoCard({ form, options, editing, onChange }: MoreInfoCardProps) {
  const renderText = (f: EditableField, label: string, type = "text") => (
    <Field label={label} htmlFor={f}>
      {editing ? (
        <Input
          id={f}
          type={type}
          value={form[f]}
          max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
          onChange={(e) => onChange(f, e.target.value)}
        />
      ) : (
        <Value>{form[f]}</Value>
      )}
    </Field>
  );

  const renderSelect = (f: EditableField, label: string, opts: { value: string; label: string }[]) => (
    <Field label={label} htmlFor={f}>
      {editing ? (
        <select id={f} className={selectClass} value={form[f]} onChange={(e) => onChange(f, e.target.value)}>
          <option value="">Not set</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <Value>{opts.find((o) => o.value === form[f])?.label ?? form[f]}</Value>
      )}
    </Field>
  );

  const renderArea = (f: "interest" | "bio", label: string, rows: number) => (
    <Field label={label} htmlFor={f} className="md:col-span-2">
      {editing ? (
        <Textarea id={f} rows={rows} value={form[f]} onChange={(e) => onChange(f, e.target.value)} className="resize-y" />
      ) : (
        <Value>{form[f]}</Value>
      )}
    </Field>
  );

  return (
    <Card className="bg-white">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Pencil className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">More Information</CardTitle>
            <CardDescription>Contact details, preferences and personal information.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        {renderSelect("language", "Language", options.languages.map((l) => ({ value: l.name, label: l.language_name || l.name })))}
        {renderSelect("time_zone", "Time Zone", options.time_zones.map((z) => ({ value: z, label: z })))}
        {renderSelect("gender", "Gender", options.genders.map((g) => ({ value: g, label: g })))}
        {renderText("birth_date", "Birth Date", "date")}
        {renderText("mobile_no", "Mobile Number", "tel")}
        {renderText("phone", "Phone", "tel")}
        {renderText("location", "Location")}
        {renderArea("interest", "Interests", 2)}
        {renderArea("bio", "About Me", 4)}
      </CardContent>
    </Card>
  );
}