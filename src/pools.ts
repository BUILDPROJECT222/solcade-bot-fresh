// src/pools.ts

// WILL NEED UPDATED AS NEW POOLS ARE ADDED SO WE CAN TRACK
// DECIMALS SINCE REACT UI PACKAGE IS NOT AVAILABLE HERE

export interface PoolConfig {
  [key: string]: {
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
  };
}

const poolsConfig: PoolConfig = {
    "So11111111111111111111111111111111111111112": {
        name: "Solana",
        symbol: "SOL",
        decimals: 9,
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": {
        name: "Jupiter",
        symbol: "JUP",
        decimals: 6,
        icon: "https://static.jup.ag/jup/icon.png",
    },
    "7vuhsRQ2gE4WPv37qegBKu8PcWHxDb5rQ6fQKkDfUghF": {
      name: "Solana Arcade",
      symbol: "SOLCADE",
      decimals: 6,
      icon: "https://i.ibb.co/7GGztMG/logo-32.png",
    },
};

export default poolsConfig;
