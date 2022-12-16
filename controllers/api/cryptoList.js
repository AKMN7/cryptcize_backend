const axios = require("axios");
const coinLogo = require("./coinLogo");
const supportedCoins = require('../../utils/supportedCoins');
const indicators = require('../../utils/indicators');

// Get the top 100 coins by market cap along with their logos
exports.cryptoList = async (limit, includeIndicators) => {
    // Get Coins Data from CoinMarketCap API
    const results = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=${process.env.CMC_API}&limit=${limit}`);

    let resultsArr = [];

    // Organize Data
    for (const el of results.data.data) {
        resultsArr.push({
            name: el.name,
            symbol: el.symbol,
            id: (await (supportedCoins.coinSupported((el.symbol).toLowerCase()))).id,
            total_supply: el.total_supply,
            circulating_supply: el.circulating_supply,
            price: el.quote.USD.price,
            price_change: el.quote.USD.percent_change_24h,
            market_cap: el.quote.USD.market_cap,
            volume: el.quote.USD.volume_24h,
            volume_change: el.quote.USD.volume_change_24h,
        });
    }

    // Get Coin Logos
    const coinLogos = await coinLogo.getCoinLogo(resultsArr);

    // Merge Data with logos and return as organized result
    let mergedData = coinLogo.mergeObjects(resultsArr, coinLogos);

    if (includeIndicators) {
        // Add Indicators to top 10 Cryptos
        for (let i = 0; i < 10; i++) {
            mergedData[i].indicators = await indicators.getCoinIndicators(mergedData[i].id);
        }
    }

    return mergedData;
};