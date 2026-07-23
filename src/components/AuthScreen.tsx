"use client";

import { useDataRoom } from "@/store/data-room-context";
import { FolderLockIcon, GoogleIcon, ShieldCheckIcon } from "./icons";

export function AuthScreen() {
  const { signIn } = useDataRoom();

  return (
    <div className="grid h-full w-full lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-navy via-navy-mid to-navy-light p-14 text-slate-200 lg:flex">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.06) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-accent shadow-[0_6px_18px_rgba(40,86,214,.45)]">
            <FolderLockIcon size={20} className="text-white" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-white">
            Acme Corp. <span className="text-[#8fb0ff]">Data Room</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-[#a7c0ff]">
            <ShieldCheckIcon size={14} />
            SOC 2 Type II · End-to-end encrypted
          </div>
          <h1 className="font-serif text-[40px] leading-[1.12] font-semibold tracking-tight text-balance text-white">
            Secure due-diligence, organized end to end.
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-[#aab8d4]">
            A single virtual repository for every document in your acquisition. Granular folders,
            controlled access, and a complete audit trail.
          </p>
        </div>

        <div className="relative flex gap-7 text-[13px] text-[#7f90b3]">
          <span>© Acme Corp.</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>

      {/* Sign-in card */}
      <div className="flex items-center justify-center bg-canvas p-10">
        <div className="w-full max-w-[392px] animate-fade-in">
          <div className="rounded-2xl border border-line bg-white px-9 py-10 shadow-[0_24px_60px_-30px_rgba(15,23,42,.35)]">
            <h2 className="text-[23px] font-semibold tracking-tight">
              Sign in to your Data Room
            </h2>
            <p className="mt-2 text-sm leading-normal text-slate-500">
              Use your Google Workspace account. Access is limited to invited counterparties.
            </p>

            <button
              onClick={signIn}
              className="mt-7 flex h-[50px] w-full cursor-pointer items-center justify-center gap-3 rounded-[11px] border border-line-input bg-white text-[15px] font-semibold text-gray-800 transition-all hover:-translate-y-px hover:border-[#c3ccdc] hover:shadow-[0_4px_14px_-6px_rgba(15,23,42,.25)]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3.5 text-xs text-slate-400">
              <div className="h-px flex-1 bg-line" />
              OR
              <div className="h-px flex-1 bg-line" />
            </div>

            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                signIn();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-semibold text-slate-600">
                  Work email
                </span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-[10px] border border-line-input bg-[#fbfcfe] px-3.5 text-sm text-slate-900 outline-none transition-all focus:border-accent focus:bg-white focus:ring-[3px] focus:ring-accent-ring"
                />
              </label>
              <button
                type="submit"
                className="h-[46px] cursor-pointer rounded-[10px] bg-slate-900 text-[14.5px] font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Continue with email
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-normal text-slate-400">
              Protected by reCAPTCHA. This is a demo — no real credentials are stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
