"use client";

import { Card } from "@/components/ui/card";

export default function AITestingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Testing</h1>
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Test Results</h2>
          <p className="text-muted-foreground">No tests have been run yet.</p>
        </Card>
      </div>
    </div>
  );
}
