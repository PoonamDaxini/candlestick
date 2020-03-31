
// var Schema = mongoose.Schema;
const mongoose = require('mongoose');
const tradeSchema = mongoose.Schema({
	market : {type:String},
	high: {type:Number},
	low: {type:Number},
	volume: {type:Number},
	last_price: {type:Number},
	close: {type:Number},
	open: {type:Number},
	timestamp: {type:Number},
	trade_timestamp: {type:String}
});

// const mongoose = global.mongoose;

module.exports = mongoose.model('Trade', tradeSchema);

