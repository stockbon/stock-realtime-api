const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const SYMBOLS = ["VIX","MBB","MSB","VIC","TCB","VPB"];

async function fetchData() {
  const url = "https://iboard.ssi.com.vn/dchart/api/intraday?symbol=" + SYMBOLS.join(",");
  const res = await axios.get(url);
  return res.data;
}

function analyze(s) {
  const percent = ((s.c - s.r) / s.r) * 100;

  let signal = "";
  if (s.v > 1000000 && percent > 1.5) signal = "🚀 KÉO";
  if (s.v > 1000000 && percent < -2) signal = "⚠️ XẢ";
  if (s.v > 1000000 && percent < 0.5) signal = "⚠️ XẢ KÍN";

  return {
    symbol: s.s,
    price: s.c,
    percent: percent.toFixed(2),
    volume: s.v,
    signal
  };
}

app.get("/board1", async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data.map(analyze));
  } catch {
    res.status(500).send("API lỗi");
  }
});

app.listen(PORT, () => {
  console.log("🚀 Running on port " + PORT);
});
