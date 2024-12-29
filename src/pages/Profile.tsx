import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username, first_name, last_name")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      if (!session?.user) return;

      const updates = {
        id: session.user.id,
        username,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>

          <Button onClick={updateProfile} className="w-full">
            Update Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;