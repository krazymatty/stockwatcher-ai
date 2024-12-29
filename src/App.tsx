import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <TooltipProvider>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Index />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Admin />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Profile />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </SidebarProvider>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;