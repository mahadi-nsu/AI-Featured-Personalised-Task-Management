import JobListSkeleton from "./components/JobListSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Job Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loading your applications...
          </p>
        </div>
      </div>
      <JobListSkeleton />
    </div>
  );
}
