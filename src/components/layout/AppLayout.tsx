import { AppSidebar } from "./Sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </>
  );
};