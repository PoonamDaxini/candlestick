const coinDcxController = require('../controllers/CoinDcxController');

module.exports = function (app, Router) {

	const router = new Router({
		prefix: '/coindcx'
	});

	router.get('/', coinDcxController.getTrade);
	router.get('/getMarketDetails/', coinDcxController.getMarketDetails);

	app.use(router.routes()).use(router.allowedMethods());

};


