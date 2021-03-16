const { WAConnection, MessageType } = require("@adiwajshing/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const { msgFilter } = require(process.cwd() + "/msgFilter");
const msgHndlr = require(process.cwd() + "/msgHndlr.js")

const conn = new WAConnection();
conn.logger.level = "warn";

conn.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log(`[!] Scan qrcode dengan whatsapp`);
});

conn.on("credentials-updated", () => {
  const authinfo = conn.base64EncodedAuthInfo();
  console.log("[!] Credentials Updated");

  fs.writeFileSync("./bot_session.json", JSON.stringify(authinfo, null, "\t"));
});

fs.existsSync("./bot_session.json") && conn.loadAuthInfo("./bot_session.json");

conn.on("connecting", async function () {
  console.log("[!] Connecting");
});
conn.on("close", async function (cls) {
  console.log(`[!] Bot closed...\nReason: ${cls.reason}`);
});
conn.on("ws-close", async function (cls) {
  console.log(`[!] Websocket closed...\nReason: ${cls.reason}`);
});
conn.on("open", async () => {
  console.log("[!] Bot Is Online Now!!");
});
conn.connect();

conn.on("chat-update", async (msg) => {
  try {
    if (!msg.hasNewMessage) return;
    msg = msg.messages.all()[0];
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid == "status@broadcast") return;
    if (msg.key.fromMe) return;

    msgHndlr(conn, msg)

} catch (e) {
    console.log(`Error : ${e}`);
  }
});
