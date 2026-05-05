const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// demo data (sau sẽ thay bằng SSI realtime)
const data = [
  { symbol: "VIX", price: 18.2, percent: 3.2, volume: 12000000, signal: "🚀 KÉO" },
  { symbol: "MBB", price: 26.7, percent: 0.4, volume: 8000000, signal: "" },
  { symbol: "MSB", price: 11.1, percent: -1.2, volume: 6000000, signal: "⚠️ XẢ" }
];

app.get("/board1", (req, res) => res.json(data));
app.get("/board2", (req, res) => res.json(data));
app.get("/board3", (req, res) => res.json(data));

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
