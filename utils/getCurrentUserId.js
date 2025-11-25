import { createClient } from "@/utils/supabase/client";

export async function getCurrentUserId() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}
