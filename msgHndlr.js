//Get Modules
const { msgFilter } = require(process.cwd() + "/msgFilter")
const { MessageType, Mimetype } = require("@adiwajshing/baileys")
const fs = require("fs")
const imgToPDF = require("pdfkit")

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
} = MessageType

const db = JSON.parse(fs.readFileSync("./database/db.json"))

module.exports = msgHandler = async (conn, msg) => {
  try {
    const content = JSON.stringify(msg.message)
    const prefix = "/"

    const from = msg.key.remoteJid
    const isGroup = from.endsWith("@g.us")
    const id = isGroup ? msg.participant : msg.key.remoteJid
    const type = Object.keys(msg.message)[0]

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
        : ""

    const argv = body.slice(1).trim().split(/ +/).shift().toLowerCase()
    const args = body.trim().split(/ +/).slice(1)
    const isCmd = body.startsWith(prefix)

    let pushname =
      conn.contacts[id] != undefined
        ? conn.contacts[id].vname || conn.contacts[id].notify || "-"
        : undefined

    const groupMetadata = isGroup ? await conn.groupMetadata(from) : ""
    const groupName = isGroup ? groupMetadata.subject : ""
    const groupId = isGroup ? groupMetadata.id : ""
    const groupMembers = isGroup ? groupMetadata.participants : ""
    const isMedia =
      type === "imageMessage" ||
      type === "videoMessage" ||
      type === "audioMessage"

    conn.isQuotedImage =
      type === "extendedTextMessage" && content.includes("imageMessage")
    conn.isQuotedVideo =
      type === "extendedTextMessage" && content.includes("videoMessage")
    conn.isQuotedAudio =
      type === "extendedTextMessage" && content.includes("audioMessage")
    conn.isQuotedSticker =
      type === "extendedTextMessage" && content.includes("stickerMessage")
    conn.isQuotedMessage =
      type === "extendedTextMessage" && content.includes("conversation")

    //Custom Event
    conn.reply = (from, teks) => {
      conn.sendMessage(from, teks, text, { quoted: msg })
    }

    // dynamic db
    conn.db = conn.db ? conn.db : {}

    if (type === 'imageMessage') {
        if (id in conn.db) {
            var name = Date.now()
            var buffer= await conn.downloadMediaMessage(msg)
            conn.db[id].image.push(msg)
            conn.db[id].array.push(buffer)

            console.log(conn.db)
        }
    } else if (type === 'conversation') {
        switch (argv) {
            case "return":
                conn.reply(from, JSON.stringify(eval(args.join(' ')), null, '\t'))
                break
            case "imgtopdf":
                if (id in conn.db) return conn.reply(from, 'kamu sudah menjalankan mode ini')
                namafile = 'zefiangantenk'
                conn.db[id] = {
                    name: namafile,
                    image: [],
                    array: []
                }

                conn.reply(from, "Kirim gambar sesuka kamu, jika sudah ketik /create")
                if (namafile == "zefiangantenk")
                    conn.reply(from, "kamu tidak memasukkan namafile, jadi aku buat default yaa")
                break
            case "create":
                if (!(id in conn.db)) return conn.reply(from,`Kamu belum mengaktifkan mode ImageToPdf, untuk mengaktifkan gunakan ${prefix}imgtopdf`)

                let nameFile = conn.db[id].name
                var files = fs.createWriteStream(nameFile + '.pdf')

                var pdf = new imgToPDF({ autoFirstPage: false })

                for (const bufferImage of conn.db[id].array) {
                     var image = pdf.openImage(bufferImage)
                     pdf.addPage({ size: [image.width, image.height] })
                     pdf.image(image, 0,0)
                }

                pdf.pipe(files)
                pdf.end()

                files.on('finish', () => {
                    conn.sendMessage(from, fs.readFileSync(process.cwd() + `/${nameFile}.pdf`), MessageType.document, {
                        mimetype: Mimetype.pdf,
                        filename: nameFile + '.pdf',
                        quoted: msg
                   })
                })
                delete conn.db[id]
                break
            case 'eval':
                return eval(args.join(' '))
                break
            case "tes":
                try{
                    conn.sendMessage(from, fs.readFileSync("./trash/2C4AFD216CC69434E79C5ACAF6980E95.pdf", MessageType.document, {mimetype: Mimetype.pdf, filename: "aa"}))
                } catch (e){
                    conn.sendMessage(from, e, text)
                }
                break
            default:
               break
        }
    }
  } catch (e) {
    console.log(`Error : ${e}`)
  }
}
