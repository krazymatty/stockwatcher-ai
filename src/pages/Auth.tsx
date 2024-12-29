import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

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

    // Log the current URL to help debug
    console.log("Current URL:", window.location.href);
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const redirectUrl = 'https://57b3bf66-b917-41cb-a3b0-8695ec189dc4.lovableproject.com/auth';

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
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={redirectUrl}
            onlyThirdPartyProviders={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;