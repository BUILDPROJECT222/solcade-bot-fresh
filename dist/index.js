"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const pools_1 = __importDefault(require("./pools"));
const web3_js_1 = require("@solana/web3.js");
const gamba_core_v2_1 = require("gamba-core-v2");
const config = {
    solanaRpcUrl: "https://halie-j5jyx0-fast-mainnet.helius-rpc.com/",
    botToken: "6682971859:AAHgPzAEf2RccZN2DLk5w0efiisgQdYCTT8",
    chatId: "-1002078356415",
};
const web3Connection = new web3_js_1.Connection(config.solanaRpcUrl, "confirmed");
const bot = new node_telegram_bot_api_1.default(config.botToken, { polling: false });
const gambaProvider = new gamba_core_v2_1.GambaProvider(web3Connection, {
    commitment: "confirmed",
});
gambaProvider.gambaProgram.addEventListener("GameSettled", (data, slot, signature) => {
    const shortUser = `${data.user.toString().slice(0, 6)}...${data.user.toString().slice(-6)}`;
    const formatMultiplier = (bps) => `${(bps / 100).toFixed(2)}%`;
    const metadataInfo = data.metadata ? data.metadata.split(":").slice(1).join(":").trim().replace(/-/g, "\\-") : "N/A";
    const tokenMint = data.tokenMint;
    const poolConfig = pools_1.default[tokenMint];
    if (poolConfig) {
        const isWin = data.payout > 0;
        const resultEmoji = isWin ? "🟢" : "🔴";
        const resultText = isWin ? "WIN" : "LOSS";
        const formatAmount = (amount, decimals) => {
            const formattedAmount = Number(amount) / Math.pow(10, decimals);
            return formattedAmount.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        };
        // Determine the image file path based on win or loss
        const imageFilePath = isWin ? './win.png' : './loss.png';
        const message = [
            `*${resultEmoji} SOLCADE GAME ${resultText} ${resultEmoji}*`,
            `*User:* \`${shortUser}\``,
            `*Wager:* \`${formatAmount(data.wager, poolConfig.decimals)} ${poolConfig.symbol}\``,
            `*Payout:* \`${formatAmount(data.payout, poolConfig.decimals)} ${poolConfig.symbol}\``,
            `*Multiplier:* \`${formatMultiplier(data.multiplierBps)}\``,
            `*Time:* \`${new Date().toLocaleString()}\``,
            `*Metadata:* \`${metadataInfo}\``,
        ].join("\n");
        const options = {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "View Transaction", url: `https://explorer.gamba.so/tx/${signature}` }],
                ],
            },
        };
        // Sending message with the appropriate image
        bot
            .sendPhoto(config.chatId, imageFilePath, Object.assign({ caption: message }, options))
            .then(() => {
            console.log("Message with image sent to Telegram successfully.");
        })
            .catch((error) => {
            console.error("Failed to send message with image to Telegram:", error);
        });
    }
    else {
        console.error(`Pool configuration not found for token mint: ${tokenMint}`);
    }
});
