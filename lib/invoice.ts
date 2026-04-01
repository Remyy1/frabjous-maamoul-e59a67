/**
 * Invoice PDF generator using jsPDF + jsPDF-AutoTable.
 * Generates professional invoices from tracking data.
 */
import type { TrackingData } from './aftership';

// Pricing lookup by carrier (example rates — update as needed)
const RATE_TABLE: Record<string, Record<string, number>> = {
  fedex: { base: 12.99, perKg: 2.5, fuel: 1.8 },
  ups: { base: 11.99, perKg: 2.3, fuel: 1.6 },
  usps: { base: 8.99, perKg: 1.8, fuel: 1.2 },
  dhl: { base: 14.99, perKg: 3.0, fuel: 2.1 },
  default: { base: 10.99, perKg: 2.0, fuel: 1.5 },
};

function getInvoiceNumber(): string {
  return `TF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export async function generateInvoicePDF(tracking: TrackingData): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const rates = RATE_TABLE[tracking.carrierSlug] || RATE_TABLE.default;
  const weightKg = tracking.weight
    ? parseFloat(tracking.weight.split(' ')[0]) || 1
    : 1;
  const baseCharge = rates.base;
  const weightCharge = weightKg * rates.perKg;
  const fuelSurcharge = rates.fuel;
  const subtotal = baseCharge + weightCharge + fuelSurcharge;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const invoiceNumber = getInvoiceNumber();
  const invoiceDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Background ──────────────────────────────────────────────────
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Header bar
  doc.setFillColor(0, 229, 160);
  doc.rect(0, 0, pageW, 2, 'F');

  // ── Logo / Company ───────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 229, 160);
  doc.text('TRACKFLOW', 20, 24);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(153, 153, 170);
  doc.text('Global Logistics Intelligence', 20, 30);
  doc.text('support@trackflow.io  |  1-800-TRACK-FL', 20, 35);

  // ── Invoice Label ────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageW - 20, 24, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(153, 153, 170);
  doc.text(`Invoice #: ${invoiceNumber}`, pageW - 20, 32, { align: 'right' });
  doc.text(`Date: ${invoiceDate}`, pageW - 20, 37, { align: 'right' });
  doc.text(`Due: Upon Receipt`, pageW - 20, 42, { align: 'right' });

  // Divider
  doc.setDrawColor(30, 30, 50);
  doc.setLineWidth(0.5);
  doc.line(20, 48, pageW - 20, 48);

  // ── Shipment Details ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 229, 160);
  doc.text('SHIPMENT DETAILS', 20, 58);

  const details = [
    ['Tracking Number', tracking.trackingNumber],
    ['Carrier', tracking.carrier],
    ['Status', tracking.status],
    ['Origin', tracking.origin],
    ['Destination', tracking.destination],
    ['Ship Date', tracking.shipDate ? new Date(tracking.shipDate).toLocaleDateString() : 'N/A'],
    ['Est. Delivery', tracking.estimatedDelivery
      ? new Date(tracking.estimatedDelivery).toLocaleDateString()
      : 'N/A'],
    ['Weight', tracking.weight || `${weightKg} kg`],
  ];

  autoTable(doc, {
    startY: 62,
    head: [],
    body: details,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 4 },
      textColor: [200, 200, 210],
      fillColor: [10, 10, 15],
    },
    columnStyles: {
      0: { textColor: [153, 153, 170], cellWidth: 45 },
      1: { textColor: [230, 230, 245], fontStyle: 'bold' },
    },
  });

  const afterDetailsY = (doc as any).lastAutoTable.finalY + 10;

  // ── Charges Table ────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 229, 160);
  doc.text('CHARGES', 20, afterDetailsY);

  autoTable(doc, {
    startY: afterDetailsY + 4,
    head: [['Description', 'Rate', 'Qty', 'Amount']],
    body: [
      ['Base Shipping Rate', formatCurrency(baseCharge), '1', formatCurrency(baseCharge)],
      ['Weight Surcharge', `${formatCurrency(rates.perKg)}/kg`, `${weightKg}`, formatCurrency(weightCharge)],
      ['Fuel Surcharge', formatCurrency(fuelSurcharge), '1', formatCurrency(fuelSurcharge)],
    ],
    foot: [
      ['', '', 'Subtotal', formatCurrency(subtotal)],
      ['', '', 'Tax (8%)', formatCurrency(tax)],
      ['', '', 'TOTAL DUE', formatCurrency(total)],
    ],
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      textColor: [200, 200, 210],
      fillColor: [10, 10, 15],
    },
    headStyles: {
      fillColor: [20, 20, 35],
      textColor: [153, 153, 170],
      fontSize: 8,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [10, 10, 15],
      textColor: [200, 200, 210],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [15, 15, 25],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      3: { halign: 'right', textColor: [0, 229, 160] },
    },
    didParseCell: (data) => {
      // Highlight total row
      if (data.section === 'foot' && data.row.index === 2) {
        data.cell.styles.textColor = [0, 229, 160];
        data.cell.styles.fontSize = 11;
      }
    },
  });

  const afterChargesY = (doc as any).lastAutoTable.finalY + 16;

  // ── Tracking History ─────────────────────────────────────────────
  if (tracking.events.length > 0 && afterChargesY < pageH - 60) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 229, 160);
    doc.text('TRACKING HISTORY', 20, afterChargesY);

    const historyRows = tracking.events.slice(0, 6).map((e) => [
      new Date(e.timestamp).toLocaleString(),
      e.message,
      e.location || '—',
    ]);

    autoTable(doc, {
      startY: afterChargesY + 4,
      head: [['Date & Time', 'Event', 'Location']],
      body: historyRows,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
        textColor: [180, 180, 200],
        fillColor: [10, 10, 15],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [20, 20, 35],
        textColor: [153, 153, 170],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [15, 15, 25] },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 90 },
      },
    });
  }

  // ── Footer ───────────────────────────────────────────────────────
  doc.setFillColor(15, 15, 30);
  doc.rect(0, pageH - 22, pageW, 22, 'F');
  doc.setFillColor(0, 229, 160);
  doc.rect(0, pageH - 22, pageW, 0.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 120);
  doc.text(
    'Thank you for shipping with TrackFlow. Questions? support@trackflow.io | 1-800-TRACK-FL',
    pageW / 2,
    pageH - 12,
    { align: 'center' }
  );
  doc.text(
    'TrackFlow Inc. · 100 Logistics Blvd, San Francisco, CA 94105',
    pageW / 2,
    pageH - 7,
    { align: 'center' }
  );

  // ── Save ─────────────────────────────────────────────────────────
  doc.save(`TrackFlow-Invoice-${tracking.trackingNumber}.pdf`);
}
