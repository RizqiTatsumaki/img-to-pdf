//Get Modules
const { msgFilter } = require(process.cwd() + "/msgFilter");
const { MessageType, Mimetype } = require("@adiwajshing/baileys");
const request = require("request");
const axios = require("axios");
const fs = require("fs");
const imgToPDF = require("image-to-pdf");
const randomUseragent = require("random-useragent");

const {
  text,
  audio,
  contact,
  document,
  image,
  liveLocation,
  location,
  product,
  sticker,
  video,
} = MessageType;

const db = JSON.parse(fs.readFileSync("./database/db.json"));

module.exports = msgHandler = async (conn, msg) => {
  try {
    const content = JSON.stringify(msg.message);
    const prefix = "/";

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const id = isGroup ? msg.participant : msg.key.remoteJid;
    const type = Object.keys(msg.message)[0];

    body =
      type === "conversation" && msg.message.conversation.startsWith(prefix)
        ? msg.message.conversation
        : type == "imageMessage" &&
          msg.message.imageMessage.caption.startsWith(prefix)
        ? msg.message.imageMessage.caption
        : type == "videoMessage" &&
          msg.message.videoMessage.caption.startsWith(prefix)
        ? msg.message.videoMessage.caption
        : type == "extendedTextMessage" &&
          msg.message.extendedTextMessage.text.startsWith(prefix)
        ? msg.message.extendedTextMessage.text
        : "";

    const argv = body.slice(1).trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const isCmd = body.startsWith(prefix);

    let pushname =
      conn.contacts[id] != undefined
        ? conn.contacts[id].vname || conn.contacts[id].notify || "-"
        : undefined;

    const groupMetadata = isGroup ? await conn.groupMetadata(from) : "";
    const groupName = isGroup ? groupMetadata.subject : "";
    const groupId = isGroup ? groupMetadata.id : "";
    const groupMembers = isGroup ? groupMetadata.participants : "";
    const isMedia =
      type === "imageMessage" ||
      type === "videoMessage" ||
      type === "audioMessage";

    conn.isQuotedImage =
      type === "extendedTextMessage" && content.includes("imageMessage");
    conn.isQuotedVideo =
      type === "extendedTextMessage" && content.includes("videoMessage");
    conn.isQuotedAudio =
      type === "extendedTextMessage" && content.includes("audioMessage");
    conn.isQuotedSticker =
      type === "extendedTextMessage" && content.includes("stickerMessage");
    conn.isQuotedMessage =
      type === "extendedTextMessage" && content.includes("conversation");

    //Custom Event
    conn.reply = (from, teks) => {
      conn.sendMessage(from, teks, text, { quoted: msg });
    };

    switch (argv) {
      case "return":
        conn.reply(from, JSON.stringify(eval(msg, null, "	")));
        break;
      case "imgtopdf":
        if (db[id]) return conn.reply(from, "Kamu sudah menjalankan mode ini");
        namFil = args[0];
        if (namFil == undefined) namFil = "zefiangantenk";
        db[id] = {
          nameFile: namFil,
          image: [],
        };
        fs.writeFileSync("./database/db.json", JSON.stringify(db), (err) => {
          if (err) console.log(err);
        });
        conn.reply(from, "Kirim gambar sesuka kamu, jika sudah ketik /create");
        if (namFil == "zefiangantenk")
          conn.reply(
            from,
            "kamu tidak memasukkan namafile, jadi aku buat default yaa"
          );
        break;
      case "create":
        if (!db[id])
          return conn.reply(
            from,
            `Kamu belum mengaktifkan mode ImageToPdf, untuk mengaktifkan gunakan ${prefix}imgtopdf`
          );
        // let ua = randomUseragent.getRandom(); // gets a random user agent string
        let files = db[id].image;
        let nameFile = db[id].nameFile;
        imgToPDF(files, "A4").pipe(
          fs.createWriteStream(`./trash/${msg.key.id}.pdf`)
        );
        let file = fs.readFileSync(`trash/${msg.key.id}.pdf`);
        conn.sendMessage(from, file, MessageType.document, {
          mimetype: Mimetype.pdf,
          filename: `${nameFile}.pdf`,
          caption: "ya",
        });
        break;
        case "tes":
          try{
            conn.sendMessage(from, fs.readFileSync("./trash/2C4AFD216CC69434E79C5ACAF6980E95.pdf", MessageType.document, {mimetype: Mimetype.pdf, filename: "aa"}))
          } catch (e){
            conn.sendMessage(from, e, text)
          }
          break
      default:
        if (db[id] && !msg.message.imageMessage && db[id].nameFile !== null) {
          conn.reply(from, "hanya image\n\nkirim gambar!!");
        } else if (db[id] && msg.message.imageMessage) {
          await conn
            .downloadAndSaveMediaMessage(msg, `./trash/${msg.key.id}`)
            .then(() => {
              conn.reply(
                from,
                "Sukses menyimpan data.\nApakah ada lagi? jika ada kirim ajaa"
              );
              db[id].image.push(`./trash/${msg.key.id}.jpeg`);
              fs.writeFileSync(
                "./database/db.json",
                JSON.stringify(db),
                (err) => {
                  if (err) console.log(err);
                }
              );
              console.log(
                `${pushname} atau ${id.split("@")[0]} menambahkan image`
              );
            });
        }
    }
  } catch (e) {
    console.log(`Error : ${e}`);
  }
};
