import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.endsWith("@philmatthews.net")) {
        setIsAdmin(true);
      }
    };
    checkAdminStatus();
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={({ isActive }) => 
                    isActive ? "text-primary" : "text-muted-foreground"
                  }>
                    <Home className="h-4 w-4 mr-2" />
                    <span>Home</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className={({ isActive }) => 
                      isActive ? "text-primary" : "text-muted-foreground"
                    }>
                      <List className="h-4 w-4 mr-2" />
                      <span>Master Stocks</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}