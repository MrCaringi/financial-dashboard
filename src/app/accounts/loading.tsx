export default function AccountsLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 animate-pulse">
      {/* Header */}
      <header className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 rounded-full glass" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-16 rounded-full bg-white/10" />
          <div className="h-7 w-32 rounded-full bg-white/20" />
        </div>
      </header>

      {/* Summary Card */}
      <section className="glass-card p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-32 rounded-full bg-white/10" />
            <div className="h-9 w-40 rounded-full bg-white/20 mt-1" />
          </div>
          <div className="h-5 w-16 rounded-full bg-white/5" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center gap-2 border-r border-white/5 pr-1">
            <div className="h-3 w-12 rounded-full bg-white/10" />
            <div className="h-4.5 w-16 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-col items-center gap-2 border-r border-white/5 px-1">
            <div className="h-3 w-12 rounded-full bg-white/10" />
            <div className="h-4.5 w-16 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-col items-center gap-2 pl-1">
            <div className="h-3 w-16 rounded-full bg-white/10" />
            <div className="h-4.5 w-16 rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      {/* Group Lists */}
      {[
        { label: "Current Accounts", count: 2, isCredit: false, border: "border-l-emerald-500/20" },
        { label: "Savings", count: 2, isCredit: false, border: "border-l-blue-500/20" },
        { label: "Credit Cards", count: 4, isCredit: true, border: "border-l-rose-500/20" },
      ].map((group, groupIdx) => (
        <section key={groupIdx} className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10" />
              <div className="h-3.5 w-24 rounded-full bg-white/10" />
            </div>
            <div className="h-3.5 w-16 rounded-full bg-white/5" />
          </div>

          <div className="flex flex-col gap-3">
            {Array.from({ length: group.count }).map((_, i) => (
              <div
                key={i}
                className={`glass-card p-4 flex flex-col gap-2 relative overflow-hidden border-y-0 border-r-0 rounded-l-none border-l-4 ${group.border}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2 min-w-0 pr-4">
                    <div className="h-4.5 w-40 rounded-full bg-white/15" />
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-3 h-3 rounded-full bg-white/5" />
                      <div className="h-3 w-20 rounded-full bg-white/5" />
                    </div>
                  </div>
                  
                  <div className="h-5.5 w-20 rounded-full bg-white/15" />
                </div>

                {/* Credit Card Details Placeholder */}
                {group.isCredit && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="h-3.5 w-20 rounded-full bg-white/5" />
                      <div className="h-3.5 w-32 rounded-full bg-white/10" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-24 rounded-full bg-white/5" />
                      <div className="h-3 w-20 rounded-full bg-white/5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
