const moment = require('moment');
const TradeCollection = require('./schema/trade.schema.js');
const TradeRawCollection = require('./schema/traderaw.schema.js');

class CoinDcx {

	async getTrade(trade) {
		//store raw data in sec
		await TradeRawCollection.findOneAndUpdate({market: trade.market, timestamp: trade.timestamp}, trade, {
		  new: true,
		  upsert: true // Make this update into an upsert
		}).then(res => {

		}).catch(err => {
			console.log(err);
		});

		//TO DO: (in progress) Start Logic to store data in redis with minute wise candle data while fetching data
		

		//Store data in mongo
		const trade_timestamp = moment((trade.timestamp)*1000).format('YYYY_mm_D_hh_mm');
		trade.trade_timestamp = trade_timestamp;
	
		let redKey = await cache.get(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_minute'], timestamp: trade_timestamp, market: trade.market});
		if(!redKey){
			// console.log("checking in mongo");
			await TradeCollection.find({market: trade.market, trade_timestamp: trade_timestamp}).select({ "__V": 0, "_id": 0}).then (res => {
			//data found 
				if(res.length){

					//key is miss in redis
					redKey = res[0];
				}
			});
		} else {
			// found in redis
			redKey = JSON.parse(redKey);
		}

		if(redKey){
			//has previous data, check and update data of high, low, last_price
			trade.high = redKey.high > trade.high ? redKey.high : trade.high;
			trade.low = redKey.low > trade.low ? redKey.low : trade.low;
			trade.close = redKey.close > trade.last_price ? redKey.close : trade.last_price;
			trade.open = redKey.open;

		} else {
			//new data
			trade.open = trade.last_price;
			trade.close = trade.last_price;
			// trade.timestamp = trade.timestamp * 1000;
		}
			
		//update or store in mongo
		await TradeCollection.findOneAndUpdate({market: trade.market, trade_timestamp: trade_timestamp}, trade, {
		  new: true,
		  upsert: true // Make this update into an upsert
		}).then(res => {

		});

		//update redis
		await cache.set(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_minute'], timestamp: trade_timestamp, market: trade.market}, JSON.stringify(trade), config.expireStickType['one_minute'] * 60);
		
		//TO DO: (in progress)  Logic to store data in redis with minute wise candle data


		// store data in redis for stick type with expiry as per config

		




	}

	//set candle data in redis
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

