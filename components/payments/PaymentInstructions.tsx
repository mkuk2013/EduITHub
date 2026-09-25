"use client";

/**
 * Displays the academy's payment account details with copy-to-clipboard
 * buttons. Presentational only — the parent page loads the data with
 * getPaymentSettings() and passes it here.
 */

import { useState } from "react";
import { Check, Copy, Landmark, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";

interface PaymentInstructionsProps {
  accountName: string;
  accountNumber: string;
  methods: string;
}

function CopyRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Copy;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy it manually");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-indigo-700" />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-indigo-600 hover:text-indigo-700"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PaymentInstructions({ accountName, accountNumber, methods }: PaymentInstructionsProps) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
      <h3 className="text-sm font-semibold text-slate-900">How to pay</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
        <li>Send your monthly fee to the account below.</li>
        <li>Fill in the form with the transaction ID and upload the receipt screenshot.</li>
        <li>Our team will verify your payment and activate your enrollment.</li>
      </ol>

      <div className="mt-4 space-y-2">
        <CopyRow label="Account name" value={accountName} icon={Landmark} />
        <CopyRow label="Account number" value={accountNumber} icon={Smartphone} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <Wallet className="h-4 w-4 text-indigo-700" />
        <span>
          <span className="font-medium text-slate-900">Accepted methods:</span> {methods}
        </span>
      </div>
    </div>
  );
}
