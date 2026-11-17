import { UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Value } from "./ProfileFields";
import type { ProfileData } from "@/types/profile";

export function BasicInfoCard({ profile }: { profile: ProfileData }) {
  const fields: [string, string | null | undefined][] = [
    ["First Name", profile.first_name],
    ["Middle Name", profile.middle_name],
    ["Last Name", profile.last_name],
    ["Username", profile.username],
    ["Email Address", profile.email],
  ];

  return (
    <Card className="bg-white">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <UserRound className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>Your account identity and registered details.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        {fields.map(([label, value]) => (
          <Field key={label} label={label} htmlFor={`basic-${label}`}>
            <Value>{value}</Value>
          </Field>
        ))}
      </CardContent>
    </Card>
  );
}