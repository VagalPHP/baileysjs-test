"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var baileys_1 = require("baileys");
var NlpService_1 = require("./domains/nlp/services/NlpService");
var pino_1 = require("pino");
var http = require("http");
var logger = (0, pino_1.default)({ level: 'error' });
var store = (0, baileys_1.makeInMemoryStore)({});
store.readFromFile('./baileys_store.json');
setInterval(function () {
    store.writeToFile('./baileys_store.json');
}, 10000);
NlpService_1.default.train();
process.on('uncaughtException', function (err) {
    console.log('==========================================');
    console.log('EXCEPTION CAUGHT');
    console.log({ err: err });
    console.log('==========================================');
});
var server = http.createServer(function (req, res) {
    // Configura o cabeçalho da resposta
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    // Envia uma mensagem de resposta
    res.end('Olá, mundo!\n');
});
// Inicia o servidor
server.listen(3000, function () {
    console.log("Servidor rodando em http://localhost:3000/");
});
function startSocket(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, state, saveCreds, sock;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, baileys_1.useMultiFileAuthState)('./auth_info_client_' + clientId)];
                case 1:
                    _a = _b.sent(), state = _a.state, saveCreds = _a.saveCreds;
                    sock = (0, baileys_1.default)({
                        printQRInTerminal: true,
                        auth: {
                            creds: state.creds,
                            keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger)
                        },
                        generateHighQualityLinkPreview: true
                    });
                    sock.ev.on('creds.update', saveCreds); // Auth Manage
                    sock.ev.on('connection.update', function (update) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, lastDisconnect, qr, shouldReconnect;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                            // console.log({update})
                            if (qr) {
                                // QR CODE RECEIVED
                                console.log('==========================================');
                                console.log('QR Code Receveid From Client ' + clientId);
                                console.log('==========================================');
                            }
                            if (connection === 'close') {
                                shouldReconnect = ((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                                console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
                                console.log('==========================================');
                                console.log('Conection CLOSED To Client ' + clientId + 'Due To ' + lastDisconnect.error);
                                console.log('==========================================');
                                // reconnect if not logged out
                                if (shouldReconnect) {
                                    startSocket(clientId);
                                }
                            }
                            else if (connection === 'open') {
                                console.log('==========================================');
                                console.log('Conection OPENED To Client ' + clientId);
                                console.log('==========================================');
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    sock.ev.on('messages.upsert', function (m) { return __awaiter(_this, void 0, void 0, function () {
                        var chatId, message, nlpResponse;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(JSON.stringify(m, undefined, 2));
                                    chatId = m.messages[0].key.remoteJid;
                                    message = m.messages[0].message;
                                    if (!((message === null || message === void 0 ? void 0 : message.conversation) && clientId !== 2)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, NlpService_1.default.process(m.messages[0].message.conversation)];
                                case 1:
                                    nlpResponse = _a.sent();
                                    return [4 /*yield*/, sock.sendMessage(chatId, {
                                            text: nlpResponse.intent
                                        })
                                        // await sock.addChatLabel(chatId, "2");
                                        // const catalog = await sock.getCatalog({jid: "5511933000531@s.whatsapp.net"} )
                                        //
                                        // console.log("==========================================")
                                        // console.log("Catalog Loaded From 5511933000531@s.whatsapp.net")
                                        // console.log({catalog})
                                        // console.log("==========================================")
                                    ];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    sock.ev.on('presence.update', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log('==========================================');
                            // console.log(JSON.stringify(data, undefined, 2));
                            if (data.presences[data.id].lastKnownPresence === 'available') {
                                console.log(data.id + ' está online');
                            }
                            if (data.presences[data.id].lastKnownPresence === 'composing') {
                                console.log(data.id + ' está digitando...');
                            }
                            console.log('==========================================');
                            return [2 /*return*/];
                        });
                    }); });
                    sock.ev.on('labels.association', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log('==========================================');
                            console.log('Label Associated From Client ' + clientId);
                            console.log(JSON.stringify(data, undefined, 2));
                            console.log('==========================================');
                            return [2 /*return*/];
                        });
                    }); });
                    sock.ev.on('labels.edit', function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log('==========================================');
                            console.log('Label Edited From Client ' + clientId);
                            console.log(JSON.stringify(data, undefined, 2));
                            console.log('==========================================');
                            return [2 /*return*/];
                        });
                    }); });
                    store.bind(sock.ev);
                    return [2 /*return*/];
            }
        });
    });
}
startSocket(1);
// startSocket(2);
// startSocket(4);
