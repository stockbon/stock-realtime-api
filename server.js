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

// ===== FETCH DATA =====
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

// ===== ANALYZE =====
function analyze(s) {
  if (!s) return null;

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

// ===== ROUTES =====
app.get("/board1", async (req, res) => {
  try {
    const data = await fetchData(BOARD1);
    res.json(data.map(analyze));
  } catch {
    res.status(500).send("Error board1");
  }
});

app.get("/board2", async (req, res) => {
  try {
    const data = await fetchData(BOARD2);
    res.json(data.map(analyze));
  } catch {
    res.status(500).send("Error board2");
  }
});

app.get("/board3", async (req, res) => {
  try {
    const data = await fetchData(BOARD3);
    res.json(data.map(analyze));
  } catch {
    res.status(500).send("Error board3");
  }
});

app.listen(PORT, () => {
  console.log("🚀 Running on port " + PORT);
});
app.get("/board1-view", async (req, res) => {
  const data = await fetchData(BOARD1);

  let html = "<h2>📊 BẢNG 1</h2><table border='1'><tr><th>Mã</th><th>Giá</th><th>%</th><th>Vol</th><th>Tín hiệu</th></tr>";

  data.map(analyze).forEach(s => {
    html += `<tr>
      <td>${s.symbol}</td>
      <td>${s.price}</td>
      <td>${s.percent}%</td>
      <td>${s.volume}</td>
      <td>${s.signal}</td>
    </tr>`;
  });

  html += "</table>";
  res.send(html);
});
