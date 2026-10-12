import { formatDayKey, formatRating } from "@/lib/format/datetime";
import { formatRupiahCompact } from "@/lib/format/money";
import { adaptPosterSvg, decodeSvgDataUri } from "@/lib/media/svg-data-uri";

describe("format laporan", () => {
  it("formatDayKey sama dengan dayKeyLabel web", () => {
    expect(formatDayKey("2026-10-07")).toBe("Rab 7/10");
    expect(formatDayKey("2026-10-11")).toBe("Min 11/10");
  });

  it("formatRupiahCompact untuk sumbu grafik", () => {
    expect(formatRupiahCompact(0)).toBe("0");
    expect(formatRupiahCompact(950)).toBe("950");
    expect(formatRupiahCompact(50_000)).toBe("50rb");
    expect(formatRupiahCompact(2_500)).toBe("2,5rb");
    expect(formatRupiahCompact(1_250_000)).toBe("1,3jt");
  });

  it("formatRating memakai koma desimal", () => {
    expect(formatRating(4.5)).toBe("4,5");
    expect(formatRating(5)).toBe("5,0");
  });
});

describe("decodeSvgDataUri", () => {
  it("mendekode SVG base64 UTF-8", () => {
    const xml = '<svg xmlns="http://www.w3.org/2000/svg"><text>Kopi Ñoño</text></svg>';
    // base64 dari UTF-8 tanpa Buffer (tipe Node tidak dipakai di repo ini).
    const utf8 = encodeURIComponent(xml).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
    const uri = `data:image/svg+xml;base64,${btoa(utf8)}`;
    expect(decodeSvgDataUri(uri)).toBe(xml);
  });

  it("menolak data URI selain SVG base64", () => {
    expect(decodeSvgDataUri("data:image/png;base64,AAAA")).toBeNull();
    expect(decodeSvgDataUri(`data:image/svg+xml;base64,${btoa("bukan svg")}`)).toBeNull();
  });
});

describe("adaptPosterSvg", () => {
  it("mengganti svg bersarang dengan g transform dan mendekode &amp;", () => {
    const xml =
      '<svg width="520"><svg x="242" y="290" width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M1 1" /></svg><text>Pesan &amp; bayar</text></svg>';
    expect(adaptPosterSvg(xml)).toBe(
      '<svg width="520"><g transform="translate(242 290) scale(1.5)" fill="none"><path d="M1 1" /></g><text>Pesan & bayar</text></svg>',
    );
  });
});
