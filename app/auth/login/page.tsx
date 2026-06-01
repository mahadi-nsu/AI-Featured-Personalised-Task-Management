"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  Briefcase,
  BarChart3,
  Repeat,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: CheckCircle2,
    title: "Seamless Task Management",
    desc: "Organize your day, track progress, and never miss a deadline.",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    desc: "Generate test cases and get smart suggestions to optimize your workflow.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Visualize productivity trends and completion rates with interactive charts.",
  },
  {
    icon: Repeat,
    title: "Routine Management",
    desc: "Build and track daily routines to develop habits and stay consistent.",
  },
  {
    icon: Briefcase,
    title: "Job Hunt Tracking",
    desc: "Manage your job applications from start to finish, all in one place.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0f0d] text-slate-100">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-teal-400/15 blur-[120px]" />
        <div className="absolute -right-24 top-1/4 h-[22rem] w-[22rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative grid min-h-full items-stretch lg:grid-cols-[1.1fr_1fr]">
        {/* Left: Brand & value props */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="hidden flex-col justify-between p-10 lg:flex xl:p-14"
        >
          <motion.div variants={item} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              DevTasker
            </span>
          </motion.div>

          <div className="space-y-8">
            <motion.div variants={item} className="space-y-5">
              <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                AI-powered productivity
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
                Streamline your day,{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  accelerate your goals
                </span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-slate-400">
                A personalized, AI-powered platform to organize your daily tasks
                and master your job application journey — all in one elegant
                workspace.
              </p>
            </motion.div>

            <motion.ul variants={container} className="space-y-3.5">
              {features.map(({ icon: Icon, title, desc }) => (
                <motion.li
                  variants={item}
                  key={title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm transition-colors duration-300 hover:border-emerald-400/20 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20 transition-colors group-hover:bg-emerald-500/20">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-sm leading-snug text-slate-400">{desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.div variants={item} className="mt-2.5 text-xs text-slate-500">
            © 2024 Mahadi. All rights reserved.
          </motion.div>
        </motion.div>

        {/* Right: Sign-in */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
            className="w-full max-w-md"
          >
            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                DevTasker
              </span>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
              {/* top accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-400">
                  Sign in to continue to your workspace
                </p>
              </div>

              <Button
                onClick={handleGoogleLogin}
                className="group mt-8 h-12 w-full gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:brightness-110"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#fff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#fff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              {/* divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  secure access
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Protected by Google OAuth — we never see your password.
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
              By continuing, you agree to our{" "}
              <span className="text-slate-400 underline-offset-2 hover:text-emerald-300 hover:underline">
                Terms
              </span>{" "}
              &{" "}
              <span className="text-slate-400 underline-offset-2 hover:text-emerald-300 hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
