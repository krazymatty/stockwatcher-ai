import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          queryClient.clear();
        } else if (event === 'SIGNED_IN' && session) {
          const { data, error } = await supabase.auth.getUser();
          if (!error && data.user) {
            setIsAuthenticated(true);
          } else {
            console.error("Session verification failed:", error);
            setIsAuthenticated(false);
          }
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <TooltipProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppSidebar />
                        <main className="flex-1 p-6">
                          <Index />
                        </main>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AppSidebar />
                        <main className="flex-1 p-6">
                          <Admin />
                        </main>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </div>
          </SidebarProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

export default App;