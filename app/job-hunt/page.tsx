import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import JobList from "./components/JobList";
import AddJobButton from "./components/AddJobButton";
import { JobApplication } from "./components/JobList";

export default async function JobHuntPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: applications, error } = await supabase
    .from("applied_jobs")
    .select("*")
    .order("applyDate", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    throw new Error("Failed to fetch applications");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Job Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
        <AddJobButton />
      </div>

      <JobList initialApplications={applications || []} />
    </div>
  );
}
