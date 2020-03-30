const Router = require('koa-router');


module.exports = function(app){
	require('./routes/index')(app, Router);
	require('./routes/coindcx')(app, Router);
};
