import { formatDateTime, formatSchedule, formatSince } from "@/lib/format/datetime";
import { formatIndonesianPhone } from "@/lib/format/phone";

describe("format tanggal WIB", () => {
  it("formatDateTime sama dengan web", () => {
    expect(formatDateTime("2026-09-09T07:30:00.000Z")).toBe("9 Sep 2026, 14.30");
  });

  it("melewati tengah malam WIB", () => {
    expect(formatDateTime("2026-10-11T17:05:00.000Z")).toBe("12 Okt 2026, 00.05");
  });

  it("formatSchedule menyertakan nama hari", () => {
    expect(formatSchedule("2026-10-03T03:00:00.000Z")).toBe("Sabtu, 3 Okt 2026, 10.00");
  });

  it("formatSince", () => {
    const now = new Date("2026-10-12T06:00:00.000Z");
    expect(formatSince("2026-10-12T05:59:40.000Z", now)).toBe("Baru saja");
    expect(formatSince("2026-10-12T05:48:00.000Z", now)).toBe("12 menit lalu");
    expect(formatSince("2026-10-12T02:15:00.000Z", now)).toBe("Hari ini 09.15");
    expect(formatSince("2026-10-10T02:15:00.000Z", now)).toBe("10 Okt 2026, 09.15");
  });
});

describe("formatIndonesianPhone", () => {
  it("menampilkan nomor ternormalisasi", () => {
    expect(formatIndonesianPhone("6281234567890")).toBe("0812-3456-7890");
  });
});
