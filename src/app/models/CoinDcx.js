const moment = require('moment');
const TradeCollection = require('./schema/trade.schema.js');
const TradeRawCollection = require('./schema/traderaw.schema.js');

class CoinDcx {

	async getDataRedis(market, starttime, endtime, stick=1) {
		// TODO: Fetch data from redis based on range given and return it
		// Fallback should be from mongo
	}

	async getData(market, starttime, endtime, stick=1) {
		//divide time in chunks of stick(in minutes)
		let start = moment(starttime*1000).format('X');
		let slices = {};
		let count = 0;
		console.log(start, endtime);
		while (endtime >= start) {
		    
		    start = moment(start*1000).add(stick*60, 'seconds').format('X');

		    slices[count] = start;
		    count++;
		}

		let data = [];
		let prev_time = moment(starttime*1000).format('X');

		let details;

		for (const endTime of Object.values(slices)) {
			details = await TradeRawCollection.aggregate([
			   	{
			   		$match: {market: market, timestamp: {$gte: Number(prev_time), $lt: Number(endTime)}}
			   		// $match: {market: 'BTCUSDT',timestamp: {$gte: 1585491658, $lt:1585491718}}
			   	},
			    {
			       $group:
			         {
			           _id: "$market",
			           high: { $max: "$high" },
			           low: { $min: "$low" },
			           open: {$first: "$last_price"},
			           close: {$last: "$last_price"}

			       }
			    }
			   ]).then(res => {
			   	if(res.length){
				   	res[0].timestamp = Number(prev_time);
				   	data.push(res[0]);
			   	}
			
			   });
			   prev_time = endTime;
		}
		return data;
		//TO DO : store in redis , fetch data from redis and return
			
	
			// return await TradeCollection.find({market: market, timestamp: { $gte : starttime}}).select({ "high": 1, "low": 1, "open": 1, "volume":1, "timestamp":1, "trade_timestamp":1,"last_price": 1, "_id": 0, "close":1}).then (res => {
			// 	return res;				
				
			// });
	}
	async setOneMinuteRedisKey(trade) {
		const current_time = moment().format('X');
		const prev_time = moment().subtract(60, 'seconds').format('X'); //1 min
		const min_time = moment().format('YYYY_mm_D_hh_mm');

		console.log(prev_time, current_time, min_time);
		const redKey = await cache.get(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_minute'], timestamp: trade.timestamp, market: trade.market});
			if(redKey){
				
			} else {
		await TradeCollection.aggregate([
			   	{
			   		$match: {timestamp: {$gte: prev_time, $lt: current_time}}
			   	},
			    {
			       $group:
			         {
			           _id: "$market",
			           high: { $max: "$high" },
			           low: { $min: "$low" },
			           open: {$first: "$last_price"},
			           close: {$last: "$last_price"},
			       }
			    }
			   ]).then(res => {
			   	console.log(res);
			   		for(let marketData of res) {
						cache.set(cache.keys.CHART_DETAILS, {
							stickType: config.stickType['one_minute'],
							timestamp: min_time,
							market: marketData.market
						}, marketData);
					}
			   });
			}
	}

}
module.exports = CoinDcx;
module.exports.getInstance = () => new CoinDcx();

