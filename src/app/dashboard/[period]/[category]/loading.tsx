export default function CategoryLedgerLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 animate-pulse">
      {/* Header */}
      <header className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 rounded-full glass" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded-full bg-white/10" />
          <div className="h-7 w-36 rounded-full bg-white/20" />
        </div>
      </header>

      {/* Total card */}
      <section className="glass-card p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-24 rounded-full bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-white/20" />
        </div>

        {/* Transaction rows */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card py-2.5 px-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="h-3 w-16 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="h-4 w-16 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
