const axios = require("axios");
const indicators = require('../../utils/indicators');

// Get favourited coins data
exports.finalIizeFavsList = async (lst) => {
    const result = [];
    for (const el of lst) {
        // Fetch Data from Coin Gecko API
        let response = await axios.get(`https://api.coingecko.com/api/v3/coins/${el.coinID}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);

        result.push({
            coin: el.coinName,
            symbol: el.coinSymbol,
            id: el.coinID,
            price: response.data.market_data.current_price.usd,
            priceChange: response.data.market_data.price_change_24h,
            logo: response.data.image.small,
            indicators: await indicators.getCoinIndicators(el.coinID)
        });
    }
    return result;
};