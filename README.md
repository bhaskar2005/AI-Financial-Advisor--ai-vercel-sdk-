# 💰 AI Financial Advisor

A AI financial advisor chatbot built with Next.js 15, Vercel AI SDK, and Google Gemini. Get real-time market data, cryptocurrency prices, forex rates, and personalized financial insights.

## Features

### AI-Powered Chat

- **Google Gemini 2.5 Flash** - Fast, intelligent responses
- **Streaming responses** - Real-time text generation with smooth animations
- **Tool calling** - AI automatically fetches live data when needed

### Real-Time Financial Data

| Feature          | API              | Description                                      |
| ---------------- | ---------------- | ------------------------------------------------ |
| 📈 Stock Quotes  | Alpha Vantage    | Real-time stock prices (AAPL, GOOGL, TSLA, etc.) |
| 🪙 Crypto Prices | CoinGecko        | Bitcoin, Ethereum, and 10,000+ cryptocurrencies  |
| 📊 Top Cryptos   | CoinGecko        | Top cryptocurrencies by market cap               |
| 💱 Forex Rates   | ExchangeRate-API | 150+ currency exchange rates                     |
| 📰 Market News   | Alpha Vantage    | Latest financial news with sentiment analysis    |
| 😱 Fear & Greed  | Alternative.me   | Crypto market sentiment index                    |

### UI/UX

- **Mocha Mousse theme** - Elegant, warm color palette
- **Dark/Light mode** - System preference detection + manual toggle
- **Responsive design** - Works on desktop and mobile
- **Smooth animations** - Message bubbles, typing indicators, streaming cursor
- **Copy to clipboard** - Easy message copying

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ai-financial-advisor.git
   cd ai-financial-advisor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Required - Google AI API Key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

   # Optional - Alpha Vantage API Key (for stock data & news)
   # Get free key at: https://www.alphavantage.co/support/#api-key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 💬 Example Queries

Try asking the AI:

- `"What's the current price of Bitcoin?"`
- `"Show me Apple stock (AAPL)"`
- `"What's the USD to EUR exchange rate?"`
- `"Show me top 10 cryptocurrencies"`
- `"What's the market sentiment right now?"`
- `"Give me a market overview"`
- `"Should I invest in ETFs for long-term growth?"`

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts      # Chat API endpoint with streaming
│   │       └── tools.ts      # Financial data tools (7 tools)
│   ├── globals.css           # Mocha Mousse theme & animations
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main chat interface
├── public/                   # Static assets
└── package.json
```

## API Configuration

### Free APIs (No key required)

- **CoinGecko** - Cryptocurrency data
- **ExchangeRate-API** - Forex rates
- **Alternative.me** - Fear & Greed Index

### Optional API Keys

- **Alpha Vantage** - Stock quotes & market news (25 free requests/day)
  - [Get free API key](https://www.alphavantage.co/support/#api-key)

## Customization

### Theme Colors

Edit `app/globals.css` to customize the Mocha Mousse color palette:

```css
:root {
  --mocha-50: #fdf8f6;
  --mocha-500: #a47764; /* Primary accent */
  --mocha-900: #44281d;
  /* ... */
}
```

## 📝 Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Build for production                    |
| `npm run start` | Start production server                 |
| `npm run lint`  | Run ESLint                              |

## ⚠️ Disclaimer

This application is for **informational and educational purposes only**. It does not constitute financial advice. Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
