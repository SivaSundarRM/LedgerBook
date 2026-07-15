import React from "react";
import { AlertTriangle, Inbox } from "lucide-react";

export function LoanCardSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-ink-100" />
          <div className="h-3 w-24 rounded bg-ink-100" />
        </div>
        <div className="h-8 w-8 rounded bg-ink-100" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-ink-100" />
        <div className="h-3 w-5/6 rounded bg-ink-100" />
        <div className="h-2 w-full rounded-full bg-ink-100" />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="rounded-full bg-ink-100 p-3 text-ink-400">
        <Inbox size={22} />
      </div>
      <div>
        <p className="font-semibold text-ink-800">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center gap-3 border-rust-400/30 bg-rust-500/5 px-6 py-14 text-center">
      <div className="rounded-full bg-rust-500/10 p-3 text-rust-500">
        <AlertTriangle size={22} />
      </div>
      <div>
        <p className="font-semibold text-ink-800">Couldn't load your loans</p>
        <p className="mt-1 text-sm text-ink-400">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}
