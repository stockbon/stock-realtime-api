const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ===== DANH SÁCH =====
const BOARD1 = ["SHB","MSB","MBB","VIB","TPB","TCB","VPB","VCB","BID","CTG","FPT","VIX","VIC"];
const BOARD2 = ["GAS","PVD","PVS","HAH","VSC","VJC","HVN","CMG"];
const BOARD3 = ["DIG","DXG","SCR","HQC","ASM","IDI","VIX","SHB","TPB"];

// ===== API VIETSTOCK =====
const API = "https://priceboard.vietstock.vn/data/getstockdata";

// ===== FETCH =====
async function fetchAll() {
  try {
    const res = await axios.post(API, {
      board: "HOSE",
      pageIndex: 1,
      pageSize: 500
    });
    return res.data.data || [];
  } catch {
    return [];
  }
}

// ===== PHÂN TÍCH =====
function analyze(s) {
  const price = Number(s.lastPrice) || 0;
  const ref = Number(s.refPrice) || price || 1;
  const ceil = Number(s.ceiling) || 0;
  const floor = Number(s.floor) || 0;
  const vol = Number(s.matchedVol) || 0;

  const percent = ((price - ref) / ref) * 100;

  // ===== DÒNG TIỀN =====
  let flow = "⚖️";
  if (vol > 3000000 && percent > 1.5) flow = "✅ mạnh";
  else if (vol < 1000000) flow = "❌ yếu";

  // ===== XU HƯỚNG =====
  let trend = "Sideway";
  if (percent > 1.5) trend = "Tăng";
  else if (percent < -1.5) trend = "Giảm";

  // ===== XẢ KÍN =====
  let dump = "🟡";
  if (vol > 3000000 && percent < 0.5) dump = "🔴";

  // ===== HÀNH ĐỘNG =====
  let action = "Quan sát";
  if (flow === "✅ mạnh" && trend === "Tăng") action = "Canh mua";
  else if (dump === "🔴") action = "Tránh";
  else if (trend === "Tăng") action = "Lướt";

  return {
    symbol: s.sym,
    price,
    ceil,
    floor,
    vol,
    flow,
    trend,
    dump,
    action
  };
}

// ===== BUILD BOARD =====
function buildBoard(list, raw) {
  return raw
    .filter(s => list.includes(s.sym))
    .map(analyze)
    .sort((a,b) => b.vol - a.vol);
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

app.listen(PORT, () => {
  console.log("🚀 FULL REALTIME API READY");
});
