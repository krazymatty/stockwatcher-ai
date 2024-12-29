import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseClient] = useState(() => createBrowserSupabaseClient({
    supabaseUrl: "https://objcmewmpwefarwnwruq.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamNtZXdtcHdlZmFyd253cnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTg2NTQsImV4cCI6MjA1MTA3NDY1NH0.ezQO1i3mPQhUNyZkXZnb1ctinbReEW-4TSdhN388Bug",
    options: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }));

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoute>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
            </Routes>
          </ProtectedRoute>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;