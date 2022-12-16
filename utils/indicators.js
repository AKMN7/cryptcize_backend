const axios = require("axios");
const RSI = require('technicalindicators').RSI;
const MACD = require('technicalindicators').MACD;
const EMA = require('technicalindicators').EMA;
const SMA = require('technicalindicators').SMA


function getIndicators(prices) {
    let values = [];
    prices.forEach(el => values.push(el[1]));
    let period = 14;

    let rsi = new RSI({ values, period }).nextValue(values[values.length - 1]);

    let macdInput = {
        values, fastPeriod: 12, slowPeriod: 26,
        signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false
    };
    let macd = MACD.calculate(macdInput)[MACD.calculate(macdInput).length - 1];

    let ema100 = EMA.calculate({ period: 100, values });
    let ema50 = EMA.calculate({ period: 50, values });

    let sma100 = SMA.calculate({ period: 100, values });
    let sma50 = SMA.calculate({ period: 50, values });

    return {
        rsi,
        macd,
        ema100: ema100[ema100.length - 1],
        ema50: ema50[ema50.length - 1],
        sma100: sma100[sma100.length - 1],
        sma50: sma50[sma50.length - 1]
    }
}

// Get Favourite Coin Technical Inidcators
exports.getCoinIndicators = async (id) => {
    let result = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=180&interval=daily`);

    return getIndicators(result.data.prices);
}