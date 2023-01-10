const Stock = require('./models/stocks');
const mongoose = require('mongoose');
const yahooFinance = require('yahoo-finance2').default;
yahooFinance.setGlobalConfig({ queue: { concurrency: Infinity } });
require('dotenv').config();

let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
today = yyyy +'-' + mm + '-' + dd

const getStocks = (stockNames => {
    let names = [];
    stockNames.forEach(name => {
        names.push(name.name);
    })
    return names;
});

const fetchData = async (stock, query) => {
    let data;

    try {
        data = await yahooFinance.historical(stock, query);
    }
    catch (err) {
        if (err instanceof yahooFinance.errors.HTTPError) {
            console.log('TRUE TURE')
            return 'DATA';
        }
        else {
            return 2;
        }

    }
    finally {
        return data;
    }
}

const findAll = (i, arr, stocks, cb) => {
    fetchData(arr[i], { period1: '1899-09-10', period2: today, interval: '1d' })
        .then(stock => {
            if (stock) {
                stocks.push([]);
                stock.forEach(stock => {
                    let name = arr[i];
                    let date = stock.date;
                    let open = stock.open;
                    let high = stock.high;
                    let low = stock.low;
                    let close = stock.close;
                    let info = {
                        name: name,
                        date: date,
                        open: open,
                        high: high,
                        low: low,
                        close: close
                    }
                    stocks[i].push(info);
                })
                if (i < arr.length - 1) {
                    console.log(arr[i] + ' ADDED');
                    setTimeout(wait => {
                        return findAll(i + 1, arr, stocks, cb);
                    }, 500)
                }
                else {
                    console.log(arr[i] + ' ADDED')
                    cb(stocks);
                }
            }
            else {
                setTimeout(wait => {
                    return findAll(i, arr, stocks, cb);
                }, 5000)
            }
        })
        .catch(err => {
            return findAll(i, arr, stocks, cb);
        })
}


const run = () => {
    mongoose
        .connect("mongodb+srv://testuser:" + process.env.MONGO_PASS + "@cluster0.ebrke3f.mongodb.net/investa?retryWrites=true&w=majority")
        .then(() => {
            Stock.find()
                .then(stocks => {
                    const arr = getStocks(stocks);
                    let stock = [];
                    findAll(0, arr, stock, result => {
                            Stock.updateHistorical(stocks, result);
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
