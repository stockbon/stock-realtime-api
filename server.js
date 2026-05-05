const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ===== DANH SÁCH BẢNG 1 =====
const BOARD1 = ["SHB","MSB","MBB","VIB","TPB","TCB","VPB","VCB","BID","CTG","FPT","VIX","VIC"];

// ===== API VIETSTOCK (JSON ẩn) =====
const API = "https://priceboard.vietstock.vn/data/getstockdata";

// ===== FETCH DATA =====
async function fetchBoard(symbols) {
  try {
    const res = await axios.post(API, {
      board: "HOSE",
      pageIndex: 1,
      pageSize: 50
    });

    const all = res.data.data;

    // lọc theo danh sách bảng 1
    return all.filter(s => symbols.includes(s.sym));
  } catch (err) {
    console.log("API error");
    return [];
  }
}

// ===== PHÂN TÍCH =====
function analyze(s) {
  const price = s.price;
  const ref = s.refPrice;
  const volume = s.totalVol;

  const percent = ((price - ref) / ref) * 100;

  let signal = "";
  if (volume > 1000000 && percent > 1.5) signal = "🚀 KÉO";
  else if (volume > 1000000 && percent < -2) signal = "⚠️ XẢ";
  else if (volume > 1000000 && percent < 0.5) signal = "⚠️ XẢ KÍN";

  return {
    symbol: s.sym,
    price,
    percent: percent.toFixed(2),
    volume,
    signal
  };
}

// ===== ROUTE =====
app.get("/board1", async (req, res) => {
  const data = await fetchBoard(BOARD1);
  res.json(data.map(analyze));
});

app.listen(PORT, () => {
  console.log("🚀 Running Vietstock mode");
});
