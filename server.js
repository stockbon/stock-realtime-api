const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ===== DANH SÁCH BẢNG 1 =====
const BOARD1 = ["SHB","MSB","MBB","VIB","TPB","TCB","VPB","VCB","BID","CTG","FPT","VIX","VIC"];

// ===== API VIETSTOCK =====
const API = "https://priceboard.vietstock.vn/data/getstockdata";

// ===== FETCH =====
async function fetchBoard() {
  try {
    const res = await axios.post(API, {
      board: "HOSE",
      pageIndex: 1,
      pageSize: 200
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return res.data.data || [];
  } catch (err) {
    console.log("Fetch lỗi:", err.message);
    return [];
  }
}

// ===== PHÂN TÍCH =====
function analyze(s) {
  const price = Number(s.price) || 0;
  const ref = Number(s.refPrice) || price || 1;
  const volume = Number(s.totalVol) || 0;

  const percent = ((price - ref) / ref) * 100;

  // trạng thái giá
  let status = "⚖️";
  if (price === s.ceiling) status = "🟣 Trần";
  else if (price === s.floor) status = "🔵 Sàn";
  else if (price > ref) status = "🟢 Tăng";
  else if (price < ref) status = "🔴 Giảm";

  // dòng tiền
  let signal = "";
  if (volume > 2000000 && percent > 1.5) signal = "🚀 KÉO";
  else if (volume > 2000000 && percent < -2) signal = "⚠️ XẢ";
  else if (volume > 2000000 && percent < 0.5) signal = "⚠️ XẢ KÍN";

  return {
    symbol: s.sym,
    price,
    percent: percent.toFixed(2),
    volume,
    status,
    signal
  };
}

// ===== ROUTE =====
app.get("/board1", async (req, res) => {
  const raw = await fetchBoard();

  const data = raw
    .filter(s => BOARD1.includes(s.sym))
    .map(analyze)
    .sort((a, b) => b.volume - a.volume); // sort dòng tiền

  res.json(data);
});

app.listen(PORT, () => {
  console.log("🚀 Vietstock API running");
});
data.sort((a,b) => (b.volume * b.percent) - (a.volume * a.percent));
