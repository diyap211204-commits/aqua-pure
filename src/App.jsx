import { useEffect, useState } from "react";
import { CONFIG } from "./config";
import Scene from "./components/Scene.jsx";
import OrderForm from "./components/OrderForm.jsx";
import Payment from "./components/Payment.jsx";
import History from "./components/History.jsx";
import Bill from "./components/Bill.jsx";
import { calcTotals, loadJSON, makeBillNo, money, saveJSON } from "./utils";

const BLANK = { liters: 5, mode: "pickup", slot: CONFIG.slots[0], name: "", phone: "", address: "" };

export default function App() {
  const [stage, setStage] = useState("order"); 
  const [order, setOrder] = useState(BLANK);
  const [bill, setBill] = useState(null);
  const [tank, setTank] = useState(() => loadJSON("aqua_tank", CONFIG.initialTank));
  const [history, setHistory] = useState(() => loadJSON("aqua_bills", []));
  const [status, setStatus] = useState("idle"); 
  const [dispensed, setDispensed] = useState(0);
  const [showSales, setShowSales] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => saveJSON("aqua_tank", tank), [tank]);
  useEffect(() => saveJSON("aqua_bills", history), [history]);
  useEffect(() => {
    if (status !== "flowing" || !bill) return;
    const id = setInterval(() => {
      setDispensed((d) => Math.min(bill.liters, d + CONFIG.flowLitersPerSecond * 0.1));
    }, 100);
    return () => clearInterval(id);
  }, [status, bill]);
  useEffect(() => {
    if (bill && status === "flowing" && dispensed >= bill.liters) {
      setStatus("done");
      setTank((t) => Math.max(0, t - bill.liters));
    }
  }, [dispensed, status, bill]);

  const handlePaid = (method, cashGiven) => {
    const now = new Date();
    const todayCount = history.filter((b) => new Date(b.date).toDateString() === now.toDateString()).length;
    const liters = Number(order.liters);
    const nb = {
      no: makeBillNo(now, todayCount + 1),
      date: now.toISOString(),
      liters,
      rate: CONFIG.ratePerLiter,
      mode: order.mode,
      slot: order.slot,
      customer: order.mode === "delivery" ? { name: order.name, phone: order.phone, address: order.address } : null,
      ...calcTotals(liters, order.mode),
      method,
      cashGiven,
    };
    setBill(nb);
    setHistory((h) => [...h, nb]);
    setDispensed(0);
    setStatus("idle");
    setStage("bill");
  };

  const newOrder = () => {
    setBill(null);
    setOrder(BLANK);
    setDispensed(0);
    setStatus("idle");
    setStage("order");
  };

  const toggleTap = () => setStatus((s) => (s === "flowing" ? "paused" : s === "done" ? s : "flowing"));
  const refillTank = () => setTank(CONFIG.tankCapacity);

  const tell = (title, msg) => setNotice({ title, msg });
  const paying = stage === "bill" && status !== "done";

  const orderError = () => {
    const l = Number(order.liters);
    if (!l || l < CONFIG.minLiters) return "Please choose the number of litres first.";
    if (l > CONFIG.maxLiters) return `Maximum ${CONFIG.maxLiters} litres per order.`;
    if (l > tank) return `Only ${Math.floor(tank)} L left in the tank.`;
    if (order.mode === "delivery" && (!order.name.trim() || !/^\d{10}$/.test(order.phone) || !order.address.trim()))
      return "Please enter the name, a 10-digit phone number and the address for delivery.";
    return "";
  };

  const go = (target) => {
    if (target === "refill") {
      if (paying) return tell("Filling in progress", "Please finish filling the current order before refilling the tank.");
      refillTank();
      return tell("Tank refilled", `The tank is now full (${CONFIG.tankCapacity} L).`);
    }
    if (target === "order") {
      if (paying) return tell("Order already paid", "This order is paid. Please finish filling it, then start the next order.");
      if (stage === "bill") return newOrder();
      return setStage("order");
    }
    if (target === "pay") {
      if (stage === "bill") return tell("Already paid", "Payment for this order is complete. Open Bill & fill to continue.");
      const err = orderError();
      return err ? tell("Complete your order first", err) : setStage("pay");
    }
    if (!bill) return tell("Payment required", "Please complete the payment first. The bill and the tap unlock after payment.");
    setStage("bill");
  };

  const tapBlocked = () =>
    status === "done"
      ? tell("Order complete", "This order has been filled. Please start a new order for the next customer.")
      : tell("Please pay first", "The tap is locked. Complete your order and make the payment, then the tap will open and your water will be filled.");

  const liters = bill ? bill.liters : Number(order.liters) || 0;
  const shownTank = status === "done" ? tank : tank - (stage === "bill" ? dispensed : 0);

  const today = history.filter((b) => new Date(b.date).toDateString() === new Date().toDateString());
  const todayTotal = today.reduce((s, b) => s + b.total, 0);

  const caption =
    stage === "order"
      ? "The can resizes as you choose litres."
      : stage === "pay"
      ? "Pay to unlock the tap."
      : status === "done"
      ? "Tap closed."
      : "Tap is unlocked.";

  return (
    <main className="wall">
      <section className="board">
        <header className="board-head">
          <div>
            <h1>Purified Drinking Water</h1>
            <p className="rate"><b>{money(CONFIG.ratePerLiter)}</b> per litre · {CONFIG.shopName}</p>
          </div>
          <nav className="tabs" aria-label="Sections">
            {[["order", "Order"], ["pay", "Pay"], ["bill", "Bill & fill"]].map(([k, l]) => (
              <button key={k} className={stage === k ? "tab now" : "tab"} onClick={() => go(k)}>{l}</button>
            ))}
            <button className="tab" onClick={() => setShowSales(true)}>Sales</button>
            <button className="tab" onClick={() => go("refill")}>Refill tank</button>
          </nav>
        </header>

        <div className="board-body">
          <div className="scene-wrap">
            <Scene
              liters={liters || 1}
              dispensed={stage === "bill" ? dispensed : 0}
              tank={shownTank}
              capacity={CONFIG.tankCapacity}
              flowing={status === "flowing"}
              tapEnabled={stage === "bill" && status !== "done"}
              done={status === "done"}
              onTap={toggleTap}
              onBlocked={tapBlocked}
            />
            <p className="caption">{caption}</p>
          </div>

          {stage === "order" && (
            <OrderForm order={order} setOrder={setOrder} tank={tank} onNext={() => setStage("pay")} />
          )}
          {stage === "pay" && (
            <Payment total={calcTotals(Number(order.liters), order.mode).total} onBack={() => setStage("order")} onPaid={handlePaid} />
          )}
          {stage === "bill" && bill && (
            <Bill bill={bill} status={status} dispensed={dispensed} onNewOrder={newOrder} />
          )}
        </div>

        <footer className="board-foot no-print">
          <button className="link" onClick={() => setShowSales(true)}>Today: {today.length} orders, {money(todayTotal)}</button>
          <button className="link" onClick={refillTank} disabled={stage === "bill" && status !== "done"}>
            Refill tank
          </button>
        </footer>
      </section>

      {notice && (
        <div className="modal" role="alertdialog" aria-label={notice.title} onClick={() => setNotice(null)}>
          <div className="sheet small" onClick={(e) => e.stopPropagation()}>
            <h2>{notice.title}</h2>
            <p>{notice.msg}</p>
            <button className="primary" autoFocus onClick={() => setNotice(null)}>OK</button>
          </div>
        </div>
      )}
      {showSales && <History bills={history} tank={tank} onClose={() => setShowSales(false)} />}
    </main>
  );
}