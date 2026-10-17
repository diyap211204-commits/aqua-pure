import { money } from "../utils";

export default function History({ bills, tank, onClose }) {
  const today = bills.filter((b) => new Date(b.date).toDateString() === new Date().toDateString());
  const litres = today.reduce((s, b) => s + b.liters, 0);
  const sum = (m) => today.filter((b) => b.method === m).reduce((s, b) => s + b.total, 0);

  const download = () => {
    const rows = [["Bill", "Date", "Litres", "Mode", "Discount", "Delivery", "Total", "Paid by"],
      ...bills.map((b) => [b.no, b.date, b.liters, b.mode, b.discount || 0, b.delivery, b.total, b.method])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "sales.csv" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal" role="dialog" aria-label="Today's sales" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Today's sales</h2>
        <div className="kpis">
          <p><b>{today.length}</b>orders</p>
          <p><b>{litres} L</b>sold</p>
          <p><b>{money(sum("UPI"))}</b>UPI</p>
          <p><b>{money(sum("Cash"))}</b>cash</p>
          <p><b>{Math.round(tank)} L</b>in tank</p>
        </div>
        <ul>
          {today.slice().reverse().map((b) => (
            <li key={b.no}><span>{b.no} · {b.liters} L · {b.mode}</span><b>{money(b.total)}</b></li>
          ))}
          {today.length === 0 && <li className="muted">No sales yet today.</li>}
        </ul>
        <div className="row">
          <button className="ghost" onClick={download}>Download CSV</button>
          <button className="primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
