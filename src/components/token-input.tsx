"use client";

import { api } from "@/lib/api-client";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TokenInputProps {
  onTokenSubmit: (token: string, useSessionStorage: boolean) => void;
  isLoading?: boolean;
}

type FormValues = {
  token: string;
  useSessionStorage: boolean;
};

export function TokenInput({
  onTokenSubmit,
  isLoading = false,
}: TokenInputProps) {
  const [showToken, setShowToken] = useState(false);
  const [validating, setValidating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      token: "",
      useSessionStorage: true,
    },
    mode: "onChange",
  });

  const onFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (data.token.trim()) {
      try {
        setValidating(true);
        // Validate token with the backend
        const response = await api.validateToken(data.token.trim());

        if (response.success) {
          // Pass the encrypted token from the backend to the parent component
          onTokenSubmit(response.token, data.useSessionStorage);
          toast.success("Successfully connected to GitLab");
        } else {
          toast.error(response.error || "Invalid GitLab token");
        }
      } catch (error) {
        toast.error("Failed to validate token");
        console.error(error);
      } finally {
        setValidating(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Connect to GitLab</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Enter your GitLab personal access token to view your projects. You can
        create a new token in your GitLab account settings with
        <strong className="text-foreground"> read_api</strong> scope.
      </p>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Personal Access Token</Label>
          <div className="relative">
            <Input
              id="token"
              type={showToken ? "text" : "password"}
              {...register("token", {
                required: "Token is required",
                minLength: {
                  value: 20,
                  message:
                    "GitLab tokens are usually longer than 20 characters",
                },
              })}
              className={errors.token ? "border-destructive" : ""}
              placeholder="Enter your GitLab personal access token"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showToken ? "Hide" : "Show"} token
              </span>
            </Button>
          </div>
          {errors.token && (
            <p className="text-destructive text-xs">{errors.token.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="useSessionStorage"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="useSessionStorage"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            htmlFor="useSessionStorage"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Use session storage only (token will be cleared when you close the
            browser)
          </Label>
        </div>

        <div className="pt-1 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-medium mb-1">Security notes:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your token is encrypted before storage</li>
            <li>For maximum security, use session storage option</li>
            <li>Our server only uses your token to communicate with GitLab</li>
            <li>No tokens are stored on our server permanently</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || validating || !isValid}
        >
          {isLoading || validating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {validating ? "Validating..." : "Loading..."}
            </>
          ) : (
            "Connect to GitLab"
          )}
        </Button>
      </form>
    </div>
  );
}
