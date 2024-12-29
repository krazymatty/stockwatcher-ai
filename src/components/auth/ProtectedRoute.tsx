import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            navigate('/auth', { replace: true });
          }
          return;
        }
        
        if (mounted) {
          setIsAuthenticated(!!session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/auth', { replace: true });
        }
      }
    };

    // Initial session check
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          queryClient.clear();
          navigate('/auth', { replace: true });
        } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};