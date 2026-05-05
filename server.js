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

        console.log(symbol, res.data?.length); // 👈 DEBUG

        return {
          symbol,
          data: res.data
        };
      } catch (err) {
        console.log("ERROR", symbol);
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

function analyze(s) {
  if (!s || !s.data || s.data.length === 0) {
    return {
      symbol: s.symbol,
      price: "N/A",
      percent: "N/A",
      volume: 0,
      signal: "NO DATA"
    };
  }

  const last = s.data[s.data.length - 1];

  const price = last.matchPrice || 0;
  const ref = last.referencePrice || price;
  const volume = last.totalVolume || 0;

  const percent = ref ? ((price - ref) / ref) * 100 : 0;

  return {
    symbol: s.symbol,
    price,
    percent: percent.toFixed(2),
    volume,
    signal: ""
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
