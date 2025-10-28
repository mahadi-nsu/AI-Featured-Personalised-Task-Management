import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Use the auth-helpers client in client components to keep
// session cookies in sync with Next.js middleware and server
// components. This avoids "logged out on refresh" issues.
export const createClient = () => {
  return createClientComponentClient();
};
