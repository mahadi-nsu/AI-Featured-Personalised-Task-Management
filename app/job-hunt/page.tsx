import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import JobHuntClient from "./components/JobHuntClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobHuntPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data: applications, error } = await supabase
    .from("applied_jobs")
    .select("*")
    .eq("user_id", session.user.id)
    .order("applyDate", { ascending: false });

  console.log("applications", applications);

  if (error) {
    console.error("Error fetching applications:", error);
    throw new Error("Failed to fetch applications");
  }

  return <JobHuntClient initialApplications={applications || []} />;
}
