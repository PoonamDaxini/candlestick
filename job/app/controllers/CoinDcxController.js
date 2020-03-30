const request = require('superagent');
const moment = require('moment');

const CoinDcx = require('../models/CoinDcx').getInstance();

exports.getTrade = async(ctx) => {
	await request.get(config.coindcxBaseURL + config.coindcxTradeURL).then(res => {
		for(let trade of res.body) {
			CoinDcx.getTrade(trade);
		}
	}).catch(err =>{
		console.log(err);
	});

	ctx.body = 	true;
}

//get marketdetails -> pair is used in few other apis / socket channel joining
exports.getMarketDetails = async(ctx) => {
	ctx.body = await request.get(config.coindcxBaseURL + config.coindcxMarketDetailsURL).then(res => {
		return res.body;
	}).catch(err =>{
		console.log(err);
	});

};

//create chart

// async function setRedis(){
// 	console.log('called...');
// 	await CoinDcx.setOneMinuteRedisKey().then(res =>{
// 	});

// };
exports.getChartDetails = async(ctx) => {
	console.log("here....");
	const market = 'BTCUSDT';
	const starttime = 1585408978;
	ctx.body = await CoinDcx.getData(market, starttime).catch(err =>{
		console.log(err);
	});


}
exports.getChartData = async(ctx) => {
	// const Chart = require('chart.js');
	// const myChart = new Chart(ctx, {...});
}

