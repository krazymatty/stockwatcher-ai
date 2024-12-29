import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        navigate("/");
      }
      
      // Log any auth errors
      if (event === "SIGNED_OUT") {
        toast.error("You have been signed out");
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

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to StockWatcher AI</h1>
          <p className="text-muted-foreground">Sign in to manage your watchlists</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth`}
            theme="light"
            onError={(error) => {
              console.error("Auth error:", error);
              toast.error(error.message);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;