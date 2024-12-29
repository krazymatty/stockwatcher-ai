import { supabase } from "@/integrations/supabase/client";

export const getUserUsername = async (userId: string) => {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  return profileData?.username;
};