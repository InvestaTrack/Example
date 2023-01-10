const yahooFinance = require('yahoo-finance2').default;
yahooFinance.setGlobalConfig({ queue: { concurrency: Infinity } });




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

const getHistoryData = (stock, query, cb) => {
    fetchData (stock, query)
    .then(result => {
        cb (result);
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports = getHistoryData;