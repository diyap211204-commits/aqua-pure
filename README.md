# Aqua Pure: Purified Drinking Water

React (Vite) app for a water plant counter.

Flow: choose litres, pick pickup or home delivery (delivery is billed as an extra charge), pay by UPI or cash, get a bill, then turn the tap on the screen to fill the can. The tank level drops as water is dispensed.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Change shop settings

Edit `src/config.js`: rate per litre, delivery charge, GST, tank size, UPI ID, shop name, tap speed.

## Structure

```
src/
  App.jsx               state and flow (order -> pay -> bill & fill)
  config.js             shop settings
  utils.js              totals, UPI link, storage helpers
  components/
    Scene.jsx           tank, tap, can (SVG)
    OrderForm.jsx       litres + delivery
    Payment.jsx         UPI QR / cash with change
    Bill.jsx            printable bill + fill progress
  styles.css
```

Tank level and bill history are kept in the browser's localStorage. "Refill tank" resets the level to full.
