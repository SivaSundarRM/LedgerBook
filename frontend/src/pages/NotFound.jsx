import React from "react";
import { Link } from "react-router-dom";
import { NotebookPen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-moss-300">
        <NotebookPen size={20} />
      </div>
      <p className="font-mono text-5xl font-bold text-ink-900">404</p>
      <p className="mt-2 text-ink-500">This page doesn't exist in the ledger.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}
