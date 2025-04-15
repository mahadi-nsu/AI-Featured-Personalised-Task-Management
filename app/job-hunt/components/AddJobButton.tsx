"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AddJobButton() {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAddNew = () => {
    setIsAddingNew(true);
    // TODO: Implement the add job form/modal
  };

  return (
    <Button
      onClick={handleAddNew}
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Application
    </Button>
  );
}
