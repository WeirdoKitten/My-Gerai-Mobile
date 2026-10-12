/** Nomor ternormalisasi server (`6281234567890`) menjadi `0812-3456-7890`, sama dengan web. */
export function formatIndonesianPhone(normalized: string): string {
  const local = `0${normalized.replace(/^62/, "")}`;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}
