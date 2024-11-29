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
var basic_1 = require("@nlpjs/basic");
var order_context_json_1 = require("../contexts/order_context.json");
var information_context_json_1 = require("../contexts/information_context.json");
var greeting_context_json_1 = require("../contexts/greeting_context.json");
var human_service_context_json_1 = require("../contexts/human_service_context.json");
// const { similarity } = require('@nlpjs/similarity')
var similarity_1 = require("@nlpjs/similarity");
var NlpService = /** @class */ (function () {
    function NlpService(lang) {
        if (lang === void 0) { lang = 'pt'; }
        var _this = this;
        this.lang = lang;
        this.specialWords = { 'order.request': 'cardapio' };
        this.onIntent = function (_nlp, input) {
            var regex = /[\s,.;:?!]+/;
            // Usa a expressão regular para dividir a string
            var wordArray = input.utterance
                .split(regex)
                .filter(function (word) { return word.length > 0; });
            for (var _i = 0, wordArray_1 = wordArray; _i < wordArray_1.length; _i++) {
                var word = wordArray_1[_i];
                for (var _a = 0, _b = Object.entries(_this.specialWords); _a < _b.length; _a++) {
                    var _c = _b[_a], intent = _c[0], specialWord = _c[1];
                    var levenshtein = (0, similarity_1.similarity)(word, specialWord, true);
                    if (levenshtein >= 0 &&
                        levenshtein <= 3 &&
                        (input.intent === 'None' || input.score < 0.9)) {
                        input.intent = intent;
                    }
                }
            }
            return input;
        };
    }
    NlpService.getInstance = function () {
        if (!NlpService.instance) {
            NlpService.instance = new NlpService();
        }
        return NlpService.instance;
    };
    NlpService.prototype.train = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dock, nlp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, basic_1.dockStart)({ use: ['Basic'] })];
                    case 1:
                        dock = _a.sent();
                        nlp = dock.get('nlp');
                        nlp.onIntent = this.onIntent;
                        return [4 /*yield*/, nlp.addCorpus(order_context_json_1.default)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, nlp.addCorpus(information_context_json_1.default)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, nlp.addCorpus(greeting_context_json_1.default)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, nlp.addCorpus(human_service_context_json_1.default)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, nlp.train()];
                    case 6:
                        _a.sent();
                        this.nlp = nlp;
                        return [2 /*return*/];
                }
            });
        });
    };
    NlpService.prototype.process = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.nlp.process(this.lang, message)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return NlpService;
}());
// export default NlpService;
var nlpService = NlpService.getInstance();
exports.default = nlpService;
