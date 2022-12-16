const fs = require('fs');

// Function to read file from specific file
const readFilePro = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject('I could not find that file.');
            resolve(data);
        });
    });
};


// Return if coin id passed is supported by the Coin Geck API
exports.coinSupported = async (id) => {
    try {
        const data = JSON.parse(await readFilePro(`${__dirname}/coin_gecko.json`));
        return linearSerach(data, id);
        // return data.filter(el => el.id === id || el.symbol === id)[0];
    } catch (err) {
        throw (err);
    }
};


// Searching Algo (Linear Search O(1) best,O(n) average)
const linearSerach = function name(arr, targetID) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === targetID || arr[i].symbol === targetID) {
            return arr[i];
        }
    }
    return false;
}