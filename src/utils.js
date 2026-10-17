import { CONFIG } from "./config";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
export const money = (n) => inr.format(n || 0);

const r2 = (n) => Math.round(n * 100) / 100;

export function discountPct(liters) {
  const t = CONFIG.discountTiers.find((x) => liters >= x.min);
  return t ? t.pct : 0;
}

export function calcTotals(liters, mode) {
  const water = r2((liters || 0) * CONFIG.ratePerLiter);
  const pct = discountPct(liters || 0);
  const discount = r2((water * pct) / 100);
  const delivery = mode === "delivery" ? CONFIG.deliveryCharge : 0;
  const tax = r2(((water - discount + delivery) * CONFIG.gstPercent) / 100);
  const total = r2(water - discount + delivery + tax);
  return { water, pct, discount, delivery, tax, total };
}

// e.g. 17 L -> "1 x 10 L + 1 x 5 L + 1 x 2 L"
export function suggestCans(liters) {
  let left = liters || 0;
  const parts = [];
  for (const size of CONFIG.containers) {
    const n = Math.floor(left / size);
    if (n > 0) {
      parts.push(`${n} \u00d7 ${size} L`);
      left -= n * size;
    }
  }
  if (left > 0) parts.push(`${left} L in your own can`);
  return parts.join(" + ");
}

export function makeBillNo(date, seq) {
  const d = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `AP-${d}-${String(seq).padStart(3, "0")}`;
}

export function upiLink(amount, note) {
  const q = new URLSearchParams({
    pa: CONFIG.upiId,
    pn: CONFIG.upiPayee,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${q.toString()}`;
}

export function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}
