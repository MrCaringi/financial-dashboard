import React from "react";

export function AccountsSkeleton() {
  return (
    <section className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden animate-pulse">
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/15" />
            <div className="h-3.5 w-16 rounded-full bg-white/10" />
          </div>
          <div className="h-3.5 w-20 rounded-full bg-white/10" />
        </div>
        <div className="flex justify-between items-baseline">
          <div className="h-10 w-36 rounded-full bg-white/20" />
          <div className="h-4 w-16 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-t border-white/5 pt-4">
        <div className="pr-4 border-r border-white/5">
          <div className="h-3.5 w-24 rounded-full bg-white/10 mb-2" />
          <div className="h-6 w-20 rounded-full bg-white/15 mb-1.5" />
          <div className="h-3.5 w-16 rounded-full bg-white/5" />
        </div>
        <div className="pl-6">
          <div className="h-3.5 w-20 rounded-full bg-white/10 mb-2" />
          <div className="h-6 w-16 rounded-full bg-white/15 mb-1.5" />
          <div className="h-3.5 w-12 rounded-full bg-white/5" />
        </div>
      </div>
    </section>
  );
}

export function BurnSkeleton() {
  return (
    <section className="glass-card p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10" />
          <div className="h-4 w-32 rounded-full bg-white/10" />
        </div>
        <div className="h-3.5 w-28 rounded-full bg-white/5" />
      </div>
      <div className="h-3 w-56 rounded-full bg-white/5 mb-6" />
      <div className="w-full h-36 flex items-end justify-around gap-1.5 px-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-1">
            <div
              className="w-full rounded-sm bg-white/15"
              style={{ height: `${20 + (i * 7) % 60}px` }}
            />
            <div
              className="w-full rounded-sm bg-white/5"
              style={{ height: `${10 + (i * 9) % 40}px` }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TransactionsSkeleton() {
  return (
    <section className="flex flex-col gap-3 animate-pulse">
      <div className="h-6 w-32 rounded-full bg-white/15 mb-1 mx-2" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-36 rounded-full bg-white/15" />
                <div className="h-3 w-16 rounded-full bg-white/5" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <div className="h-4 w-14 rounded-full bg-white/15" />
              <div className="h-3.5 w-10 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PaymentsSkeleton() {
  return (
    <section className="flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between items-center px-2">
        <div className="h-6 w-40 rounded-full bg-white/15" />
        <div className="h-5 w-24 rounded-full bg-white/5" />
      </div>

      <div className="glass-card p-4 h-24 flex flex-col justify-between">
        <div className="h-3.5 w-36 rounded-full bg-white/10" />
        <div className="h-4 w-full rounded-full bg-white/5" />
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded-full bg-white/5" />
          <div className="h-3 w-16 rounded-full bg-white/5" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-3 flex items-center justify-between border-l-4 border-l-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-28 rounded-full bg-white/15" />
                <div className="h-3 w-14 rounded-full bg-white/5" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <div className="h-4 w-12 rounded-full bg-white/15" />
              <div className="h-3 w-10 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="glass-card py-3 px-4 border-l-4 border-l-white/10 border-y-0 border-r-0 rounded-l-none">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-48 rounded-full bg-white/15 mb-2" />
            <div className="h-3 w-64 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

