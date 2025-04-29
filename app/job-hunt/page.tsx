import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import JobHuntClient from "./components/JobHuntClient";

export default async function JobHuntPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: applications, error } = await supabase
    .from("applied_jobs")
    .select("*")
    .order("applyDate", { ascending: false });

  console.log("applications", applications);

  if (error) {
    console.error("Error fetching applications:", error);
    throw new Error("Failed to fetch applications");
  }

  return <JobHuntClient initialApplications={applications || []} />;
}
