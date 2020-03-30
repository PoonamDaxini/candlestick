const LoggerQueue = require('../../app/helpers/LoggerQueue'),
    rabbitMQ = config.get('rabbitMQ'),
    q = LoggerQueue.getInstance([{ host: rabbitMQ.host, 
            port: rabbitMQ.port}],
            rabbitMQ.vhost, 
            rabbitMQ.user, 
            rabbitMQ.pass).start();
const os = require('os');
const Q = require('q');

class Logger {

    constructor(debugMode, appName){
        this.debugMode = debugMode || false;
        this.appName = appName;
    }

    error(stmt, desc, methodName, errCode, ref) {
        if(typeof ref !== 'object'){
            ref = {};
        }

        if(desc instanceof Error){
            desc = desc.message;
            ref.errStack = desc.stack;
        }

        return q.push(
            "error",
            Object.assign(
                {},
                getBasics(this.appName),
                {
                    stmt: stmt,
                    desc: desc,
                    ec: errCode,
                    met: methodName,
                    ref: ref,
                    ts: new Date().toISOString()
                }
            )
        );
    }

    debug(stmt, desc, methodName, ref){
        if(typeof ref !== 'object'){
            ref = {};
        }

        if(this.debugMode){
            return q.push(
                "info",
                Object.assign(
                    {},
                    getBasics(this.appName),
                    {
                        stmt: stmt,
                        desc: desc,
                        met: methodName,
                        ref: ref,
                        ts: new Date().toISOString()
                    }
                )
            );
        } else {
          return Q();
        }
    }
}

module.exports = Logger;

/**
 * Map the context related information
 *
 * @param ctx
 * @returns {{}}
 */
function getBasics(appName){
    const ctxMap = {};

    ctxMap.host = os.hostname();
    ctxMap.ip = getIP();
    ctxMap.app = appName;

    return ctxMap;
}


/**
 * Returns the ethernet IP address of the system
 * @method getIP
 */
function getIP(){
    const interfaces = os.networkInterfaces();
    let ipAdd;
    for (const ifname in interfaces) {
        if (interfaces.hasOwnProperty(ifname)){
            for (const k2 in interfaces[ifname]) {
                if(interfaces[ifname].hasOwnProperty(k2)){
                    const address = interfaces[ifname][k2];
                    if (address.family === 'IPv4' && !address.internal && ifname === 'eth0') {
                        ipAdd = address.address;
                    }
                }
            }
        }
    }

    return ipAdd;
}

