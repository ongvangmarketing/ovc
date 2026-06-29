"use client";

export function ReceiptPrintButton() {
  return (
    <button type="button" className="receipt-print-button" onClick={() => window.print()}>
      In / Xuất PDF
    </button>
  );
}
