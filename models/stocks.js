const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
    } ,
    history:[]
});

stockSchema.statics.updateStocks = function (stocks, current) {
    let count = 0;
   
    stocks.forEach(stock => {
        stock.price = current[count].regularMarketPrice;
        count++;

    })

    count = 0;

    stocks.forEach (stock => {
        this[count] = stock;
        this[count].save();
        count++;
    })
    console.log('UPDATED');
}

stockSchema.statics.updateHistorical = function (stocks, current) {
    let count = 0;
   
    stocks.forEach(stock => {
        stock.history = current[count];
        count++;

    })

    count = 0;

    stocks.forEach (stock => {
        this[count] = stock;
        this[count].save();
        count++;
    })
    console.log('UPDATED');
    return;
}

module.exports = mongoose.model('Stock', stockSchema);