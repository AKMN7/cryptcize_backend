const axios = require("axios");

// Get Crpto Market Global Metrics
exports.globalMetrics = async () => {
    // Get Data from Coin Geck API
    const overview = await axios.get("https://api.coingecko.com/api/v3/global");

    // Get Bitcoin historical prices from Coin Gecko API
    const btcMarketCap = await axios.get("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=14&interval=daily");

    // Organize and return data
    return {
        overview: {
            totalCryptos: overview.data.data.active_cryptocurrencies,
            marketCap: overview.data.data.total_market_cap.usd,
            volume: overview.data.data.total_volume.usd,
            dominance: Object.entries(overview.data.data.market_cap_percentage)[0]
        },
        btcMarketCap: btcMarketCap.data
    };
};