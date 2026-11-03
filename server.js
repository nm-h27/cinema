const http = require("http");
const path = require("path");
const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

app.use(express.static(path.join(__dirname, "public")));

// Sổ đăng ký ghế tập trung trên Server (Chống trùng chỗ & chống khai khống chỗ ngồi: 1 Player = 1 Ghế duy nhất)
const seatRegistry = new Map();
const activePlayers = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (e) {
      return;
    }
    if (!msg || !msg.id || !msg.roomCode) return;

    activePlayers.set(ws, { id: msg.id, roomCode: msg.roomCode });

    if (msg.type === "SEAT_CLAIM") {
      const seatKey = `${msg.roomCode}:${msg.hallIdx}:${msg.seatId}`;
      const existing = seatRegistry.get(seatKey);
      if (existing && existing.id !== msg.id && existing.ts <= msg.ts) {
        ws.send(JSON.stringify({
          type: "SEAT_CLAIM",
          ...existing,
          roomCode: msg.roomCode
        }));
        return;
      }
      for (const [k, v] of seatRegistry.entries()) {
        if (v.roomCode === msg.roomCode && v.id === msg.id && k !== seatKey) {
          seatRegistry.delete(k);
        }
      }
      seatRegistry.set(seatKey, { ...msg });
    }

    const payload = JSON.stringify(msg);
    for (const [client, meta] of activePlayers.entries()) {
      if (client !== ws && client.readyState === 1 && meta.roomCode === msg.roomCode) {
        client.send(payload);
      }
    }
  });

  ws.on("close", () => {
    const meta = activePlayers.get(ws);
    if (meta) {
      for (const [k, v] of seatRegistry.entries()) {
        if (v.id === meta.id && v.roomCode === meta.roomCode) {
          seatRegistry.delete(k);
        }
      }
      activePlayers.delete(ws);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Galaxy Royal Cinema 3D Multiplayer running at http://localhost:${PORT}`);
});
