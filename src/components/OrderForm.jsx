import { CONFIG } from "../config";
import { calcTotals, discountPct, money, suggestCans } from "../utils";

const PRESETS = [2, 5, 10, 20];

export default function OrderForm({ order, setOrder, tank, onNext }) {
  const set = (k, v) => setOrder((o) => ({ ...o, [k]: v }));
  const liters = Number(order.liters) || 0;
  const t = calcTotals(liters, order.mode);

  let error = "";
  if (liters < CONFIG.minLiters) error = `Order at least ${CONFIG.minLiters} litre.`;
  else if (liters > CONFIG.maxLiters) error = `Maximum ${CONFIG.maxLiters} litres per order.`;
  else if (liters > tank) error = `Only ${Math.floor(tank)} L left in the tank.`;
  else if (order.mode === "delivery") {
    if (!order.name.trim()) error = "Enter the customer name for delivery.";
    else if (!/^\d{10}$/.test(order.phone)) error = "Enter a 10-digit phone number.";
    else if (!order.address.trim()) error = "Enter the delivery address.";
  }

  return (
    <div className="panel">
      <h2>How many litres?</h2>

      <div className="stepper">
        <button type="button" onClick={() => set("liters", Math.max(0, liters - 1))} aria-label="One litre less">−</button>
        <label>
          <input
            type="number"
            inputMode="numeric"
            min={CONFIG.minLiters}
            max={CONFIG.maxLiters}
            value={order.liters}
            onChange={(e) => set("liters", e.target.value === "" ? "" : Math.floor(Number(e.target.value)))}
          />
          <span>litres</span>
        </label>
        <button type="button" onClick={() => set("liters", liters + 1)} aria-label="One litre more">+</button>
      </div>

      <div className="chips">
        {PRESETS.map((p) => (
          <button key={p} type="button" className={liters === p ? "chip on" : "chip"} onClick={() => set("liters", p)}>
            {p} L
          </button>
        ))}
      </div>
      {liters > 0 && <p className="muted">Fills: {suggestCans(liters)}</p>}
      <p className="offer">{CONFIG.discountTiers.slice().reverse().map((x) => `${x.min} L+ = ${x.pct}% off`).join(" · ")}</p>

      <h2>How do you want it?</h2>
      <div className="seg">
        <button type="button" className={order.mode === "pickup" ? "on" : ""} onClick={() => set("mode", "pickup")}>
          Collect at shop
          <small>No extra charge</small>
        </button>
        <button type="button" className={order.mode === "delivery" ? "on" : ""} onClick={() => set("mode", "delivery")}>
          Home delivery
          <small>+ {money(CONFIG.deliveryCharge)} delivery</small>
        </button>
      </div>

      {order.mode === "delivery" && (
        <div className="fields">
          <select value={order.slot} onChange={(e) => set("slot", e.target.value)} aria-label="Delivery slot">
            {CONFIG.slots.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="Name" value={order.name} onChange={(e) => set("name", e.target.value)} />
          <input
            placeholder="Phone (10 digits)"
            inputMode="numeric"
            maxLength={10}
            value={order.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
          />
          <textarea placeholder="Delivery address" rows={2} value={order.address} onChange={(e) => set("address", e.target.value)} />
        </div>
      )}

      <dl className="sum">
        <div><dt>{liters} L × {money(CONFIG.ratePerLiter)}</dt><dd>{money(t.water)}</dd></div>
        {t.discount > 0 && <div className="off"><dt>Bulk discount {t.pct}%</dt><dd>− {money(t.discount)}</dd></div>}
        {order.mode === "delivery" && <div><dt>Delivery charge</dt><dd>{money(t.delivery)}</dd></div>}
        {t.tax > 0 && <div><dt>GST {CONFIG.gstPercent}%</dt><dd>{money(t.tax)}</dd></div>}
        <div className="net"><dt>Net pay</dt><dd>{money(t.total)}</dd></div>
      </dl>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={!!error} onClick={onNext}>
        Continue to pay {money(t.total)}
      </button>
    </div>
  );
}
