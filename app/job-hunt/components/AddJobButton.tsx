"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddJobModal } from "./AddJobModal";
import { JobApplication } from "./JobList";

interface AddJobButtonProps {
  onJobAdded?: (job: JobApplication) => void;
}

export default function AddJobButton({ onJobAdded }: AddJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Application
      </Button>
      <AddJobModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onJobAdded={(job) => {
          onJobAdded?.(job);
          setIsOpen(false);
        }}
      />
    </>
  );
}
