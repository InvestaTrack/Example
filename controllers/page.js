const User = require('../models/user');
const Stock = require('../models/stocks');
const getDb = require('../util/database').getDb;
const getStock = require('../util/getPrice');
const getHistory = require('../util/getHistoryData');

exports.getHome = (req, res, next) => {
    req.user.populate('stocks.stockID')
        .then(user => {
            let cTotal = 0;
            let total = 0;
            user.stocks.forEach(stock => {
                cTotal += stock.stockID.price * stock.quantity;
                total += stock.pPrice * stock.quantity
            })
            user.currentTotal = cTotal;
            user.total = total;
            user.save();
            res.render('main/main2.ejs', {
                pageTitle: 'Home',
                user: user,
                stocks: user.stocks,
                path: '/',
                page: 'main',
                total: 0
            })
        })
};

exports.getCreate = (req, res, next) => {
    res.render('createUser', {
        pageTitle: 'Home',
        path: '/'
    });
};

exports.postCreate = (req, res, next) => {
    const email = req.body.email;
    const sMoney = req.body.sMoney;
    const user = new User(email, sMoney, sMoney);
    user.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
};

exports.getBuy = (req, res, next) => {
    res.render('main/buystocks', {
        pageTitle: 'Buy Stocks',
        path: '/buystocks'
    });
};

exports.postBuy = (req, res, next) => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let query = { period1: '1899-09-10', period2: today, interval: '1d' };

    setTimeout(() => {
        if (!res.headersSent) {
            res.redirect('/buystocks')
        }
    }, "8000");
    const n = req.body.stock;
    const q = req.body.qty;

    Stock
        .findOne({ name: n })
        .then(stock => {
            if (stock) {
                req.user.buyStock(stock, q)
                    .then(() => {
                        res.redirect('/');
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
            else {
                getStock(n, stocks => {
                    getHistory(n, query, result => {
                        if (stocks) {
                            const st = new Stock(
                                {
                                    price: stocks.price,
                                    name: stocks.name,
                                    userID: req.user._id,
                                    history: result
                                });

                            st.save()
                                .then(() => {
                                    Stock
                                        .findOne({ name: n })
                                        .then(stock => {
                                            if (stock) {
                                                req.user.buyStock(stock, q)
                                                    .then(() => {
                                                        res.redirect('/');
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                            }
                                        })
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }
                        else if (!res.headersSent) {
                            res.redirect('/');
                        }


                    })
                })
            }
        })
        .catch(err => {
            console.log(err);
        });


    // if (Stock.find({name: stock.name})){
    //     console.log (Stock.find({name: stock.name}))
    //     console.log('FOUND');
    //     res.redirect('/');
    // }

};

exports.sellStock = (req, res, next) => {
    const stockName = req.params.stockname;
    req.user.populate('stocks.stockID')
        .then(user => {
            let stoc;
            user.stocks.forEach(stock => {
                if (stock.stockID.name === stockName) {
                    stoc = stock;
                }
            })
            res.render('sellstock', {
                pageTitle: 'Sell',
                user: user,
                stock: stoc,
                path: '/sellstock'
            })
        })
}

exports.postSell = (req, res, next) => {
    const stock = req.body.stock;
    const quantity = req.body.quantity;
    req.user.sellStock(stock, quantity, result => {
        res.redirect('/');
    });
}

exports.getAddMoney = (req, res, next) => {
    res.render('addmoney', {
        path: '/addmoney',
        pageTitle: 'Add Money'
    })
}

exports.postAddMoney = (req, res, next) => {
    req.user.addMoney(parseFloat(req.body.money))
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
}

exports.getReset = (req, res, next) => {
    res.render('reset', {
        path: '/reset',
        pageTitle: 'Reset'
    })
}

exports.postReset = (req, res, next) => {
    const money = parseFloat(req.body.money);
    req.user.reset(money)
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
}

exports.get404 = (req, res, next) => {
    res.status(404).redirect('/');
};