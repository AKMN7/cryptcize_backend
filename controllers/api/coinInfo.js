const axios = require("axios");
const indicators = require("../../utils/indicators.js");

// Get Coin Info 
exports.getCoin = async (symbol, id) => {
    // Get Coin Info from CoinMarketCap API
    const coinGeneralInfo = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}&CMC_PRO_API_KEY=${process.env.CMC_API}`);
    const results = coinGeneralInfo.data.data[Object.keys(coinGeneralInfo.data.data)[0]][0];

    const coinData = {
        name: results.name,
        symbol: results.symbol,
        id: id,
        marketCap: results.quote.USD.market_cap,
        maxSupply: results.max_supply,
        circulatingSupply: results.circulating_supply,
        totalSupply: results.total_supply,
        price: results.quote.USD.price,
        priceChange: results.quote.USD.percent_change_24h,
        volume: results.quote.USD.volume_24h,
        volumeChange: results.quote.USD.volume_change_24h,
        logo: await getLogo(id),
        priceCharts: await getHistoricalPrices(id)
    };

    coinData.indicators = await indicators.getCoinIndicators(id);

    return {
        coinData
    }
}


// Get Coin Historical Prices from Coin Gecko API
const getHistoricalPrices = async (id) => {
    let result = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=180&interval=daily`);

    return result.data.prices
}


// Get Coin Logo from Coin Gecko API
const getLogo = async (id) => {
    let logo = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);

    return logo.data.image.small;
}