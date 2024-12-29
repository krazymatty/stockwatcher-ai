import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        navigate("/");
      }
      
      if (event === "SIGNED_OUT") {
        toast.error("You have been signed out");
      }

      // Log all auth-related events
      if (event === "SIGNED_IN") {
        console.log("Sign in successful:", session);
      } else if (event === "SIGNED_OUT") {
        console.log("Sign out event:", event);
      } else if (event === "USER_UPDATED") {
        console.log("User updated:", session);
      } else if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery event:", event);
      }
    });

    // Check URL for error parameters and log them
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      console.error("Auth error details:", { error, errorDescription });
      toast.error(errorDescription || "Authentication failed");
    }

    // Log the current URL to help debug redirect issues
    console.log("Current URL:", window.location.href);
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign in process...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        console.error("Sign in error:", error);
        toast.error(error.message);
        return;
      }

      if (data.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to StockWatcher AI</h1>
          <p className="text-muted-foreground">Sign in to manage your watchlists</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full"
            variant="outline"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;