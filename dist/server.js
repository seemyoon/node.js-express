"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_router_1 = require("./router/user.router");
const config_1 = require("./config/config");
const mongoose = __importStar(require("mongoose"));
const auth_router_1 = require("./router/auth.router");
const cron_1 = require("./cron");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/users", user_router_1.userRouter);
app.use("/auth", auth_router_1.authRouter);
app.use("*", (err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
    next();
});
process.on("uncaughtException", (error) => {
    console.log(error);
    process.exit(1);
});
app.listen(config_1.configs.APP_PORT, async () => {
    await mongoose.connect(config_1.configs.APP_MONGO_URL);
    (0, cron_1.cronRunner)();
    console.log(`Server running on http://${config_1.configs.APP_HOST}:${config_1.configs.APP_PORT}`);
});
