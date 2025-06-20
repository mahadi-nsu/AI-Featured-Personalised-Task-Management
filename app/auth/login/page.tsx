"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Briefcase, BarChart2, Repeat } from "lucide-react";
import Image from "next/image";

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
    <div className="h-[90vh] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900 text-foreground rounded-2xl">
      <div className="grid md:grid-cols-2 h-full items-stretch">
        {/* Left: Illustration & App Info */}
        <div className="hidden md:flex flex-col justify-around p-6 bg-gradient-to-br from-red-800 via-purple-900 to-blue-900 relative">
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Task Management
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-start mt-16">
            {/* Illustration */}
            <Image
              src="/productivity_2.png"
              alt="Productivity Illustration"
              width={350}
              height={220}
              className="w-full max-w-xs mx-auto mb-4 drop-shadow-2xl animate-float"
              style={{ minHeight: 180, height: 280 }}
              priority
            />

            <h1 className="text-3xl font-extrabold text-white mb-1 drop-shadow-lg">
              Supercharge your productivity and land your dream job.
            </h1>
            <p className="text-lg text-slate-200 mb-4">
              A personalized, AI-powered platform to streamline your daily tasks
              and accelerate your job search.
            </p>
          </div>
          <div className="text-sm text-slate-300 opacity-70">
            © 2024 Your Company, Inc.
          </div>
        </div>
        {/* Right: Login Card */}
        <div className="flex flex-col items-center justify-center p-6 h-full bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-gray-900/80">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center md:hidden">
              <h1 className="text-3xl font-bold">Task Management</h1>
              <p className="text-muted-foreground">
                Welcome to your new productivity hub.
              </p>
            </div>
            <div className="p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-white/80 via-slate-100/80 to-slate-200/80 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 relative animate-fade-in">
              <h2 className="text-2xl font-semibold text-center mb-6 text-primary drop-shadow-sm">
                Sign in to continue
              </h2>
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:scale-105 transition-transform duration-200 animate-pulse-slow"
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
            <div className="space-y-4 bg-gradient-to-br from-purple-100/60 via-blue-100/60 to-white/60 dark:from-purple-900/40 dark:via-blue-900/40 dark:to-slate-900/40 rounded-xl p-6 shadow-inner animate-fade-in-slow">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-10 w-10 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Seamless Task Management:
                  </span>{" "}
                  Organize your day, track progress, and never miss a deadline.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-10 w-10 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    AI-Powered Insights:
                  </span>{" "}
                  Generate test cases and get smart suggestions to optimize your
                  workflow.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BarChart2 className="h-10 w-10 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Analytics Dashboard:
                  </span>{" "}
                  Visualize your productivity trends and task completion rates
                  with interactive charts.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Repeat className="h-10 w-10 mt-1 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Routine Management:
                  </span>{" "}
                  Build and track daily routines to develop productive habits
                  and stay consistent.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-10 w-10 mt-1 text-primary" />
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
      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 3.5s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes fade-in-slow {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 1.5s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 16px 8px rgba(59, 130, 246, 0.15);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s infinite;
        }
      `}</style>
    </div>
  );
}
