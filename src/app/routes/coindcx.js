const coinDcxController = require('../controllers/CoinDcxController');

module.exports = function (app, Router) {

	const router = new Router({
		prefix: '/coindcx'
	});

	router.get('/getMarketDetails/', coinDcxController.getMarketDetails);
	router.get('/', coinDcxController.getChartDetails);

	app.use(router.routes()).use(router.allowedMethods());

};


