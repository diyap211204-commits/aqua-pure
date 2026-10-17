import { CONFIG } from "../config";
import { money } from "../utils";

export default function Bill({ bill, status, dispensed, onNewOrder }) {
  const pct = Math.round((dispensed / bill.liters) * 100);
  const when = new Date(bill.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const statusText =
    status === "done"
      ? bill.mode === "delivery"
        ? "Can filled. Handed over for delivery."
        : "Can filled. Please collect your water."
      : status === "flowing"
      ? "Filling…"
      : dispensed > 0
      ? "Paused. Turn the tap to resume."
      : "Paid. Turn the tap above to fill your can.";

  return (
    <div className="panel">
      <article className="bill-sheet" aria-label="Bill">
        <header>
          <strong>{CONFIG.shopName}</strong>
          <span>{CONFIG.shopAddress} · {CONFIG.shopPhone}</span>
        </header>
        <div className="bill-meta">
          <span>Bill {bill.no}</span>
          <span>{when}</span>
        </div>
        {bill.customer && (
          <p className="bill-cust">
            {bill.customer.name}, {bill.customer.phone}
            <br />
            {bill.customer.address}
            <br />Slot: {bill.slot}
          </p>
        )}
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Purified drinking water</td><td>{bill.liters} L</td><td>{money(bill.rate)}</td><td>{money(bill.water)}</td></tr>
            {bill.discount > 0 && <tr><td colSpan="3">Bulk discount {bill.pct}%</td><td>− {money(bill.discount)}</td></tr>}
            {bill.delivery > 0 && <tr><td>Delivery charge</td><td>1</td><td>{money(bill.delivery)}</td><td>{money(bill.delivery)}</td></tr>}
            {bill.tax > 0 && <tr><td>GST {CONFIG.gstPercent}%</td><td></td><td></td><td>{money(bill.tax)}</td></tr>}
          </tbody>
          <tfoot>
            <tr><td colSpan="3">Net pay</td><td>{money(bill.total)}</td></tr>
          </tfoot>
        </table>
        <p className="bill-pay">
          Paid by {bill.method}
          {bill.method === "Cash" && bill.cashGiven > bill.total ? `, change ${money(bill.cashGiven - bill.total)}` : ""}
        </p>
        <p className="bill-thanks">Thank you. Drink safe.</p>
      </article>

      <div className="no-print">
        <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="status" aria-live="polite">{statusText}</p>
        <div className="row">
          <button className="ghost" onClick={() => window.print()}>Print bill</button>
          <a className="ghost" target="_blank" rel="noreferrer" href={`https://wa.me/${bill.customer ? "91" + bill.customer.phone : ""}?text=${encodeURIComponent(`${CONFIG.shopName}\nBill ${bill.no}\n${bill.liters} L purified water\nNet pay ${money(bill.total)} (${bill.method})\nThank you!`)}`}>Share on WhatsApp</a>
          {status === "done" && <button className="primary" onClick={onNewOrder}>Next customer</button>}
        </div>
      </div>
    </div>
  );
}
