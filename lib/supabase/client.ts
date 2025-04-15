import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  console.log("Creating supabase client");
  console.log("env", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("env", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
