import { AppSidebar } from "./Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      console.log("Current user ID:", session.user.id);
      getProfile();
    }
  }, [session]);

  const getProfile = async () => {
    try {
      console.log("Fetching profile for user:", session?.user?.id);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session?.user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      console.log("Profile data:", profile);

      // If no avatar_url is set but Google avatar is available, update it
      if (!profile.avatar_url && session?.user?.user_metadata?.picture) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            avatar_url: session.user.user_metadata.picture,
            updated_at: new Date().toISOString()
          })
          .eq("id", session?.user?.id);

        if (updateError) {
          console.error("Error updating avatar:", updateError);
          throw updateError;
        }

        setAvatarUrl(session.user.user_metadata.picture);
        toast.success("Profile avatar updated");
      } else {
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
      toast.error("Error loading avatar");
    }
  };

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
                  <AvatarImage src={avatarUrl || undefined} />
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