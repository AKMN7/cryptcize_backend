const axios = require("axios");

// Get The Fear and Greed Index of the market
exports.index = async () => {
    // Get Fear and Greed Data from alternative API
    const fearLst = await axios.get("https://api.alternative.me/fng/?limit=30");

    return {
        now: {
            value: fearLst.data.data[0].value,
            value_class: fearLst.data.data[0].value_classification
        },
        yesterday: {
            value: fearLst.data.data[1].value,
            value_class: fearLst.data.data[1].value_classification
        },
        lastWeek: {
            value: fearLst.data.data[7].value,
            value_class: fearLst.data.data[7].value_classification
        },
        lastMonth: {
            value: fearLst.data.data[29].value,
            value_class: fearLst.data.data[29].value_classification
        }
    }
};