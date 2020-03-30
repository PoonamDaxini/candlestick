exports.error =  function(ctx, e){

    let logData = {};

    logData.host = ctx.request.header.host;
    logData.url = ctx.originalUrl;
    logData.logTime = ctx.logTime;
    logData.method = ctx.method;
    logData.status = e.code || 500;

    logData.errName = e.name || 'GenericError';
    logData.errMessage = e.message || 'No Message Bro!!!';

    if(e.stack){
        logData.errStack = e.stack;
    }else{
        logData.errStack = (typeof e === 'object')? JSON.stringify(e):e;
    }

    if(typeof e.errors !== 'undefined'){
        logData.errExtras = e.errors;
    }

    logData.responseLength = ctx.response.length || undefined;
    logData.responseTime = new Date - ctx.start;
    logData.source_ip = ctx.get('x-forwarded-for') || undefined;

    console.log(logData);
};

exports.success =  function(ctx){
    let logData = {};

    logData.host = ctx.request.header.host;
    logData.url = ctx.originalUrl;
    logData.method = ctx.method;
    logData.logTime = ctx.logTime;
    logData.status = ctx.status;
    if(typeof ctx.request.body !== 'undefined' && ctx.originalUrl === '/'){
        logData.request=ctx.request.body.fields || 'No Request Fields';
    }
    logData.responseLength = ctx.response.length || undefined;
    logData.responseTime = new Date - ctx.start;
    logData.source_ip = ctx.get('x-forwarded-for') || undefined;

    console.log(logData);

};

