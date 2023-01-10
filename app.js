const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const Stock = require('./models/stocks');
const { Server } = require('socket.io')
const io = new Server(server);

const runner = require('./runner');

const error = require('./controllers/page').get404;

const investaRoutes = require('./routes/investa');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));

// app.use((req, res, next)=>{
//     req.user.set()
//     .then(() => {
//         next();
//     })
//     .catch(err => {
//         next();
//         console.log(err);
//     })
// })

// app.use((req, res, next) => {
//     runner.run(req.user.email)
//     next();
//hi hi
// })

app.use((req, res, next) => {
    User.findById('631cc9d556d9e491c196ad3c')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
});

mongoose
    .connect("mongodb+srv://testuser:" + process.env.MONGO_PASS + "@cluster0.ebrke3f.mongodb.net/investa?retryWrites=true&w=majority")
    .then(() => {
        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'Coulten',
                        email: 'coulten.davis23@gmail.com',
                        sMoney: 0,
                        cMoney: 0,
                        total: 0,
                        currentTotal: 0,
                        stocks: [],
                        gains: 0
                    })
                    user.save();
                }
            })

        Stock.watch().on('change', (change) => {
            console.log('Something has changed')
            let stockPrice = change.updateDescription;
            stockPrice = stockPrice.updatedFields;
            stockPrice = stockPrice.price;
            console.log(stockPrice)
            let id = change.documentKey._id;

            io.emit('changes', {price: stockPrice, id: id})
            
        })
        server.listen(3000);

    })

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.use(investaRoutes);
app.use(error);
