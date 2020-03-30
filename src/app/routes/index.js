const testController = require('../controllers/TestController');
module.exports = function (app, Router) {

	const router = new Router();
	router.get('/', testController.check);
	router.get('/data-candles', testController.datacandles);
	router.post('/', testController.check);
	app.use(router.routes()).use(router.allowedMethods());
};

