const axios = require("axios");

// Get The Top Four Trending Coins
exports.topFour = async () => {
    const coinList = await axios.get("https://api.coingecko.com/api/v3/search/trending");
    let final = await finalIizeCoinList(coinList.data.coins);
    return {
        trendingCoins: final
    };
};


// Add The Price and Price Change to the top four coins
const finalIizeCoinList = async (lst) => {
    const result = [];
    for (const el of lst) {
        // Get Data from Coin Gecko API
        await axios.get(`https://api.coingecko.com/api/v3/coins/${el.item.id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`).then(response => {
            result.push({
                coin: el.item.name,
                symbol: el.item.symbol,
                id: el.item.id,
                price: response.data.market_data.current_price.usd,
                priceChange: response.data.market_data.price_change_24h,
                logo: el.item.small
            });
        });
    }
    return result;
};