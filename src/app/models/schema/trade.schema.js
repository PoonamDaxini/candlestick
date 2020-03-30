
// var Schema = mongoose.Schema;
const mongoose = require('mongoose');
const tradeSchema = mongoose.Schema({
	market : {type:String},
	change_24_hour : {type:Number},
	high: {type:Number},
	low: {type:Number},
	volume: {type:Number},
	close: {type:Number},
	last_price: {type:Number},
	open: {type:Number},
	bid: {type:Number},
	ask: {type:Number},
	timestamp: {type:Number},
	trade_timestamp: {type:String}
});

// const mongoose = global.mongoose;

module.exports = mongoose.model('Trade', tradeSchema);

