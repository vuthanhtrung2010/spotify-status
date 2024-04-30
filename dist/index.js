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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_session_1 = __importDefault(require("express-session"));
var axios_1 = __importDefault(require("axios"));
var spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
var client_1 = require("@prisma/client");
require("@dotenvx/dotenvx").config();
var app = (0, express_1.default)();
var PORT = Number(process.env.PORT) || 3000;
var prisma = new client_1.PrismaClient();
function getData() {
    return __awaiter(this, void 0, void 0, function () {
        var allTokenData, token, refreshToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.User.findUnique({
                        where: {
                            email: process.env.email,
                        },
                    })];
                case 1:
                    allTokenData = _a.sent();
                    if (!allTokenData) {
                        return [2 /*return*/, {
                                token: null,
                                refreshToken: null,
                            }];
                    }
                    token = allTokenData.token;
                    refreshToken = allTokenData.refreshToken;
                    return [2 /*return*/, { token: token, refreshToken: refreshToken }];
            }
        });
    });
}
var refreshAccessToken = function (refreshToken) { return __awaiter(void 0, void 0, void 0, function () {
    var clientId, clientSecret, url, payload, headers, response, data, newAccessToken, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                clientId = process.env.client_id;
                clientSecret = process.env.client_secret;
                if (!refreshToken) {
                    console.log("skipping refresh token. Please login");
                    return [2 /*return*/];
                }
                url = "https://accounts.spotify.com/api/token";
                payload = new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                });
                headers = {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: "Basic ".concat(Buffer.from("".concat(clientId, ":").concat(clientSecret)).toString("base64")),
                    },
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, axios_1.default.post(url, payload, headers)];
            case 2:
                response = _a.sent();
                data = response.data;
                newAccessToken = data.access_token;
                return [4 /*yield*/, prisma.User.update({
                        where: {
                            email: process.env.email,
                        },
                        data: {
                            token: newAccessToken,
                        },
                    })];
            case 3:
                _a.sent();
                spotifyApi.setAccessToken(newAccessToken);
                console.log("Access token refreshed:", newAccessToken);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error("Error refreshing token:", error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
function ensureData() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, token, refreshToken, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getData()];
                case 1:
                    _a = _b.sent(), token = _a.token, refreshToken = _a.refreshToken;
                    spotifyApi.setAccessToken(token);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error("Error ensuring data:", error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, token, refreshToken_1, error_3;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    app.use(function (req, res, next) {
                        res.locals.spotifyApi = spotifyApi;
                        next();
                    });
                    app.use(body_parser_1.default.urlencoded({ extended: true }));
                    app.use(body_parser_1.default.json());
                    app.use((0, express_session_1.default)({
                        secret: "86e3c8f0ae954893967ce6a7d2403e6d",
                        resave: true,
                        saveUninitialized: true,
                    }));
                    app.use(function (req, res, next) {
                        res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://spotify.trung.is-a.dev https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://i.scdn.co; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com; connect-src https://spotify.trung.is-a.dev");
                        next();
                    });
                    app.set("view engine", "ejs");
                    app.set("views", "views");
                    app.use(express_1.default.static("public"));
                    app.get("/status-data", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var token_1, status, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, getData()];
                                case 1:
                                    token_1 = (_a.sent()).token;
                                    spotifyApi.setAccessToken(token_1);
                                    return [4 /*yield*/, spotifyApi.getMyCurrentPlayingTrack()];
                                case 2:
                                    status = _a.sent();
                                    res.json({ status: status });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_4 = _a.sent();
                                    console.error("Error retrieving status data:", error_4);
                                    res
                                        .status(500)
                                        .json({ error: "An error occurred while retrieving status data" });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/dashboard", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var allScopes, authorizeURL;
                        return __generator(this, function (_a) {
                            try {
                                allScopes = [
                                    "user-read-private",
                                    "user-read-email",
                                    "user-library-read",
                                    "user-read-recently-played",
                                    "user-top-read",
                                    "playlist-read-private",
                                    "playlist-modify-public",
                                    "user-read-playback-state",
                                    "user-read-currently-playing",
                                ];
                                authorizeURL = spotifyApi.createAuthorizeURL(allScopes, "state");
                                res.redirect(authorizeURL);
                            }
                            catch (error) {
                                console.error("Error generating authorization URL:", error);
                                res.status(500).send("Error occurred");
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    app.get("/callback", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, code, email, data, _b, access_token, refresh_token, user_data, err_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = req.query, code = _a.code, email = _a.email;
                                    if (email !== process.env.EMAIL) {
                                        return [2 /*return*/, res.status(403).send("Unauthorized")];
                                    }
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 8, , 9]);
                                    return [4 /*yield*/, spotifyApi.authorizationCodeGrant(code)];
                                case 2:
                                    data = _c.sent();
                                    _b = data.body, access_token = _b.access_token, refresh_token = _b.refresh_token;
                                    req.session.access_token = access_token;
                                    req.session.refresh_token = refresh_token;
                                    return [4 /*yield*/, prisma.User.findUnique({
                                            where: {
                                                email: process.env.email,
                                            },
                                        })];
                                case 3:
                                    user_data = _c.sent();
                                    if (!!user_data) return [3 /*break*/, 5];
                                    return [4 /*yield*/, prisma.User.create({
                                            data: {
                                                email: process.env.email,
                                                token: access_token,
                                                refreshToken: refresh_token,
                                            },
                                        })];
                                case 4:
                                    _c.sent();
                                    return [3 /*break*/, 7];
                                case 5: return [4 /*yield*/, prisma.User.update({
                                        where: {
                                            email: process.env.email,
                                        },
                                        data: {
                                            token: access_token,
                                            refreshToken: refresh_token,
                                        },
                                    })];
                                case 6:
                                    _c.sent();
                                    _c.label = 7;
                                case 7:
                                    spotifyApi.setAccessToken(access_token);
                                    spotifyApi.setRefreshToken(refresh_token);
                                    res.redirect("/");
                                    return [3 /*break*/, 9];
                                case 8:
                                    err_1 = _c.sent();
                                    console.error("Error getting tokens:", err_1);
                                    res.status(500).send("Error occurred");
                                    return [3 /*break*/, 9];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var token_2, status, artists, track_1, track_2, track, err_2;
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
                        return __generator(this, function (_0) {
                            switch (_0.label) {
                                case 0:
                                    _0.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, getData()];
                                case 1:
                                    token_2 = (_0.sent()).token;
                                    spotifyApi.setAccessToken(token_2);
                                    return [4 /*yield*/, spotifyApi.getMyCurrentPlayingTrack()];
                                case 2:
                                    status = _0.sent();
                                    artists = (((_b = (_a = status.body) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.artists) || []).map(function (artist) {
                                        return {
                                            name: artist.name,
                                            link: "https://open.spotify.com/artist/".concat(artist.id),
                                        };
                                    });
                                    if (status.body.currently_playing_type === "ad") {
                                        track_1 = {
                                            image: "None",
                                            name: "None",
                                            artists: "None",
                                            album: "None",
                                            id: "None",
                                            current_process: 0,
                                            track_duration: 0,
                                            track_link: "https://trung.is-a.dev",
                                        };
                                        if (!((_c = status.body) === null || _c === void 0 ? void 0 : _c.is_playing) ||
                                            typeof ((_d = status.body) === null || _d === void 0 ? void 0 : _d.is_playing) === "undefined") {
                                            res.render("status", { data: { isPlaying: false, track: track_1 } });
                                        }
                                        else {
                                            res.render("status", { data: { isPlaying: true, track: track_1 } });
                                        }
                                    }
                                    if (!((_e = status.body) === null || _e === void 0 ? void 0 : _e.is_playing) ||
                                        typeof ((_f = status.body) === null || _f === void 0 ? void 0 : _f.is_playing) === "undefined") {
                                        track_2 = {
                                            image: ((_k = (_j = (_h = (_g = status.body) === null || _g === void 0 ? void 0 : _g.item) === null || _h === void 0 ? void 0 : _h.album) === null || _j === void 0 ? void 0 : _j.images[0]) === null || _k === void 0 ? void 0 : _k.url) || "None",
                                            name: ((_m = (_l = status.body) === null || _l === void 0 ? void 0 : _l.item) === null || _m === void 0 ? void 0 : _m.name) || "None",
                                            artists: artists.map(function (artist) { return artist.name; }).join(", ") || "None",
                                            album: ((_q = (_p = (_o = status.body) === null || _o === void 0 ? void 0 : _o.item) === null || _p === void 0 ? void 0 : _p.album) === null || _q === void 0 ? void 0 : _q.name) || "None",
                                            id: ((_s = (_r = status.body) === null || _r === void 0 ? void 0 : _r.item) === null || _s === void 0 ? void 0 : _s.id) || "None",
                                            current_process: ((_u = (_t = status.body) === null || _t === void 0 ? void 0 : _t.item) === null || _u === void 0 ? void 0 : _u.progress_ms) || 0,
                                            track_duration: ((_w = (_v = status.body) === null || _v === void 0 ? void 0 : _v.item) === null || _w === void 0 ? void 0 : _w.duration_ms) || 0,
                                        };
                                        res.render("status", { data: { isPlaying: false, track: track_2 } });
                                        return [2 /*return*/];
                                    }
                                    track = {
                                        image: ((_x = status.body.item.album.images[0]) === null || _x === void 0 ? void 0 : _x.url) || "None",
                                        name: status.body.item.name || "None",
                                        artists: (((_z = (_y = status.body) === null || _y === void 0 ? void 0 : _y.item) === null || _z === void 0 ? void 0 : _z.artists) || []).map(function (artist) { return ({
                                            name: artist.name,
                                            link: "https://open.spotify.com/artist/".concat(artist.id),
                                        }); }),
                                        album: {
                                            name: status.body.item.album.name || "None",
                                            link: "https://open.spotify.com/album/".concat(status.body.item.album.id),
                                        },
                                        id: status.body.item.id || "None",
                                        current_progress: status.body.progress_ms,
                                        track_duration: status.body.item.duration_ms || 0,
                                    };
                                    res.render("status", { data: { isPlaying: true, track: track } });
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_2 = _0.sent();
                                    console.log(err_2);
                                    if (err_2.message.includes("The access token expired")) {
                                        res.redirect("/dashboard");
                                        return [2 /*return*/];
                                    }
                                    res.status(500).send("Error occurred");
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, getData()];
                case 1:
                    _a = _b.sent(), token = _a.token, refreshToken_1 = _a.refreshToken;
                    if (!refreshAccessToken || refreshAccessToken === null) {
                        console.log("not refreshing token. please login on route /dashboard");
                    }
                    else {
                        refreshAccessToken(refreshToken_1);
                    }
                    setInterval(function () {
                        refreshAccessToken(refreshToken_1);
                    }, 30 * 60 * 1000);
                    app.listen(PORT, function () { return console.log("Server running on port ".concat(PORT)); });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _b.sent();
                    console.error("Error starting server:", error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var spotifyApi = new spotify_web_api_node_1.default({
    clientId: process.env.client_id,
    clientSecret: process.env.client_secret,
    redirectUri: process.env.redirect_uri,
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ensureData()];
            case 1:
                _a.sent();
                return [4 /*yield*/, startServer()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
