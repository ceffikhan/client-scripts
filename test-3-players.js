import axios from "axios";
import { io } from "socket.io-client";

const API = "http://localhost:4000";

/* ---------------- REGISTER USER ---------------- */
async function registerUser(username) {
  const res = await axios.post(`${API}/api/users/register`, {
    username,
  });
  return res.data;
}

/* ---------------- CREATE SESSION ---------------- */
async function createSession() {
  const res = await axios.post(`${API}/api/sessions/create`, {
    durationSeconds: 15,
  });
  return res.data;
}

/* ---------------- CONNECT SOCKET ---------------- */
function connectPlayer(player, sessionId, pointsToAdd) {
  const socket = io(API, {
    auth: { token: player.token },
  });

  socket.on("connect", () => {
    console.log(`🟢 ${player.user.username} connected`);

    socket.emit("join-session", { sessionId });

    setTimeout(() => {
      socket.emit("add-points", {
        sessionId,
        points: pointsToAdd,
      });
      console.log(`➕ ${player.user.username} gets ${pointsToAdd} points`);
    }, 2000);
  });

  socket.on("session-ended", (data) => {
    console.log(
      `🏁 ${player.user.username} sees result → Winner: ${data.winner}, Score: ${data.score}`
    );
    socket.disconnect();
  });

  socket.on("error", (err) => {
    console.error(`❌ ${player.user.username}:`, err);
  });
}

/* ---------------- MAIN TEST ---------------- */
async function runTest() {
  console.log("\n🎮 Starting 3-player session test\n");

  // 1️⃣ Register players
  const player1 = await registerUser("player1");
  const player2 = await registerUser("player2");
  const player3 = await registerUser("player3");

  // 2️⃣ Create session
  const session = await createSession();
  console.log("🆔 Session created:", session.id);

  // 3️⃣ Join session with different scores
  connectPlayer(player1, session.id, 5);
  connectPlayer(player2, session.id, 20); // should win
  connectPlayer(player3, session.id, 10);

  // 4️⃣ End session after 10 seconds
//   setTimeout(async () => {
//     const adminSocket = io(API, {
//       auth: { token: player1.token },
//     });

//     adminSocket.on("connect", () => {
//       adminSocket.emit("end-session", {
//         sessionId: session.id,
//       });
//       adminSocket.disconnect();
//     });
//   }, 10000);
}

runTest();
