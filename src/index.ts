import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  useMultiFileAuthState
} from 'baileys'
import { Boom } from '@hapi/boom'
import nlpService from './domains/nlp/services/NlpService'
import pino from 'pino'
import * as http from 'http'
import { io } from 'socket.io-client'

// const CLIENT_ADDRESS = '0.0.0.0'
// const CLIENT_ADDRESS = 'localhost'
const CLIENT_ADDRESS = '192.168.16.1'
const CLIENT_PORT = 4000
console.log('==========================================')
console.log('SOCKET CLIENT ENDPOINT: http://' + CLIENT_ADDRESS + ':' + CLIENT_PORT)
console.log('==========================================')
const socketCLient = io('http://' + CLIENT_ADDRESS + ':' + CLIENT_PORT, {
  transports: ['websocket']
})
socketCLient.on('connect', () => {
  console.log('==========================================')
  console.log('SOCKET CLIENT CONNECTED TO GATEWAY')
  console.log('==========================================')
})

interface ICreateClientRequest {
  userId: number
}

socketCLient.on('createWaClient', (data: ICreateClientRequest) => {
  const { userId } = data
  console.log('==========================================')
  console.log('CREATING CLIENT FOR USER ID: ' + userId)
  console.log('==========================================')
  startSocket(userId)
})

socketCLient.on('disconnect', () => {
  console.log('==========================================')
  console.log('SOCKET CLIENT DISCONNECTED FROM GATEWAY')
  console.log('==========================================')
})

const logger = pino({ level: 'error' })
const store = makeInMemoryStore({})

store.readFromFile('./baileys_store.json')
setInterval(() => {
  store.writeToFile('./baileys_store.json')
}, 10_000)

nlpService.train()
process.on('uncaughtException', (err) => {
  console.log('==========================================')
  console.log('EXCEPTION CAUGHT')
  console.log({ err })
  console.log('==========================================')
})

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  // Configura o cabeçalho da resposta
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  // Envia uma mensagem de resposta
  res.end('Olá, mundo!\n')
})

// Inicia o servidor
server.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:3000/`)
})

async function startSocket(clientId: number) {
  const { state, saveCreds } = await useMultiFileAuthState('./auth/auth_info_client_' + clientId)
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      // @ts-ignore
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    generateHighQualityLinkPreview: true
  })

  sock.ev.on('creds.update', saveCreds) // Auth Manage
  sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
    const { connection, lastDisconnect, qr } = update
    // console.log({update})
    if (qr) {
      // QR CODE RECEIVED
      console.log('==========================================')
      console.log('QR Code Receveid From Client ' + clientId)
      console.log('==========================================')
      socketCLient.emit('clientStatusUpdate', {
        socketId: socketCLient.id,
        clientId: clientId,
        status: 'available'
      })
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(
        'connection closed due to ',
        lastDisconnect.error,
        ', reconnecting ',
        shouldReconnect
      )

      console.log('==========================================')
      console.log('Conection CLOSED To Client ' + clientId + 'Due To ' + lastDisconnect.error)
      console.log('==========================================')
      // reconnect if not logged out
      if (shouldReconnect) {
        startSocket(clientId)
      }
    } else if (connection === 'open') {
      console.log('==========================================')
      console.log('Conection OPENED To Client ' + clientId)
      console.log('==========================================')
      socketCLient.emit('clientStatusUpdate', {
        socketId: socketCLient.id,
        clientId: clientId,
        status: 'connected'
      })
    }
  })
  sock.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2))
    const chatId = m.messages[0].key.remoteJid!

    const message = m.messages[0].message

    if (message?.conversation && clientId !== 2) {
      const nlpResponse = await nlpService.process(m.messages[0].message!.conversation!)
      await sock.sendMessage(chatId, {
        text: nlpResponse.intent
      })
      // await sock.addChatLabel(chatId, "2");
      // const catalog = await sock.getCatalog({jid: "5511933000531@s.whatsapp.net"} )
      //
      // console.log("==========================================")
      // console.log("Catalog Loaded From 5511933000531@s.whatsapp.net")
      // console.log({catalog})
      // console.log("==========================================")
    }
  })
  sock.ev.on('presence.update', async (data) => {
    console.log('==========================================')
    // console.log(JSON.stringify(data, undefined, 2));
    if (data.presences[data.id].lastKnownPresence === 'available') {
      console.log(data.id + ' está online')
    }
    if (data.presences[data.id].lastKnownPresence === 'composing') {
      console.log(data.id + ' está digitando...')
    }
    console.log('==========================================')
  })
  sock.ev.on('labels.association', async (data) => {
    console.log('==========================================')
    console.log('Label Associated From Client ' + clientId)
    console.log(JSON.stringify(data, undefined, 2))
    console.log('==========================================')
  })
  sock.ev.on('labels.edit', async (data) => {
    console.log('==========================================')
    console.log('Label Edited From Client ' + clientId)
    console.log(JSON.stringify(data, undefined, 2))
    console.log('==========================================')
  })
  store.bind(sock.ev)
}

// startSocket(1)

// startSocket(2);
// startSocket(4);