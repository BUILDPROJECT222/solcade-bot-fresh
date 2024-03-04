import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import poolsConfig, { PoolConfig } from "./pools";
import { Connection } from "@solana/web3.js";
import { GambaProvider } from "gamba-core-v2";
import { GameSettledEvent } from "../types";

const config = {
  solanaRpcUrl: "https://halie-j5jyx0-fast-mainnet.helius-rpc.com/",
  botToken: "6682971859:AAHgPzAEf2RccZN2DLk5w0efiisgQdYCTT8",
  chatId: "-1002078356415",
};

const web3Connection = new Connection(config.solanaRpcUrl, "confirmed");
const bot = new TelegramBot(config.botToken, { polling: false });
const gambaProvider = new GambaProvider(web3Connection, {
  commitment: "confirmed",
} as any);

gambaProvider.gambaProgram.addEventListener(
  "GameSettled",
  (data: GameSettledEvent, slot: number, signature: string) => {
    const shortUser = `${data.user.toString().slice(0, 6)}...${data.user.toString().slice(-6)}`;
    const formatMultiplier = (bps: number) => `${(bps / 100).toFixed(2)}%`;
    const metadataInfo = data.metadata ? data.metadata.split(":").slice(1).join(":").trim().replace(/-/g, "\\-") : "N/A";
    const tokenMint = data.tokenMint;
    const poolConfig: { name: string; symbol: string; decimals: number; icon: string } | undefined = poolsConfig[tokenMint];

    if (poolConfig) {
      const isWin = data.payout > 0;
      const resultEmoji = isWin ? "🟢" : "🔴";
      const resultText = isWin ? "WIN" : "LOSS";

      const formatAmount = (amount: bigint, decimals: number) => {
        const formattedAmount = Number(amount) / 10 ** decimals;
        return formattedAmount.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      };

      // Determine the image file path based on win or loss
      const imageFilePath = isWin ? './win.png' : './loss.png';

      const message: string = [
        `*${resultEmoji} SOLCADE GAME ${resultText} ${resultEmoji}*`,
        `*User:* \`${shortUser}\``,
        `*Wager:* \`${formatAmount(data.wager, poolConfig.decimals)} ${poolConfig.symbol}\``,
        `*Payout:* \`${formatAmount(data.payout, poolConfig.decimals)} ${poolConfig.symbol}\``,
        `*Multiplier:* \`${formatMultiplier(data.multiplierBps)}\``,
        `*Time:* \`${new Date().toLocaleString()}\``,
        `*Metadata:* \`${metadataInfo}\``,
      ].join("\n");

      const options: SendMessageOptions = {
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [{ text: "View Transaction", url: `https://explorer.gamba.so/tx/${signature}` }],
          ],
        },
      };

      // Sending message with the appropriate image
      bot
        .sendPhoto(config.chatId, imageFilePath, { caption: message, ...options })
        .then(() => {
          console.log("Message with image sent to Telegram successfully.");
        })
        .catch((error: Error) => {
          console.error("Failed to send message with image to Telegram:", error);
        });
    } else {
      console.error(`Pool configuration not found for token mint: ${tokenMint}`);
    }
  }
);
