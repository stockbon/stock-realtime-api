const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const BOARD1 = ["SHB","MSB","MBB","VIB","TPB","TCB","VPB","VCB","BID","CTG","FPT","VIX","VIC"];

// ===== FIX CHUẨN =====
async function fetchData(symbols) {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const url = `https://iboard.ssi.com.vn/dchart/api/intraday?symbol=${symbol}`;
        const res = await axios.get(url);
        return res.data;
      } catch {
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

function analyze(s) {
  const percent = ((s.c - s.r) / s.r) * 100;

  let signal = "";
  if (s.v > 1000000 && percent > 1.5) signal = "🚀 KÉO";
  else if (s.v > 1000000 && percent < -2) signal = "⚠️ XẢ";
  else if (s.v > 1000000 && percent < 0.5) signal = "⚠️ XẢ KÍN";

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
    const data = await fetchData(BOARD1);
    res.json(data.map(analyze));
  } catch {
    res.status(500).send("API lỗi");
  }
});

app.listen(PORT, () => {
  console.log("🚀 Running on port " + PORT);
});
