const request = require('superagent');
const moment = require('moment');

const CoinDcx = require('../models/CoinDcx').getInstance();


//get marketdetails -> pair is used in few other apis / socket channel joining
exports.getMarketDetails = async(ctx) => {
	ctx.body = await request.get(config.coindcxBaseURL + config.coindcxMarketDetailsURL).then(res => {
		return res.body;
	})
};

//create chart

// async function setRedis(){
// 	console.log('called...');
// 	await CoinDcx.setOneMinuteRedisKey().then(res =>{
// 	});

// };
exports.getChartDetails = async(ctx) => {
	const query = ctx.query;
	if(query.market) { 
		//stick in minutes, for hr stick = 60

		const stick = query.stick || 1;
		const endTime = query.endTime || moment().format('X');
		const startTime = query.startTime || moment(endTime*1000).subtract(stick*60, 'minutes').format('X');

		// ctx.body = await CoinDcx.getDataRedis(query.market, startTime, endTime, stick);
		ctx.body = await CoinDcx.getData(query.market, startTime, endTime, stick);
	}else{
		ctx.body = "Market is required";
	}
}


exports.getChartData = async(ctx) => {
	// const Chart = require('chart.js');
	// const myChart = new Chart(ctx, {...});
}

