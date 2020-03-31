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
		const unix_timestamp = (trade.timestamp)*1000;
		const trade_timestamp = moment(unix_timestamp).format('YYYY_MM_DD_hh_mm');
		trade.trade_timestamp = trade_timestamp;
	
		//for a minute stick logic
		let redKey = await cache.get(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_minute'], timestamp: trade_timestamp, market: trade.market});
		// let redKey_15 minute = await cache.get(cache.keys.CHART_DETAILS, {stickType: config.stickType['fifteen_minute'], timestamp: trade_timestamp, market: trade.market});
		if(!redKey){
			// console.log("checking in mongo");
			await TradeCollection.find({
				market: trade.market, 
				trade_timestamp: trade_timestamp
			}).select({ 
				"__V": 0, "_id": 0
			}).then (res => {
			//data found 
				if(res.length){

					//key is miss in redis
					redKey = res[0];
				}
			}).catch(err => {
				console.log(err);
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

		}).catch(err => {
			console.log(err);
		});

		//update redis
		await cache.set(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_minute'], timestamp: trade_timestamp, market: trade.market}, JSON.stringify(trade), config.expireStickType['one_minute'] * 60);
		//Minute stick logic ends

		//hour key
		await this.setOneHourRedisKey(trade, unix_timestamp).then(res => {}).catch(err => {
			console.log(err);
		});

		//15 minutes key
		await this.setFifteenMinutesRedisKey(trade, unix_timestamp).then(res => {}).catch(err => {
			console.log(err);
		});

		//TO DO: (in progress)  Logic to store data in redis with minute wise candle data


		// store data in redis for stick type with expiry as per config

		




	}

	async setOneHourRedisKey(trade, unix_timestamp) {
		const trade_timestamp_in_hr = moment(unix_timestamp).format('YYYY_MM_DD_hh');

		let redKey = await cache.get(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_hour'], timestamp: trade_timestamp_in_hr, market: trade.market});
		if(redKey) {
			redKey = JSON.parse(redKey);
			//existing key update
			trade.high = redKey.high > trade.high ? redKey.high : trade.high;
			trade.low = redKey.low > trade.low ? redKey.low : trade.low;
			trade.close = redKey.close > trade.last_price ? redKey.close : trade.last_price;
			trade.open = redKey.open;

		} else {
			//new or miss key
			trade.open = trade.last_price;
			trade.close = trade.last_price;
		}
		
		await cache.set(cache.keys.CHART_DETAILS, {stickType: config.stickType['one_hour'], timestamp: trade_timestamp_in_hr, market: trade.market}, JSON.stringify(trade), config.expireStickType['one_hour'] * 60);

	}

	async setFifteenMinutesRedisKey(trade, unix_timestamp) {
		const timestamp_minute = moment(unix_timestamp).format('mm');
		let trade_timestamp_in_fifteen_minutes;

		if(timestamp_minute < 15 && timestamp_minute >= "00"){
			trade_timestamp_in_fifteen_minutes = (moment(unix_timestamp).format('YYYY_MM_DD_hh') ) + "_00";
		} else if(timestamp_minute < 30 && timestamp_minute >= 15){
			trade_timestamp_in_fifteen_minutes = (moment(unix_timestamp).format('YYYY_MM_DD_hh') ) + "_15";
		} else if(timestamp_minute < 45 && timestamp_minute >= 30){
			trade_timestamp_in_fifteen_minutes = (moment(unix_timestamp).format('YYYY_MM_DD_hh') ) + "_30";
		} else if(timestamp_minute < 60 && timestamp_minute >= 45){
			trade_timestamp_in_fifteen_minutes = (moment(unix_timestamp).format('YYYY_MM_DD_hh') ) + "_45";
		}

		let redKey = await cache.get(cache.keys.CHART_DETAILS, {stickType: config.stickType['fifteen_minute'], timestamp: trade_timestamp_in_fifteen_minutes, market: trade.market});
		if(redKey) {
			//existing key update
			redKey = JSON.parse(redKey);

			trade.high = redKey.high > trade.high ? redKey.high : trade.high;
			trade.low = redKey.low > trade.low ? redKey.low : trade.low;
			trade.close = redKey.close > trade.last_price ? redKey.close : trade.last_price;
			trade.open = redKey.open;

		} else {
			//new or miss key

			trade.open = trade.last_price;
			trade.close = trade.last_price;
		}
		//new key
		await cache.set(cache.keys.CHART_DETAILS, {stickType: config.stickType['fifteen_minute'], timestamp: trade_timestamp_in_fifteen_minutes, market: trade.market}, JSON.stringify(trade), config.expireStickType['fifteen_minute'] * 60);

	}


	//set candle data in redis
	async setOneMinuteRedisKey(trade) {
		const current_time = moment().format('X');
		const prev_time = moment().subtract(60, 'seconds').format('X'); //1 min
		const min_time = moment().format('YYYY_MM_D_hh_mm');

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

