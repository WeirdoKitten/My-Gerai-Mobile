import type { Receipt } from "@/api/schemas/orders";
import { formatIndonesianPhone } from "@/lib/format/phone";

// Port dari src/lib/utils/receipt.ts repo web. Isi dan byte struk WAJIB identik dengan web
// (diuji terhadap fixture yang dibuat dari kode web, tests/fixtures/receipt-golden.json).
// Perubahan format dilakukan di kedua repo sekaligus.

/** Lebar kertas thermal 58mm dengan font standar (Font A) = 32 karakter/baris. */
export const RECEIPT_WIDTH = 32;

export const RECEIPT_FOOTER = [
  "Terima kasih telah berbelanja",
  "Barang yang sudah dibeli tidak dapat dikembalikan",
];

export type ReceiptLine = {
  text: string;
  align?: "left" | "center";
  bold?: boolean;
  /** Tinggi 2× (lebar tetap), dipakai untuk nama Lapak dan TOTAL. */
  tall?: boolean;
};

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

// Ditulis manual, bukan Intl: hasil Intl di Hermes tidak dijamin sama dengan Node.
/** "36.000", tanpa "Rp" (sama dengan formatAmount web). */
function formatAmount(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.round(Math.abs(amount)).toString();
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

/** "25/09/2026 14:32" (WIB). */
export function formatReceiptDateTime(value: Date | string): string {
  const d = new Date(new Date(value).getTime() + WIB_OFFSET_MS);
  return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad2(
    d.getUTCHours(),
  )}:${pad2(d.getUTCMinutes())}`;
}

/**
 * Printer thermal umumnya hanya mengerti ASCII (code page PC437). Karakter di luar itu
 * (emoji, huruf beraksen, NBSP) dibuang/diganti supaya tidak tercetak sebagai sampah.
 */
export function toPrintableAscii(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[  -​ ]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7e]/g, "");
}

/** Pecah teks per kata supaya muat `width` karakter; kata yang lebih panjang dipotong paksa. */
export function wrapText(text: string, width: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    let rest = word;
    while (rest.length > width) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(rest.slice(0, width));
      rest = rest.slice(width);
    }
    if (!current) current = rest;
    else if (current.length + 1 + rest.length <= width) current += ` ${rest}`;
    else {
      lines.push(current);
      current = rest;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Teks kiri + angka rata kanan sebaris; kalau kiri kepanjangan, dibungkus dan angka di baris terakhir. */
function leftRight(left: string, right: string, width: number): string[] {
  const wrapped = wrapText(left, width);
  const last = wrapped.pop() ?? "";
  if (last.length + 1 + right.length <= width) {
    return [...wrapped, last + right.padStart(width - last.length)];
  }
  return [...wrapped, last, right.padStart(width)];
}

function divider(width: number): ReceiptLine {
  return { text: "-".repeat(width) };
}

/** Susun isi struk (belum di-encode) dari data Pesanan. Murni, mudah diuji. */
export function buildReceiptLines(receipt: Receipt, width: number = RECEIPT_WIDTH): ReceiptLine[] {
  const ascii = (text: string) => toPrintableAscii(text).trim();
  const lines: ReceiptLine[] = [];
  const plain = (texts: string[]) => {
    for (const text of texts) lines.push({ text });
  };
  const centered = (text: string, extra: Partial<ReceiptLine> = {}) => {
    for (const line of wrapText(ascii(text), width)) {
      lines.push({ text: line, align: "center", ...extra });
    }
  };

  centered(receipt.stallName.toUpperCase(), { bold: true, tall: true });
  if (receipt.stallAddress) centered(receipt.stallAddress);
  lines.push(divider(width));

  plain(leftRight("No. Pesanan", receipt.orderCode, width));
  plain(leftRight("Atas nama", ascii(receipt.buyerName), width));
  plain([formatReceiptDateTime(receipt.paidAt)]);
  if (receipt.scheduledFor) {
    lines.push(divider(width));
    lines.push({ text: "PRE-ORDER", bold: true });
    plain([`Jadwal: ${formatReceiptDateTime(receipt.scheduledFor)}`]);
  }
  if (receipt.delivery) {
    lines.push(divider(width));
    lines.push({ text: "DIANTAR", bold: true });
    plain([formatIndonesianPhone(receipt.delivery.buyerPhone)]);
    plain(wrapText(ascii(receipt.delivery.address), width));
    if (receipt.delivery.landmark) {
      plain(wrapText(ascii(`Patokan: ${receipt.delivery.landmark}`), width));
    }
  }
  lines.push(divider(width));

  for (const item of receipt.items) {
    plain(
      leftRight(
        `${item.qty}x ${ascii(item.productNameSnapshot)}`,
        formatAmount(item.priceSnapshot * item.qty),
        width,
      ),
    );
    const details = [
      ...item.variantSelections.map((s) => `${s.groupNameSnapshot}: ${s.optionNameSnapshot}`),
      ...(item.note ? [`Catatan: ${item.note}`] : []),
    ];
    for (const detail of details) {
      plain(wrapText(ascii(detail), width - 3).map((line) => `   ${line}`));
    }
  }
  if (receipt.buyerNote) {
    plain(wrapText(ascii(`Catatan: ${receipt.buyerNote}`), width));
  }
  lines.push(divider(width));

  // Semua nominal dari server; aplikasi hanya menyusun baris.
  if (receipt.serviceFeePaid > 0 || receipt.deliveryFee > 0) {
    plain(leftRight("Subtotal", formatAmount(receipt.subtotal), width));
  }
  if (receipt.serviceFeePaid > 0) {
    plain(leftRight("Biaya Layanan", formatAmount(receipt.serviceFeePaid), width));
  }
  if (receipt.deliveryFee > 0) {
    plain(leftRight("Ongkir", formatAmount(receipt.deliveryFee), width));
  }
  for (const text of leftRight("TOTAL", `Rp${formatAmount(receipt.amountPaid)}`, width)) {
    lines.push({ text, bold: true });
  }
  plain(["Dibayar via QRIS"]);
  lines.push(divider(width));

  for (const text of RECEIPT_FOOTER) centered(text);
  return lines;
}

// Perintah ESC/POS dasar, didukung hampir semua printer thermal mini.
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

/** Encode baris struk jadi byte ESC/POS siap dikirim ke printer. */
export function encodeEscPos(lines: ReceiptLine[]): Uint8Array {
  const bytes: number[] = [ESC, 0x40]; // ESC @: reset printer
  for (const line of lines) {
    bytes.push(ESC, 0x61, line.align === "center" ? 1 : 0); // ESC a n: perataan
    bytes.push(ESC, 0x45, line.bold ? 1 : 0); // ESC E n: tebal
    bytes.push(GS, 0x21, line.tall ? 0x01 : 0x00); // GS ! n: tinggi 2×
    for (const char of toPrintableAscii(line.text)) {
      bytes.push(char.charCodeAt(0));
    }
    bytes.push(LF);
  }
  // Kembalikan gaya normal + dorong kertas supaya struk bisa disobek.
  bytes.push(ESC, 0x61, 0, ESC, 0x45, 0, GS, 0x21, 0x00);
  bytes.push(ESC, 0x64, 4); // ESC d n: feed 4 baris
  return Uint8Array.from(bytes);
}
