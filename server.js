const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ===== CONFIG =====
const API = "https://priceboard.vietstock.vn/data/getstockdata";

// ===== DANH SÁCH =====
const BOARD1 = ["SHB","MSB","MBB","VIB","TPB","TCB","VPB","VCB","BID","CTG","FPT","VIX","VIC"];
const BOARD2 = ["GAS","PVD","PVS","HAH","VSC","VJC","HVN","CMG"];
const BOARD3 = ["DIG","DXG","SCR","HQC","ASM","IDI","VIX","SHB","TPB"];

// ===== FETCH DATA =====
async function fetchAll() {
  try {
    const res = await axios.post(API, {
      board: "HOSE",
      pageIndex: 1,
      pageSize: 500
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return res.data?.data || [];
  } catch (err) {
    console.log("Fetch lỗi:", err.message);
    return [];
  }
}

// ===== MAP FIELD (CHỐNG LỆCH) =====
function mapStock(s) {
  return {
    symbol: s.sym,

    price:
      Number(s.lastPrice) ||
      Number(s.matchPrice) ||
      Number(s.price) ||
      0,

    ref:
      Number(s.refPrice) ||
      Number(s.referencePrice) ||
      0,

    ceil:
      Number(s.ceilingPrice) ||
      Number(s.ceiling) ||
      0,

    floor:
      Number(s.floorPrice) ||
      Number(s.floor) ||
      0,

    vol:
      Number(s.totalTradingVolume) ||
      Number(s.matchedVol) ||
      Number(s.totalVol) ||
      Number(s.volume) ||
      0
  };
}

// ===== PHÂN TÍCH =====
function analyze(stock) {
  const { symbol, price, ref, ceil, floor, vol } = stock;

  const percent = ref ? ((price - ref) / ref) * 100 : 0;

  let flow = "⚖️";
  if (vol > 3000000 && percent > 1.5) flow = "✅ mạnh";
  else if (vol < 1000000) flow = "❌ yếu";

  let trend = "Sideway";
  if (percent > 1.5) trend = "Tăng";
  else if (percent < -1.5) trend = "Giảm";

  let dump = "🟡";
  if (vol > 3000000 && percent < 0.5) dump = "🔴";

  let action = "Quan sát";
  if (flow === "✅ mạnh" && trend === "Tăng") action = "Canh mua";
  else if (dump === "🔴") action = "Tránh";
  else if (trend === "Tăng") action = "Lướt";

  return {
    symbol,
    price,
    ceil,
    floor,
    vol,
    percent: percent.toFixed(2),
    flow,
    trend,
    dump,
    action
  };
}

// ===== BUILD =====
function buildBoard(list, raw) {
  return raw
    .filter(s => list.includes(s.sym))
    .map(mapStock)
    .filter(s => s.price > 0 && s.vol > 0) // 👈 LỌC DATA RÁC
    .map(analyze)
    .sort((a, b) => b.vol - a.vol);
}

// ===== ROUTES =====
app.get("/board1", async (req, res) => {
  const raw = await fetchAll();
  res.json(buildBoard(BOARD1, raw));
});

app.get("/board2", async (req, res) => {
  const raw = await fetchAll();
  res.json(buildBoard(BOARD2, raw));
});

app.get("/board3", async (req, res) => {
  const raw = await fetchAll();
  res.json(buildBoard(BOARD3, raw));
});

// ===== DEBUG =====
app.get("/debug", async (req, res) => {
  const raw = await fetchAll();
  res.json(raw.slice(0, 5));
});

app.listen(PORT, () => {
  console.log("🚀 STOCK API READY");
});
