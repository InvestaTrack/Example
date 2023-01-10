const yahooFinance = require('yahoo-finance2').default;
yahooFinance.setGlobalConfig({ queue: { concurrency: Infinity } });

//Find Symbol via YahooFinance API
const getSymbol = (async (name) => {
    let result;
    try {
        result = await yahooFinance.search(name);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if (result && result.quotes.length > 0) {
            return result.quotes[0].symbol
        }
        else {
            return;
        }
    }
});

//Price via Yahoo finance API
const getPrice = (async (name) => {
    let price;
    if (name) {
        try {
            price = await yahooFinance.quote(name);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            if (price) {
                return price.regularMarketPrice;
            }
        }
    }
});

const getStock = (name, cb) =>{
        getSymbol(name)
            .then(n => {
                getPrice(n)
                    .then(p => {
                        if (p) {
                                const stock = {
                                    name: n,
                                    price: p
                                }
                                cb(stock);
                        }
                        else {
                            cb();
                        }
                    })
            })
            .catch(err => {
                console.log(err);
            })
}

module.exports = getStock;