export const secToTimeString = (seconds: number) => {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);

  const m = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const s = (abs % 60).toFixed(3).padStart(6, "0");

  return `${sign}${m}:${s}`;
};

export const timeStringToSec = (str: string) => {
  const sign = str.startsWith("-") ? -1 : 1;
  const withoutSign = sign === -1 ? str.slice(1) : str;

  const [m, s] = withoutSign.split(":");
  return sign * (parseInt(m, 10) * 60 + parseFloat(s));
};

export type NormalizedTimeResult = {
  sec: number;
  normalized: string;
};

function formatMmSsMmmFromSec(sec: number): string {
  const safe = Number.isFinite(sec) ? sec : 0;
  const clamped = Math.max(0, safe);
  const totalMs = Math.round(clamped * 1000);

  const mm = Math.floor(totalMs / 60000);
  const rem = totalMs - mm * 60000;
  const ss = Math.floor(rem / 1000);
  const mmm = rem - ss * 1000;

  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

export function parseNormalizeTimeNoSnap(
  raw: string,
): NormalizedTimeResult | null {
  const s = raw.trim();
  if (s === "") return null;

  const m = /^(?:(\d+):)?([+-]?\d+)(?:\.([+-]?\d+))?$/.exec(s);
  if (!m) return null;

  const minPart = m[1] ? Number(m[1]) : 0;
  const secPart = Number(m[2]);
  const fracRaw = m[3];

  if (!Number.isFinite(minPart) || minPart < 0) return null;
  if (!Number.isFinite(secPart)) return null;

  let msPart = 0;
  if (fracRaw !== undefined) {
    const sign = fracRaw.startsWith("-") ? -1 : 1;
    const digits = fracRaw.replace(/[+-]/g, "");
    if (!/^\d+$/.test(digits)) return null;

    const scaled =
      digits.length === 1
        ? Number(digits) * 100
        : digits.length === 2
          ? Number(digits) * 10
          : Number(digits.slice(0, 3));
    msPart = sign * scaled;
  }

  let totalMs = minPart * 60000 + secPart * 1000 + msPart;

  if (totalMs < 0) totalMs = 0;

  const sec = totalMs / 1000;
  return { sec, normalized: formatMmSsMmmFromSec(sec) };
}
