const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    sMoney: {
        type: Number,
        require: true
    },
    cMoney: {
        type: Number,
        require: true
    },
    currentTotal: {
        type: Number,
        require: true
    },
    total: {
        type: Number,
        require: true
    },
    stocks: 
        [
            {
                stockID: {
                    type: Schema.Types.ObjectId,
                    ref: 'Stock',
                    required: true
                },
                quantity: {type: Number, required: true},
                pPrice: {type: Number, reuired: true},
                pTotal: {type: Number, reuired: true}
            }
        ],
        gains: {
            type: Number,
            required: true
        }
});

    userSchema.methods.addMoney = function(amount) {
        this.cMoney = this.cMoney + amount;
        this.sMoney = this.sMoney + amount;
        this.cMoney = parseFloat(this.cMoney);
        this.sMoney = parseFloat(this.sMoney);

        return this.save();
    }

    userSchema.methods.reset = function(money){
        this.sMoney = money;
        this.cMoney = money;
        this.gains = 0;
        this.stocks = [];
        this.total = 0;
        this.currentTotal = 0;

        return this.save();
    }

    userSchema.methods.addMoney = function (money){
        this.sMoney += money;
        this.cMoney += money;

        return this.save();
    }

    userSchema.methods.buyStock = function (stock, quantity){
  
        const StockIndex = this.stocks.findIndex(cp => {
            return cp.stockID.toString() === stock._id.toString();
        });
        
        quantity = parseFloat(quantity);
        if (isNaN(quantity)){
            console.log('NOT A NUMBER');
            return Promise.resolve(0);
        }

        if (quantity <=0){
            console.log('CANT BUY ZERO');
            return Promise.resolve(0);
        }
        let newQuantity = quantity;
        let newPrice = stock.price;
        const updatedStock = [...this.stocks];

        if((stock.price * quantity) > this.cMoney){
            console.log('TOO MUCH');
            return Promise.resolve(0);
        }
    
        if (StockIndex >= 0) {
            newQuantity = this.stocks[StockIndex].quantity + quantity;
            updatedStock[StockIndex].quantity = newQuantity;
            updatedStock[StockIndex].pPrice = newPrice;
            updatedStock[StockIndex].pTotal += (newPrice * quantity);
        } else {
            updatedStock.push({
                stockID: stock._id,
                quantity: newQuantity,
                pPrice: newPrice,
                pTotal: newPrice * newQuantity
            });
        }
        this.cMoney -= (newPrice * quantity);
        this.total += (newPrice * quantity);
        this.stocks = updatedStock;
        return this.save();
    }

    userSchema.methods.sellStock = function(stock, qty, cb){
                if (!this.gains){
                    console.log('RAN');
                    this.gains = 0;
                }
                let count = 0;
                let stoc1 = stock;
                qty = parseFloat(qty);
                if (isNaN(qty)){
                    console.log('NOT A NUMBER');
                    return cb();
                }
    
                this.populate('stocks.stockID')
                .then(user =>{
                    let stoc = user.stocks;
                    const StockIndex = user.stocks.findIndex(cp => {
                        return cp.stockID._id == stoc1;
                    });

                    if (user.stocks[StockIndex].quantity < qty){
                        console.log('CAN"T SELL THAT MUCH');
                        return cb();
                    }

                    if(qty <= 0){
                        console.log('ZERO');
                        return cb();
                    }

                    stoc = user.stocks[StockIndex];

                    if (qty === user.stocks[StockIndex].quantity){
                        this.cMoney += (stoc.stockID.price *  user.stocks[StockIndex].quantity);
                        this.total -= (stoc.stockID.price *  user.stocks[StockIndex].quantity);
                        this.currentTotal -= (stoc.stockID.price *  user.stocks[StockIndex].quantity);
                        this.gains += (stoc.stockID.price - user.stocks[StockIndex].pPrice) * qty;
                        this.stocks.splice(StockIndex, 1);
                    }
                    
                    else{
                        this.total -= (user.stocks[StockIndex].pPrice * qty);
                        this.currentTotal -= (stoc.stockID.price * qty);
                        this.cMoney += (stoc.stockID.price * qty);
                        this.gains += (stoc.stockID.price - user.stocks[StockIndex].pPrice) * qty;
                        this.stocks[StockIndex].quantity -= qty;
                        this.stocks[StockIndex].pTotal = user.stocks[StockIndex].pPrice * user.stocks[StockIndex].quantity;

                    }
                
                    if (user.stocks.length === 0){
                        this.gains = this.cMoney - this.sMoney;
                        this.total = 0;
                        this.currentTotal = 0;
                        console.log('RUNNERBOI');

                    }
                    return this.save()
                    .then(result => {
                        cb(result);
                    })
                    .catch(err =>{
                        console.log(err);
                    })
                })
                .catch(err =>{
                    console.log(err);
                })
                
                // this.stocks.forEach(s => {
                //     if (s.name === stock) {
                //         if (qty > s.quantity || qty === 0 || !qty) {
                //             cb();
                //             return;
                //         }
                //         this.cMoney = this.cMoney + (m * qty);
                //         this.total -= (qty * parseFloat(s.price));
                //         this.gains += (m - s.price) * qty;
                //         this.currentTotal -= (qty * s.currentPrice);
                //         if (qty === s.quantity) {
                //             this.stocks.splice(count, 1);
                //             if (this.stocks.length === 0) {
                //                 this.total = 0;
                //             }
                //         }
                //         else {
                //             s.quantity = s.quantity - qty;
                //             s.PurchasedValue = s.quantity * parseFloat(s.price);
                //             s.PurchasedValue = parseFloat(s.PurchasedValue);
                //             s.currentValue = s.quantity * m;
                //             s.currentValue = parseFloat(s.currentValue);
                //         }
                //     }
                //     count++;
                // })
            }


module.exports = mongoose.model('User', userSchema);
    


// const Mongo = require('mongodb');
// const getDb = require('../util/database').getDb;
// const stockPrice = require('yahoo-stock-prices')

// class User {
    
//     constructor(email, sMoney, cMoney, total, stocks, gains, currentTotal) {
//         this.email = email;
//         this.sMoney = sMoney;
//         this.cMoney = cMoney;
//         this.total = total;
//         this.stocks = stocks;
//         this.gains = gains;
//         this.currentTotal = currentTotal;
//     }

//     getEmail(){
//         return this.email;
//     }

//     save() {
//         const db = getDb();
//         const coll = db.collection('users');
//         return coll.insertOne(this)
//             .then(result => {
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     static fetchAll(cb) {
//         const db = getDb();
//         return db.collection('users').find().toArray()
//             .then(users => {
//                 cb(users);
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
//     static findByEmail(userEmail) {
//         const db = getDb();
//         const coll = db.collection('users');

//         return coll.find({ email: userEmail })
//             .next()
//             .then(user => {
//                 return user;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     static BuyStock(name, quantity, cb) {
//         getSymbol(name)
//             .then(n => {
//                 getPrice(n)
//                     .then(p => {
//                         const test = p * quantity;
//                         if (p) {
//                             if (!isNaN(test)) {
//                                 const stock = {
//                                     name: n,
//                                     price: p,
//                                     quantity: parseFloat(quantity),
//                                     PurchasedValue: parseFloat(p * quantity),
//                                     currentPrice: p,
//                                     currentValue: parseFloat(p * quantity)
//                                 }
//                                 cb(stock);
//                             }
//                             else {
//                                 cb();
//                             }
//                         }
//                         else {
//                             cb();
//                         }
//                     })
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }

//     //Updates all MONGO DB end after buying stock
//     update(stock) {
//         const db = getDb();
//         const coll = db.collection('users');
//         let check = false;
//         stock.price = parseFloat(stock.price);
//         stock.currentPrice = parseFloat(stock.currentPrice);
//         stock.PurchasedValue = parseFloat(stock.PurchasedValue);
//         stock.currentValue = parseFloat(stock.currentValue);
//         let updatedStock = this.stocks;
//         this.stocks.forEach(stocks => {
//             if (stock.name === stocks.name) {
//                 check = true;
//                 stocks.quantity += + stock.quantity;
//                 stocks.PurchasedValue += (stock.PurchasedValue);
//                 stocks.currentValue += (stock.PurchasedValue);
//                 updatedStock = this.stocks;
//             }
//         })
//         if (this.cMoney - (stock.price * stock.quantity) < 0) {
//             console.log('Cannot Buy Stock');
//         }
//         else {
//             this.cMoney = this.cMoney - (stock.PurchasedValue);
//             this.total = this.total + (stock.PurchasedValue);
//             this.currentTotal = this.currentTotal + (stock.PurchasedValue);
//             if (check === true) {
//                 this.stocks = updatedStock;
//             }
//             else {
//                 this.stocks.push({ ...stock });
//             }
//         }
//         this.total = parseFloat(this.total);
//         this.cMoney = parseFloat(this.cMoney);
//         return coll.updateOne(
//             { email: 'coulten.davis23@gmail.com' },
//             {
//                 $set: {
//                     stocks: this.stocks,
//                     total: this.total,
//                     cMoney: this.cMoney,
//                     currentTotal: this.currentTotal
//                 }
//             }
//         )
//             .then(result => {
//                 console.log('DONE');
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }
//     sellStock(stock, m, qty, gain, cb) {
//         if (!this.gains){
//             console.log('RAN');
//             this.gains = 0;
//         }
//         let count = 0;
//         qty = parseFloat(qty);
//         m = parseFloat(m);
//         this.stocks.forEach(s => {
//             if (s.name === stock) {
//                 if (qty > s.quantity || qty === 0 || !qty) {
//                     cb();
//                     return;
//                 }
//                 this.cMoney = this.cMoney + (m * qty);
//                 this.total -= (qty * parseFloat(s.price));
//                 this.gains += (m - s.price) * qty;
//                 this.currentTotal -= (qty * s.currentPrice);
//                 if (qty === s.quantity) {
//                     this.stocks.splice(count, 1);
//                     if (this.stocks.length === 0) {
//                         this.total = 0;
//                     }
//                 }
//                 else {
//                     s.quantity = s.quantity - qty;
//                     s.PurchasedValue = s.quantity * parseFloat(s.price);
//                     s.PurchasedValue = parseFloat(s.PurchasedValue);
//                     s.currentValue = s.quantity * m;
//                     s.currentValue = parseFloat(s.currentValue);
//                 }
//             }
//             count++;
//         })

//         this.total = parseFloat(this.total);
//         this.currentTotal = parseFloat(this.currentTotal);
//         this.cMoney = parseFloat(this.cMoney);
//         const db = getDb();
//         const coll = db.collection('users');
//         return coll.updateOne(
//             { email: 'coulten.davis23@gmail.com' },
//             {
//                 $set: {
//                     stocks: this.stocks,
//                     total: this.total,
//                     cMoney: this.cMoney,
//                     gains: this.gains
//                 }
//             }
//         )
//             .then(result => {
//                 cb(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             })

//     }

//     GetCurrent(name, cb) {
//         getPrice(name)
//             .then(p => {
//                 const price = p;
//                 cb(price);
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }

//     addMoney(amount) {
//         this.cMoney = this.cMoney + amount;
//         this.sMoney = this.sMoney + amount;
//         this.cMoney = parseFloat(this.cMoney);
//         this.sMoney = parseFloat(this.sMoney);

//         const db = getDb();
//         const coll = db.collection('users');
//         return coll.updateOne(
//             { email: 'coulten.davis23@gmail.com' },
//             {
//                 $set: {
//                     cMoney: this.cMoney,
//                     sMoney: this.sMoney
//                 }
//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     set(){
//         let updatedC = this.cMoney;
//         this.total = 0;
//         this.currentTotal = 0;
//         this.stocks.forEach(stock =>{
//             this.total += stock.price * stock.quantity;
//             this.currentTotal += stock.currentPrice * stock.quantity;
//         })
//         if (this.total !=0){
//             updatedC = this.sMoney - this.total;;
//             this.cMoney = updatedC;
//         }
//         else if (this.gains){
//             updatedC = this.sMoney + this.gains
//             this.cMoney = updatedC;
//         }
//         else{
//             updatedC = this.sMoney;
//             this.cMoney = updatedC;
//         }
//         const db = getDb();
//         const coll = db.collection('users');
//         return coll.updateOne(
//             { email: 'coulten.davis23@gmail.com' },
//             {
//                 $set: {
//                     total: this.total,
//                     cMoney: this.cMoney,
//                     stocks: this.stocks,
//                     currentTotal: this.currentTotal
//                 }
//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     reset(money) {
//         this.cMoney = money;
//         this.sMoney = money;
//         this.total = 0;
//         this.currentTotal = 0;
//         this.stocks = [];
//         this.gains = null;

//         const db = getDb();
//         const coll = db.collection('users');
//         return coll.updateOne(
//             { email: 'coulten.davis23@gmail.com' },
//             {
//                 $set: {
//                     stocks: this.stocks,
//                     cMoney: this.cMoney,
//                     sMoney: this.sMoney,
//                     total: this.total,
//                     gains: this.gains,
//                     currentTotal: this.currentTotal
//                 }
//             }
//         )
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//     }
// }



// module.exports = User;