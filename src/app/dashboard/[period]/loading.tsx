export default function PeriodLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 animate-pulse">
      {/* Header */}
      <header className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 rounded-full glass" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="h-7 w-28 rounded-full bg-white/20" />
        </div>
      </header>

      {/* Progress card */}
      <section className="glass-card p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-32 rounded-full bg-white/10" />
          <div className="h-3 w-28 rounded-full bg-white/5" />
        </div>
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-12 rounded-full bg-white/5" />
            <div className="h-7 w-20 rounded-full bg-white/20" />
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="h-3 w-12 rounded-full bg-white/5" />
            <div className="h-7 w-20 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="w-full h-4 rounded-full bg-white/10 mt-4" />
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-10 rounded-xl bg-white/10" />
          <div className="flex-1 h-10 rounded-xl bg-white/10" />
        </div>
      </section>

      {/* Category card */}
      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded-full bg-white/10" />
          <div className="h-5 w-36 rounded-full bg-white/10" />
        </div>

        {/* Doughnut placeholder */}
        <div className="w-full h-64 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-[24px] border-white/10" />
        </div>

        {/* Category rows */}
        <div className="mt-8 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <div className="h-4 w-28 rounded-full bg-white/10" />
              <div className="h-4 w-16 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
