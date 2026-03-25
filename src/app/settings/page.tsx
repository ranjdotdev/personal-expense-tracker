"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { signout, getCurrentUser } from "@/server/actions/auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import { LogOut, User } from "lucide-react";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, []);

  const onSignout = async () => {
    const result = await signout();
    if (result.success) {
      router.push("/signin");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1 text-base">{user?.name ?? "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {user?.id ?? "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Account actions and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <Button
              variant="destructive"
              onClick={onSignout}
              className="w-full gap-2"
            >
              <LogOut className="size-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
