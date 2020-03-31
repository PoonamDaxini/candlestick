const request = require('superagent');

// const TradeCollection = require('./models/schema/trade.schema.js');


// setInterval(async () => { 
// 	await request.get(config.host+":"+config.PORT+'/coindcx/')
	
//  }, 1000);


// const moment = require('moment');

// const market = 'BTCINR'
// const current_time = moment().add(1,'days').format('YYYY_MM_DD_hh_mm');
// const prev_time = moment().subtract(60, 'seconds').format('X'); //1 min
// const prev_time_15 = moment().subtract(15*60, 'seconds').format('X'); //15 min
// const min_time = moment().format('YYYY_MM_D_hh_mm');
// console.log(current_time);
// console.log(current_time, prev_time, market, prev_time_15, min_time);


// async function test() {
// 	await TradeCollection.find({market: 'BTCINR', timestamp: {$gte:1585153600, $lt: 1585154136}}).then(res => {
// 		console.log(res);
// 	});
// 	console.log(current_time, prev_time, market, prev_time_15);
// }
// test();


// TradeCollection.aggregate(
//    [
//    	{
//    		$match: {timestamp: {$gte:1585153600, $lt: 1585154136}}
//    	},
//     {
//        $group:
//          {
//            _id: "$market",
//            high: { $max: "$high" },
//            low: { $min: "$low" },
//            open: {$first: "$last_price"},
//            close: {$last: "$last_price"},
//     }
//    ]
// )