const axios = require("axios");

// Fucntion to get all coins logos passes as an array
exports.getCoinLogo = async (coinNameArray) => {
    let coinNames = getCoinNames(coinNameArray);

    const results = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?symbol=${coinNames}&aux=logo&CMC_PRO_API_KEY=${process.env.CMC_API}`);

    return results.data.data;
}


// Extract Coin Names
const getCoinNames = (coinNameArray) => {
    let coinArrString = '';

    coinNameArray.forEach((el, index) => {
        if (index == coinNameArray.length - 1) {
            coinArrString = coinArrString + '' + el.symbol;
        } else {
            coinArrString = coinArrString + '' + el.symbol + ',';
        }
    });

    return coinArrString
}


// Merge Two Objects which adds fetched logo to general info
exports.mergeObjects = (arr1, arr2) => {
    let coins = arr1;
    let logos = arr2;

    Object.values(logos).forEach(el => {
        coins.forEach((elm, index) => {
            if (el[0].symbol == elm.symbol) {
                coins[index].logo = el[0].logo;
            }
        });
    });

    return coins;
};