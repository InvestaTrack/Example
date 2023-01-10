const Stock = require('./models/stocks');
const mongoose = require('mongoose');
const yahooFinance = require('yahoo-finance2').default;
yahooFinance.setGlobalConfig({ queue: { concurrency: Infinity } });
require('dotenv').config();

const findAll = async (stock) => {
    setTimeout(() => {
        return;
    }, "3000");
    let data;
    try {
        data = Promise.all(stock.map(symbol => yahooFinance.quote(symbol)));
    }
    catch (err) {
        console.log(err);
        console.log('CAUGHT');
    }
    finally {
        return data;
    }
}

const getStocks = (stockNames => {
    let names = [];
    stockNames.forEach(name => {
        names.push(name.name);
    })
    return names;
})
const run = () => {
    setTimeout(() => {
        run();
    }, "10000");
    mongoose
        .connect("mongodb+srv://testuser:" + process.env.MONGO_PASS + "@cluster0.ebrke3f.mongodb.net/investa?retryWrites=true&w=majority")
        .then(() => {
            Stock.find()
                .then(stocks => {
                    const arr = getStocks(stocks);
                    findAll(arr)
                        .then(current => {
                            Stock.updateStocks(stocks, current);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        })
}

run();