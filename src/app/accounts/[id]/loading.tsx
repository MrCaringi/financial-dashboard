export default function AccountDetailLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 animate-pulse">
      {/* Header */}
      <header className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 rounded-full glass" />
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="h-3 w-16 rounded-full bg-white/10" />
          <div className="h-6 w-48 rounded-full bg-white/20" />
        </div>
      </header>

      {/* Account Balance Hero Card */}
      <section className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 rounded-full bg-white/10" />
            <div className="h-10 w-44 rounded-full bg-white/20 mt-1" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/5" />
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-1">
          <div className="h-4.5 w-24 rounded-full bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-white/5" />
            <div className="h-3.5 w-24 rounded-full bg-white/5" />
          </div>
        </div>
      </section>

      {/* Tabs Placeholder */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
        <div className="flex-1 py-3.5 rounded-lg bg-zinc-900 border border-white/5 flex justify-center">
          <div className="h-4.5 w-16 rounded-full bg-white/15" />
        </div>
        <div className="flex-1 py-3.5 rounded-lg flex justify-center">
          <div className="h-4.5 w-16 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Recent Activity Panel Placeholder */}
      <div className="flex flex-col gap-4">
        <div className="h-4 w-36 rounded-full bg-white/10 px-1" />
        
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <div className="h-4.5 w-32 rounded-full bg-white/15" />
                  <div className="h-3.5 w-16 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <div className="h-4 w-12 rounded-full bg-white/15" />
                <div className="h-3 w-8 rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
