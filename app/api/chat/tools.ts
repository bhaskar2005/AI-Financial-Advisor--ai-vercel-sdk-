import { tool } from "ai";
import { z } from "zod";

// Types for API responses
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  latestTradingDay: string;
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

interface MarketNews {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: string;
}

interface ForexRate {
  base: string;
  target: string;
  rate: number;
  lastUpdated: string;
}

// Alpha Vantage API for stock data (free tier: 25 requests/day)
async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    const data = await response.json();

    if (data["Global Quote"] && Object.keys(data["Global Quote"]).length > 0) {
      const quote = data["Global Quote"];
      return {
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(
          quote["10. change percent"]?.replace("%", "")
        ),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
        volume: parseInt(quote["06. volume"]),
        latestTradingDay: quote["07. latest trading day"],
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

// CoinGecko API for crypto data (free, no API key needed)
async function fetchCryptoPrice(coinId: string): Promise<CryptoPrice | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return null;
  }
}

// Fetch top cryptocurrencies
async function fetchTopCryptos(limit: number = 10): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return [];
  }
}

// Exchange rate API for forex
async function fetchForexRate(
  base: string,
  target: string
): Promise<ForexRate | null> {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`
    );
    const data = await response.json();

    if (data && data.rates && data.rates[target]) {
      return {
        base,
        target,
        rate: data.rates[target],
        lastUpdated: data.date,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching forex rate:", error);
    return null;
  }
}

// Alpha Vantage for market news
async function fetchMarketNews(tickers?: string): Promise<MarketNews[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";

  try {
    const tickerParam = tickers ? `&tickers=${tickers}` : "";
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${tickerParam}&apikey=${apiKey}`
    );
    const data = await response.json();

    if (data && data.feed) {
      return data.feed
        .slice(0, 5)
        .map(
          (item: {
            title: string;
            summary: string;
            source: string;
            url: string;
            time_published: string;
            overall_sentiment_label: string;
          }) => ({
            title: item.title,
            summary: item.summary?.slice(0, 200) + "...",
            source: item.source,
            url: item.url,
            publishedAt: item.time_published,
            sentiment: item.overall_sentiment_label,
          })
        );
    }
    return [];
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
}

// Fear & Greed Index (alternative.me)
async function fetchFearGreedIndex(): Promise<{
  value: number;
  classification: string;
  timestamp: string;
} | null> {
  try {
    const response = await fetch("https://api.alternative.me/fng/");
    const data = await response.json();

    if (data && data.data && data.data.length > 0) {
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
        timestamp: data.data[0].timestamp,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching fear & greed index:", error);
    return null;
  }
}

// Define tools for the AI using the ai SDK tool helper
export const financialTools = {
  getStockQuote: tool({
    description:
      "Get real-time stock quote for a given stock symbol (e.g., AAPL, GOOGL, MSFT, TSLA). Use this when the user asks about a specific stock price or wants stock information.",
    inputSchema: z.object({
      symbol: z
        .string()
        .describe("The stock ticker symbol (e.g., AAPL, GOOGL, MSFT)"),
    }),
    execute: async ({ symbol }) => {
      const quote = await fetchStockQuote(symbol.toUpperCase());
      if (quote) {
        return {
          success: true,
          data: quote,
          message: `Stock data for ${
            quote.symbol
          }: Price $${quote.price.toFixed(2)}, Change: ${
            quote.change >= 0 ? "+" : ""
          }${quote.change.toFixed(2)} (${
            quote.changePercent >= 0 ? "+" : ""
          }${quote.changePercent.toFixed(2)}%), Day Range: $${quote.low.toFixed(
            2
          )} - $${quote.high.toFixed(
            2
          )}, Volume: ${quote.volume.toLocaleString()}`,
        };
      }
      return {
        success: false,
        message: `Unable to fetch stock data for ${symbol}. The symbol might be invalid or the API limit may have been reached.`,
      };
    },
  }),

  getCryptoPrice: tool({
    description:
      "Get real-time cryptocurrency price for a given coin (e.g., bitcoin, ethereum, solana). Use this when the user asks about crypto prices.",
    inputSchema: z.object({
      coinId: z
        .string()
        .describe(
          "The cryptocurrency ID (e.g., bitcoin, ethereum, solana, cardano, dogecoin)"
        ),
    }),
    execute: async ({ coinId }) => {
      const crypto = await fetchCryptoPrice(coinId.toLowerCase());
      if (crypto) {
        return {
          success: true,
          data: crypto,
          message: `${
            crypto.name
          } (${crypto.symbol.toUpperCase()}): Price $${crypto.current_price.toLocaleString()}, 24h Change: ${
            crypto.price_change_percentage_24h >= 0 ? "+" : ""
          }${crypto.price_change_percentage_24h.toFixed(2)}%, Market Cap: $${(
            crypto.market_cap / 1e9
          ).toFixed(2)}B, 24h Volume: $${(crypto.total_volume / 1e9).toFixed(
            2
          )}B`,
        };
      }
      return {
        success: false,
        message: `Unable to fetch crypto data for ${coinId}. Please check the coin name.`,
      };
    },
  }),

  getTopCryptos: tool({
    description:
      "Get the top cryptocurrencies by market cap. Use this when the user wants to see the overall crypto market or top performing coins.",
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .default(10)
        .describe("Number of top cryptos to return (1-20)"),
    }),
    execute: async ({ limit }) => {
      const cryptos = await fetchTopCryptos(limit);
      if (cryptos.length > 0) {
        const summary = cryptos
          .map(
            (c, i) =>
              `${i + 1}. ${
                c.name
              } (${c.symbol.toUpperCase()}): $${c.current_price.toLocaleString()} (${
                c.price_change_percentage_24h >= 0 ? "+" : ""
              }${c.price_change_percentage_24h.toFixed(2)}%)`
          )
          .join("\n");
        return {
          success: true,
          data: cryptos,
          message: `Top ${limit} Cryptocurrencies by Market Cap:\n${summary}`,
        };
      }
      return {
        success: false,
        message: "Unable to fetch top cryptocurrencies.",
      };
    },
  }),

  getForexRate: tool({
    description:
      "Get the exchange rate between two currencies. Use this for forex/currency conversion questions.",
    inputSchema: z.object({
      baseCurrency: z
        .string()
        .describe("The base currency code (e.g., USD, EUR, GBP)"),
      targetCurrency: z
        .string()
        .describe("The target currency code (e.g., EUR, JPY, INR)"),
    }),
    execute: async ({ baseCurrency, targetCurrency }) => {
      const rate = await fetchForexRate(
        baseCurrency.toUpperCase(),
        targetCurrency.toUpperCase()
      );
      if (rate) {
        return {
          success: true,
          data: rate,
          message: `Exchange Rate: 1 ${rate.base} = ${rate.rate.toFixed(4)} ${
            rate.target
          } (Last updated: ${rate.lastUpdated})`,
        };
      }
      return {
        success: false,
        message: `Unable to fetch exchange rate for ${baseCurrency}/${targetCurrency}.`,
      };
    },
  }),

  getMarketNews: tool({
    description:
      "Get the latest financial market news and sentiment. Optionally filter by stock symbols.",
    inputSchema: z.object({
      tickers: z
        .string()
        .optional()
        .describe(
          "Optional: Comma-separated stock symbols to filter news (e.g., AAPL,MSFT)"
        ),
    }),
    execute: async ({ tickers }) => {
      const news = await fetchMarketNews(tickers);
      if (news.length > 0) {
        const summary = news
          .map(
            (n, i) =>
              `${i + 1}. **${n.title}** (${n.source}) - Sentiment: ${
                n.sentiment
              }\n   ${n.summary}`
          )
          .join("\n\n");
        return {
          success: true,
          data: news,
          message: `Latest Market News:\n\n${summary}`,
        };
      }
      return {
        success: false,
        message: "Unable to fetch market news at this time.",
      };
    },
  }),

  getFearGreedIndex: tool({
    description:
      "Get the current Fear & Greed Index for the crypto market. Use this to gauge overall market sentiment.",
    inputSchema: z.object({}),
    execute: async () => {
      const index = await fetchFearGreedIndex();
      if (index) {
        return {
          success: true,
          data: index,
          message: `Crypto Fear & Greed Index: ${index.value}/100 (${index.classification}). This indicates the current market sentiment - lower values suggest fear (potential buying opportunity), higher values suggest greed (potential caution).`,
        };
      }
      return {
        success: false,
        message: "Unable to fetch Fear & Greed Index.",
      };
    },
  }),

  getMarketOverview: tool({
    description:
      "Get a comprehensive market overview including major indices sentiment. Use this for general market condition questions.",
    inputSchema: z.object({}),
    execute: async () => {
      // Fetch multiple data points for overview
      const [fearGreed, topCryptos] = await Promise.all([
        fetchFearGreedIndex(),
        fetchTopCryptos(3),
      ]);

      let overview = "📊 **Market Overview**\n\n";

      if (fearGreed) {
        overview += `**Crypto Market Sentiment:** ${fearGreed.classification} (${fearGreed.value}/100)\n\n`;
      }

      if (topCryptos.length > 0) {
        overview += "**Top 3 Cryptocurrencies:**\n";
        topCryptos.forEach((c, i) => {
          const changeIcon = c.price_change_percentage_24h >= 0 ? "📈" : "📉";
          overview += `${i + 1}. ${
            c.name
          }: $${c.current_price.toLocaleString()} ${changeIcon} ${c.price_change_percentage_24h.toFixed(
            2
          )}%\n`;
        });
      }

      return {
        success: true,
        message: overview,
      };
    },
  }),
};
