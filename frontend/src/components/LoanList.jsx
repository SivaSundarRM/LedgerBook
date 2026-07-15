import React from "react";
import { Search } from "lucide-react";
import { LoanStatus } from "./LoanStatus";
import { LoanCardSkeleton, EmptyState, ErrorState } from "./StateViews";

export function LoanList({
  loans,
  status,
  error,
  searchQuery,
  setSearchQuery,
  onMakePayment,
  onRestartLoan,
  onDelete,
  mutating,
  onRetry,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink-900">
          Active loans {status === "success" && <span className="text-ink-400">({loans.length})</span>}
        </h2>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by borrower name…"
          className="field-input pl-10"
          aria-label="Search loans by borrower name"
        />
      </div>

      {status === "loading" && (
        <div className="space-y-4">
          <LoanCardSkeleton />
          <LoanCardSkeleton />
        </div>
      )}

      {status === "error" && <ErrorState message={error} onRetry={onRetry} />}

      {status === "success" && loans.length === 0 && searchQuery && (
        <EmptyState
          title="No matching loans"
          description={`Nobody named "${searchQuery}" has a loan on record.`}
          action={
            <button onClick={() => setSearchQuery("")} className="btn-secondary">
              Clear search
            </button>
          }
        />
      )}

      {status === "success" && loans.length === 0 && !searchQuery && (
        <EmptyState
          title="No loans yet"
          description="Create your first loan using the form to get started."
        />
      )}

      {status === "success" && loans.length > 0 && (
        <div className="space-y-4">
          {loans.map((loan) => (
            <LoanStatus
              key={loan._id}
              loan={loan}
              onMakePayment={onMakePayment}
              onRestartLoan={onRestartLoan}
              onDelete={onDelete}
              mutating={mutating}
            />
          ))}
        </div>
      )}
    </section>
  );
}
