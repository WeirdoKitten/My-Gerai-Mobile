// Ditulis manual, bukan Intl: Intl di Hermes menghasilkan "Rp 12.000" (spasi), sedangkan format baku "Rp12.000".
export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.round(Math.abs(amount)).toString();
  return `${sign}Rp${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
