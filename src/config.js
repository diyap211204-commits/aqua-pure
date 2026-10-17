// Shop settings: change these to match your water plant.
export const CONFIG = {
  shopName: "Aqua Pure Water Plant",
  shopAddress: "Aurangabad, Maharashtra",
  shopPhone: "98XXXXXXXX",

  ratePerLiter: 30,         // Rs per litre
  deliveryCharge: 20,       // flat extra charge for home delivery (Rs)
  gstPercent: 0,            // set 18 if you need GST on the bill

  minLiters: 1,
  maxLiters: 100,
  tankCapacity: 1000,       // litres
  initialTank: 600,         // litres in the tank on first run

  flowLitersPerSecond: 2,   // tap speed (use 2 for a quick demo, 0.5 for realistic)
  containers: [10, 5, 2],   // can sizes sold, largest first

  discountTiers: [{ min: 50, pct: 15 }, { min: 20, pct: 10 }], // bulk discount
  slots: ["Morning (8-11)", "Afternoon (12-4)", "Evening (5-8)"],

  upiId: "yourshop@upi",    // your real UPI ID
  upiPayee: "Aqua Pure Water Plant",
};
