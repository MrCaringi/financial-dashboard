"use client";

import { useActionState } from "react";
import { loginAction, createPasswordAction } from "@/app/actions/auth";
import { Lock, KeyRound } from "lucide-react";

export function LoginForm({ isSetup }: { isSetup: boolean }) {
  const actionToUse = isSetup ? loginAction : createPasswordAction;
  const [state, formAction, isPending] = useActionState(actionToUse, null);

  return (
    <div className="w-full max-w-md">
      <div className="glass p-8 rounded-3xl border border-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            {isSetup ? (
              <Lock className="w-8 h-8 text-primary" />
            ) : (
              <KeyRound className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSetup ? "Secure Dashboard" : "Set Up Password"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            {isSetup 
              ? "Please enter your password to access your financial data."
              : "Welcome! Please create a password to secure your dashboard."}
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {!isSetup && (
            <>
              <div>
                <label htmlFor="fireflyApiUrl" className="block text-sm font-medium text-foreground mb-2">
                  Firefly API URL
                </label>
                <input
                  type="url"
                  id="fireflyApiUrl"
                  name="fireflyApiUrl"
                  required
                  placeholder="e.g. http://192.168.1.100:8080"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="fireflyPat" className="block text-sm font-medium text-foreground mb-2">
                  Firefly Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  id="fireflyPat"
                  name="fireflyPat"
                  required
                  placeholder="Enter your Firefly PAT"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              {isSetup ? "Password" : "Dashboard Password"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder={isSetup ? "Enter your password" : "Create a secure dashboard password"}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {state?.error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-in fade-in slide-in-from-top-2">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending 
              ? (isSetup ? "Authenticating..." : "Saving...") 
              : (isSetup ? "Unlock" : "Save Password")}
          </button>
        </form>
      </div>
    </div>
  );
}
