import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityCard({ onManagePassword }: { onManagePassword: () => void }) {
  return (
    <Card className="bg-white">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>Manage your password and account security.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium">Password</p>
          <p className="text-xs text-muted-foreground">
            Change your password or request a reset link by email.
          </p>
        </div>

        <Button variant="default" onClick={onManagePassword}>
          <KeyRound className="mr-2 size-4" />
          Manage password
        </Button>
      </CardContent>
    </Card>
  );
}