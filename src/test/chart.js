// const mongoose = require('mongoose');
// const config = require('config');
const app = require('../server.js');
// require('../bootstrap/globals');

const request = require('superagent');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = require('should');
const moment = require('moment');

const TradeRawCollection = require('../app/models/schema/traderaw.schema.js');

const data = [{
		"market" : "SNTETH",
	    "trade_timestamp" : "2020_51_29_07_51",
	    "ask" : 0.00014952,
	    "bid" : 0.00014834,
	    "change_24_hour" : 26.913,
	    "last_price" : 0.00014951,
	    "high" : 0.0001532,
	    "low" : 0.00011534,
	    "open" : 0.00014956,
	    "timestamp" : 1585491718,
	    "volume" : 3486.39598044
	},
	{
		"market" : "SNTETH",
	    "trade_timestamp" : "2020_51_29_07_51",
	    "ask" : 0.00014950,
	    "bid" : 0.00014844,
	    "change_24_hour" : 26.913,
	    "last_price" : 0.00014950,
	    "high" : 0.0001530,
	    "low" : 0.00011524,
	    "open" : 0.00014956,
	    "timestamp" : 1585491719,
	    "volume" : 3486.39598044
	},
	{
		"market" : "SNTETH",
	    "trade_timestamp" : "2020_51_29_07_51",
	    "ask" : 0.00014952,
	    "bid" : 0.00014834,
	    "change_24_hour" : 26.913,
	    "last_price" : 0.00014958,
	    "high" : 0.0001537,
	    "low" : 0.00011533,
	    "open" : 0.00014956,
	    "timestamp" : 1585491658,
	    "volume" : 3486.39598044
	},{
		"market" : "SNTETH",
	    "trade_timestamp" : "2020_51_29_07_51",
	    "ask" : 0.00014952,
	    "bid" : 0.00014834,
	    "change_24_hour" : 26.913,
	    "last_price" : 0.00014959,
	    "high" : 0.0001537,
	    "low" : 0.00011534,
	    "open" : 0.00014956,
	    "timestamp" : 1585491678,
	    "volume" : 3486.39598044
	}, 
	{
		"market" : "SNTETH",
	    "trade_timestamp" : "2020_51_29_14_41",
	    "ask" : 0.00014952,
	    "bid" : 0.00014834,
	    "change_24_hour" : 26.913,
	    "last_price" : 0.00014963,
	    "high" : 0.0001540,
	    "low" : 0.00011512,
	    "open" : 0.00014950,
	    "timestamp" : 1585492878,
	    "volume" : 3486.39598044
	},
	{
		"market" : "SNTETH",
	    "trade_timestamp" : "2020_51_29_14_43",
	    "ask" : 0.00014952,
	    "bid" : 0.00014834,
	    "change_24_hour" : 26.913,
	    "last_price" : 0.00014960,
	    "high" : 0.0001547,
	    "low" : 0.00011502,
	    "open" : 0.00014952,
	    "timestamp" : 1585492998,
	    "volume" : 3486.39598044
	}];

const result_1_m_stick = [
    {
      _id: 'SNTETH',
      high: 0.0001537,
      low: 0.00011533,
      open: 0.00014958,
      close: 0.00014959,
      timestamp: 1585491658
    },
    {
      _id: 'SNTETH',
      high: 0.0001532,
      low: 0.00011524,
      open: 0.00014951,
      close: 0.0001495,
      timestamp: 1585491718
    }
  ];

const result_2_m_stick = [
    {
      _id: 'SNTETH',
      high: 0.0001537,
      low: 0.00011524,
      open: 0.00014951,
      close: 0.00014959,
      timestamp: 1585491658
    }
  ];

const result_15_m_stick =  [
    {
      _id: 'SNTETH',
      high: 0.0001537,
      low: 0.00011524,
      open: 0.00014951,
      close: 0.00014959,
      timestamp: 1585491658
    },
    {
      _id: 'SNTETH',
      high: 0.0001547,
      low: 0.00011502,
      open: 0.00014963,
      close: 0.0001496,
      timestamp: 1585492558
    }
  ];


describe('chartdata testing with mongo', function() {

	beforeEach(function(done) {
	    trade = TradeRawCollection.insertMany(data)
	        .then(() => done());
	});	

	it('Check a market trade single minute stick', async () => {
		await request.get(config.host+":"+config.PORT+'/coindcx?market=SNTETH&startTime=1585491658&endTime=1585491719').then(res => {
                res.body.message.should.match('Success');
                res.body.data.should.be.instanceof(Array);
                res.body.data.should.match(result_1_m_stick);
            }).catch(err => {
            	console.log(err);
            });
    

	});

	it('Check a market trade for two minute stick', async () => {
		await request.get(config.host+":"+config.PORT+'/coindcx?market=SNTETH&startTime=1585491658&endTime=1585491719&stick=2').then(res => {
                res.body.message.should.match('Success');
                res.body.data.should.be.instanceof(Array);
                res.body.data.should.match(result_2_m_stick);
            }).catch(err => {
            	console.log(err);
            });
    

	});

	it('Check a market trade for fifteen minute stick', async () => {
		await request.get(config.host+":"+config.PORT+'/coindcx?market=SNTETH&startTime=1585491658&endTime=&stick=15').then(res => {
                // console.log(res.body);
                res.body.message.should.match('Success');
                res.body.data.should.be.instanceof(Array);
                res.body.data.should.match(result_15_m_stick);
            }).catch(err => {
            	console.log(err);
            });
    

	});


	afterEach(function (done) {
        TradeRawCollection.collection.drop();
        done();
    });


});