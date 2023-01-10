const control = require('../controllers/page');

const express = require('express');
const { Router } = require('express');
const routes = express.Router();

routes.get('/', control.getHome);

routes.get('/createUser', control.getCreate);

routes.get('/buystocks', control.getBuy);

routes.get('/addmoney', control.getAddMoney);

routes.get('/sellstock/:stockname', control.sellStock);

routes.get('/reset', control.getReset);

routes.post('/reset', control.postReset);

routes.post('/buystocks', control.postBuy);

routes.post('/sellstock', control.postSell);

routes.post('/addmoney', control.postAddMoney);

routes.post('/', control.postCreate);

module.exports = routes;