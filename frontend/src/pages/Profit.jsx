import React from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useProfitSummary } from "../hooks/useProfitSummary";
import { EmptyState, ErrorState } from "../components/StateViews";

function SummaryCard({ label, value, sub, tone = "default" }) {
  const toneClass =
    tone === "positive"
      ? "text-moss-600"
      : tone === "negative"
      ? "text-rust-500"
      : "text-ink-900";

  return (
    <div className="card px-4 py-3.5">
      <p className="text-xs text-ink-400">{label}</p>
      <p className={`tabular mt-1 text-lg font-semibold ${toneClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

function ProfitSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card h-[74px] animate-pulse px-4 py-3.5">
            <div className="h-3 w-16 rounded bg-ink-100" />
            <div className="mt-2 h-5 w-20 rounded bg-ink-100" />
          </div>
        ))}
      </div>
      <div className="card animate-pulse p-5">
        <div className="h-4 w-32 rounded bg-ink-100" />
        <div className="mt-3 h-3 w-full rounded bg-ink-100" />
      </div>
    </div>
  );
}

function BorrowerProfitCard({ row }) {
  const projectedPositive = row.projectedProfit >= 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between border-b border-ink-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-ink-900">{row.borrowerName}</h3>
          <p className="mt-0.5 text-xs text-ink-400">
            {row.cycles} loan cycle{row.cycles !== 1 ? "s" : ""}
            {row.restarts > 0 && (
              <span className="ml-1 inline-flex items-center gap-1 text-amber-600">
                <RefreshCw size={11} /> {row.restarts} restart{row.restarts !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <span
          className={`badge ${
            projectedPositive ? "bg-moss-100 text-moss-600" : "bg-rust-500/10 text-rust-500"
          }`}
        >
          {projectedPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {row.projectedProfitPercent}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-ink-400">Cash disbursed</p>
          <p className="tabular font-semibold text-ink-900">₹{row.totalDisbursed.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Cash collected</p>
          <p className="tabular font-semibold text-ink-900">₹{row.totalCollected.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Outstanding</p>
          <p className="tabular font-semibold text-ink-900">₹{row.outstanding.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Realized profit</p>
          <p
            className={`tabular font-semibold ${
              row.realizedProfit >= 0 ? "text-ink-900" : "text-rust-500"
            }`}
          >
            ₹{row.realizedProfit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mx-5 mb-4 flex items-center justify-between rounded-md bg-ink-50 px-3.5 py-2.5 text-sm">
        <span className="text-ink-500">Projected profit if fully repaid</span>
        <span
          className={`tabular font-semibold ${
            projectedPositive ? "text-moss-600" : "text-rust-500"
          }`}
        >
          ₹{row.projectedProfit.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function Profit() {
  const { byBorrower, totals, status, error, refresh } = useProfitSummary();

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-lg font-semibold text-ink-900">Profit</h1>

        {status === "loading" && <ProfitSkeleton />}

        {status === "error" && <ErrorState message={error} onRetry={refresh} />}

        {status === "success" && byBorrower.length === 0 && (
          <EmptyState
            title="No profit data yet"
            description="Create a loan and record some payments to see profit by borrower here."
          />
        )}

        {status === "success" && byBorrower.length > 0 && totals && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <SummaryCard label="Cash disbursed" value={`₹${totals.totalDisbursed.toFixed(2)}`} />
              <SummaryCard label="Cash collected" value={`₹${totals.totalCollected.toFixed(2)}`} />
              <SummaryCard label="Outstanding" value={`₹${totals.outstanding.toFixed(2)}`} />
              <SummaryCard
                label="Realized profit"
                value={`₹${totals.realizedProfit.toFixed(2)}`}
                sub={`${totals.realizedProfitPercent}% of disbursed`}
                tone={totals.realizedProfit >= 0 ? "positive" : "negative"}
              />
              <SummaryCard
                label="Projected profit"
                value={`₹${totals.projectedProfit.toFixed(2)}`}
                sub={`${totals.projectedProfitPercent}% of disbursed`}
                tone={totals.projectedProfit >= 0 ? "positive" : "negative"}
              />
            </div>

            <h2 className="mb-3 text-sm font-semibold text-ink-500">
              Profit by borrower ({byBorrower.length})
            </h2>
            <div className="space-y-4">
              {byBorrower.map((row) => (
                <BorrowerProfitCard key={row.borrowerName} row={row} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
