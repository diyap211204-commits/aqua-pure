import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { money, upiLink } from "../utils";

export default function Payment({ total, onBack, onPaid }) {
  const [method, setMethod] = useState("UPI");
  const [cash, setCash] = useState("");
  const given = Number(cash) || 0;
  const change = Math.max(0, given - total);
  const cashOk = given >= total;

  return (
    <div className="panel">
      <h2>Net pay {money(total)}</h2>

      <div className="seg">
        <button type="button" className={method === "UPI" ? "on" : ""} onClick={() => setMethod("UPI")}>UPI</button>
        <button type="button" className={method === "Cash" ? "on" : ""} onClick={() => setMethod("Cash")}>Cash</button>
      </div>

      {method === "UPI" ? (
        <div className="upi">
          <div className="qr">
            <QRCodeSVG value={upiLink(total, "Purified water")} size={172} marginSize={2} />
          </div>
          <p className="muted">Scan with any UPI app, or on a phone:</p>
          <a className="ghost" href={upiLink(total, "Purified water")}>Open UPI app</a>
          <button className="primary" onClick={() => onPaid("UPI", 0)}>I have paid {money(total)}</button>
        </div>
      ) : (
        <div className="cash">
          <label className="field">
            Cash received
            <input type="number" inputMode="decimal" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder={String(total)} />
          </label>
          <button type="button" className="chip" onClick={() => setCash(String(total))}>Exact amount</button>
          {cashOk && <p className="change">Give back {money(change)}</p>}
          <button className="primary" disabled={!cashOk} onClick={() => onPaid("Cash", given)}>
            Cash received, make bill
          </button>
        </div>
      )}

      <button className="link" onClick={onBack}>Change order</button>
    </div>
  );
}
