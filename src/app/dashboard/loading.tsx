export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 animate-pulse">
      {/* Header */}
      <header className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 rounded-full glass" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-16 rounded-full bg-white/10" />
          <div className="h-7 w-40 rounded-full bg-white/20" />
        </div>
      </header>

      {/* Chart card */}
      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded-full bg-white/10" />
          <div className="h-5 w-44 rounded-full bg-white/10" />
        </div>
        <div className="h-4 w-72 rounded-full bg-white/5 mb-6" />
        {/* Bar chart placeholder */}
        <div className="w-full h-64 flex items-end justify-around gap-2 px-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <div
                className="w-full rounded bg-white/10"
                style={{ height: `${40 + (i * 17) % 120}px` }}
              />
              <div
                className="w-full rounded bg-white/5"
                style={{ height: `${30 + (i * 13) % 100}px` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Cycle list */}
      <section>
        <div className="h-6 w-36 rounded-full bg-white/10 mb-4 mx-2" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-24 rounded-full bg-white/20" />
                  <div className="h-3 w-32 rounded-full bg-white/5" />
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="h-3 w-8 rounded-full bg-white/5" />
                  <div className="h-5 w-20 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-12 rounded-full bg-white/5" />
                  <div className="h-4 w-20 rounded-full bg-white/10" />
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="h-3 w-12 rounded-full bg-white/5" />
                  <div className="h-4 w-20 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
