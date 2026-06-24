import React from "react";
import Link from "next/link";
import { getUpcomingPaymentsData } from "@/lib/dashboard-data";
import { SubscriptionProjection } from "@/components/SubscriptionProjection";
import { CalendarClock, CreditCard } from "lucide-react";
import { fmt } from "@/lib/format";

export async function PaymentsSection() {
  const data = await getUpcomingPaymentsData();

  return (
    <section id="upcoming" className="flex flex-col gap-4 scroll-mt-20">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-zinc-100">Upcoming Payments</h3>
        {data.projectedPayments.length > 0 && (
          <span className="text-xs font-bold text-zinc-400 bg-zinc-800/85 px-2.5 py-0.5 rounded-full border border-zinc-700/60">
            {data.projectedPayments.length} outgoings
          </span>
        )}
      </div>

      <SubscriptionProjection bills={data.billsList} cards={data.creditCards} />

      <div className="max-h-[330px] overflow-y-auto pr-1 flex flex-col gap-2">
        {data.projectedPayments.map((payment) => {
          const isSubscription = payment.type === "subscription";
          const dateObj = new Date(payment.dueDate);
          const isNegative = payment.projectedBalance < 0;
          const balanceColor = isNegative ? "text-rose-400 font-semibold" : "text-zinc-400 font-medium";

          const cardContent = (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800/80 flex-shrink-0 flex items-center justify-center ${
                  isSubscription ? "text-amber-500" : "text-rose-400"
                }`}>
                  {isSubscription ? <CalendarClock size={14} /> : <CreditCard size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] line-clamp-1 text-zinc-100">{payment.name}</p>
                  <p className="text-xs text-muted-foreground mt-0">
                    {isSubscription ? "Subscription" : "Credit Card Payment"}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2 flex flex-col items-end">
                <span className="font-bold text-base text-zinc-100">{fmt(payment.amount)}</span>
                <p className="text-xs text-muted-foreground mt-0">
                  {dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
                <p className={`text-xs mt-0.5 ${balanceColor}`}>
                  Proj. Bal: {fmt(payment.projectedBalance)}
                </p>
              </div>
            </>
          );

          const className = `glass-card py-2.5 px-3.5 flex items-center justify-between border-y-0 border-r-0 rounded-l-none border-l-4 flex-shrink-0 transition-all duration-200 ${
            isSubscription 
              ? "border-l-amber-500 hover:bg-zinc-800/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer" 
              : "border-l-rose-500 hover:bg-zinc-800/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          }`;

          if (isSubscription && payment.billId) {
            return (
              <Link 
                key={payment.id} 
                href={`/subscriptions/${payment.billId}`}
                className={className}
              >
                {cardContent}
              </Link>
            );
          }

          if (!isSubscription && payment.accountId) {
            return (
              <Link 
                key={payment.id} 
                href={`/credit-cards/${payment.accountId}`}
                className={className}
              >
                {cardContent}
              </Link>
            );
          }

          // Fallback if no link ID is present
          const nonLinkClassName = className.replace("hover:bg-zinc-800/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer", "");
          return (
            <div
              key={payment.id}
              className={nonLinkClassName}
            >
              {cardContent}
            </div>
          );
        })}
        {data.projectedPayments.length === 0 && (
          <p className="text-sm text-muted-foreground px-2">No upcoming payments this cycle!</p>
        )}
      </div>
    </section>
  );
}

