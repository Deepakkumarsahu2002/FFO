import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "@/store/account";

export function GoogleSignInButton({ disabled = false }: { disabled?: boolean }) {
  const navigate = useNavigate();
  const loginWithGoogleCredential = useAccount((state) => state.loginWithGoogleCredential);
  const [submitting, setSubmitting] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";

  if (!clientId) return null;

  async function handleSuccess(credential?: string) {
    if (!credential || submitting || disabled) {
      if (!credential) toast.error("Google did not return a sign-in credential. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
      await loginWithGoogleCredential(credential);
      toast.success("Logged in with Google");
      await navigate({ to: "/account" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex min-h-10 justify-center" aria-live="polite">
        {submitting || disabled ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {submitting ? "Signing in with Google…" : "Please wait…"}
          </span>
        ) : (
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={(response) => void handleSuccess(response.credential)}
              onError={() => toast.error("Google sign-in failed. Please try again.")}
              onNonOAuthError={(error) => {
                toast.info(
                  error.type === "popup_closed"
                    ? "Google sign-in was cancelled."
                    : "The Google sign-in window could not be opened.",
                );
              }}
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </GoogleOAuthProvider>
        )}
      </div>
    </div>
  );
}
