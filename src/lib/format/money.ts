// Ditulis manual, bukan Intl: Intl di Hermes menghasilkan "Rp 12.000" (spasi), sedangkan format baku "Rp12.000".
export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.round(Math.abs(amount)).toString();
  return `${sign}Rp${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** Label sumbu grafik: "0", "50rb", "1,2jt". Hanya untuk tampilan ringkas, bukan nominal transaksi. */
export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${trimDecimal(abs / 1_000_000)}jt`;
  if (abs >= 1_000) return `${sign}${trimDecimal(abs / 1_000)}rb`;
  return `${sign}${Math.round(abs)}`;
}

function trimDecimal(value: number): string {
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return rounded.toString().replace(".", ",");
}
