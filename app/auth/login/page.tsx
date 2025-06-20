"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Briefcase } from "lucide-react";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid md:grid-cols-2 min-h-screen">
        <div className="hidden md:flex flex-col justify-between p-12 bg-muted/40">
          <div className="text-2xl font-bold">Task Management</div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              Supercharge your productivity and land your dream job.
            </h1>
            <p className="text-muted-foreground">
              A personalized, AI-powered platform to streamline your daily tasks
              and accelerate your job search.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Your Company, Inc.
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center md:hidden">
              <h1 className="text-3xl font-bold">Task Management</h1>
              <p className="text-muted-foreground">
                Welcome to your new productivity hub.
              </p>
            </div>
            <div className="p-8 border rounded-lg bg-background shadow-lg">
              <h2 className="text-2xl font-semibold text-center mb-6">
                Sign in to continue
              </h2>
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Seamless Task Management:
                  </span>{" "}
                  Organize your day, track progress, and never miss a deadline.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    AI-Powered Insights:
                  </span>{" "}
                  Generate test cases and get smart suggestions to optimize your
                  workflow.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Job Hunt Tracking:
                  </span>{" "}
                  Manage your job applications from start to finish, all in one
                  place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
