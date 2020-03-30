const Koa = require('koa');
const app = new Koa();

const koaBody = require('koa-bodyparser'),
         cors = require('koa2-cors');

require('./bootstrap/errors');
require('./bootstrap/globals');

app.use(koaBody({
    'textLimit': '10mb',
    'formLimit': '10mb',
    'jsonLimit': '10mb'

}));

app.use(cors({
    origin: function(ctx) {
        //allowing cros origin all
        return '*';
        
    }
}));


app.use(async (ctx, next) => {
    try {
        ctx.start = new Date;
        ctx.logTime = Date.now();
        await next();

        if(process.env.NODE_ENV !== 'production' ){
            Log.success(ctx);
        }
    } catch (e) {
        const errBody = {
            message: e.message ? e.message : 'Failure',
            error: e.error ? e.error : '',
            data: []
        };

        ctx.body = errBody;
        if(errBody.error && errBody.error.code){
          ctx.status = 200;
        }
        else {
          ctx.status = Number(e.code) || 500;
        }
        if(process.env.NODE_ENV !== 'production' ){
            Log.error(ctx, e);
        }
    }
});

app.use(async (ctx, next) => {

    await next();
    if (ctx.body) {
        ctx.status = 200;
        ctx.body = {
            message: ctx.data || 'Success',
            data: ctx.body,
            error: {code:0}
        };
    } else {
        error('NotFoundError');
    }
});

require('./app/router')(app);
require('./app/tradeInfo');

app.listen(config.PORT || 7005);

