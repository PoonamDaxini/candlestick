global.config  = require('config');

//********* Config Global Function ************//
const fs = require('fs'),
    path = require('path');

global.Log = require('../app/helpers/logging');

//********* Global Error Handler ************//
const errorCodes = require('./errorCodes').getInstance();



//const Logger = require('./lib/log');
//global.objLogger = new Logger(config.get('rabbitMQ.debug'), "coindcx_trade");


//********* Global mongodb object **********//
//********* Global Mongoose Client ************//
const mongoose = require('mongoose');
//const mongooseLog = Log.createLog({
//    'name': 'mongo'
//});

let dbURI, options = {server:{auto_reconnect:true, socketOptions: {
  socketTimeoutMS: 0,
  connectionTimeout: 0
}}};
if(process.env.NODE_ENV === 'production') {
    const hostPort = config.db.mongo.host + ':' + config.db.mongo.port + ',' + config.db.mongo.host1 + ':' + config.db.mongo.port1 + ',' +  config.db.mongo.host2 + ':' + config.db.mongo.port2 + ',' +  config.db.mongo.host3 + ':' + config.db.mongo.port3 + ',' +  config.db.mongo.host4 + ':' + config.db.mongo.port4;
  dbURI = 'mongodb://' + config.db.mongo.user + ':' + config.db.mongo.password + '@' + hostPort + '/' + config.db.mongo.db + '?authSource=admin';
  options = {
    db: {
         readPreference: {
             preference: 'secondaryPreferred'
         }
     },
    replset: {
      rs_name: config.db.mongo.replset,
      auto_reconnect:true,
      poolSize: JSON.parse(config.db.mongo.poolSize)
    },
    server: {
      auto_reconnect:true,
      poolSize: JSON.parse(config.db.mongo.poolSize)
    }
  };
}else{
  dbURI = 'mongodb://' + config.db.mongo.host + ':' + config.db.mongo.port + '/' + config.db.mongo.database ;
}

global.mongoose = mongoose.connect(dbURI, { useNewUrlParser: true, useFindAndModify: false });

let db = mongoose.connection;
db.setMaxListeners(JSON.parse(config.db.mongo.setMaxListeners));
db.on('connecting', function() {
//  mongooseLog.info({'action':'connecting to MongoDB...'}, config.db.mongo.host );
	console.log("connecting mongodb ...."+ config.db.mongo.host);
});

db.on('error', function(error) {
//  mongooseLog.info({'action':'Error in MongoDb connection: '}, error );
  console.log("Error in mongobd connection: " + error);
	mongoose.disconnect();
});
db.on('connected', function() {
//  mongooseLog.info({'action':'MongoDB connected! '}, config.db.mongo.host );
	console.log("MongoDB connected." + config.db.mongo.host);
});
db.once('open', function() {
//  mongooseLog.info({'action':'MongoDB connection opened! '}, config.db.mongo.host );
	console.log("MongoDB connection opened!"+ config.db.mongo.host);
  // require('../app/models/schema/trade.schema');
});
db.on('reconnected', function () {
//  mongooseLog.info({'action':'MongoDB reconnected! '}, config.db.mongo.host );
    console.log("MongoDB reconnected!" + config.db.mongo.host);
});
db.on('disconnected', function() {
//  mongooseLog.info({'action':'MongoDB disconnected! '}, config.db.mongo.host );
  	console.log("MongoDB disconnected!" + config.db.mongo.host);
	global.mongoose = mongoose.connect(dbURI, options);
});

console.log("mongoose....start");
global.Schema = mongoose.Schema;
// global.mongooseModel = mongoose.mo
console.log(global.mongoose);
console.log("mongoose....end");

//********* Global Redis Client ************//
global.redis = new(require('ioredis'))(
    config.db.redis.port,
    config.db.redis.host
);

// global.cacheKeys = require('./lib/cache').getInstance(config.db.redis);
global.cache = require('./lib/cache').getInstance(config.db.redis);



//***************Global Error Object **********************//
global.error = function(type, errorCode, stackTrace, details, code, fields) {
    var err;
    err = (typeof global[type] !== 'undefined') ? new global[type] : new GenericError;

    if (code && typeof code === 'number') {
        err.code = code;
    }
    if (fields && typeof fields === 'object') {
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) {
                err[key] = fields[key];
            }
        }
    }
    let error = {};
    if (errorCode) {
        error.code = errorCode;
        error.details = details || {};
        error.stackTrace = stackTrace || {};
        co(function*() {
            err.message = yield errorCodes.getErrorMessage(errorCode);
            error.message = err.message;
            err.error = error;
        })
    }
    // console.log(err);
    throw err;
};

