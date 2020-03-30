class Cache {
    constructor(cacheConfig) {
        this.cacheEnabled = JSON.parse(cacheConfig.isEnabled)
        this.keys = {
            CHART_DETAILS: '{market}_{timestamp}_{stickType}'

            // TRADE_DETAILS: 'trade_details_{timestamp}'
        };
        if(this.cacheEnabled){
          this.cacheObject = new(require('ioredis'))(
              cacheConfig.port,
              cacheConfig.host
          );
          this.ttl = cacheConfig.defaultTTL;
        }

    }

    async substituteKeyArgs(key, args) {
        var keyParts = key.split('_');
        var variables = [];
        for (var i = 0; i < keyParts.length; ++i) {
            if (keyParts[i].match(/^{([^}]+)}$/)) {
                variables.push(keyParts[i].substring(1, keyParts[i].length - 1));
            }
        }
        if (variables && args) {
            for (var i = 0; i < variables.length; ++i) {
                var replace = '';
                if (args.hasOwnProperty(variables[i])) {
                    replace = args[variables[i]];
                }
                key = key.replace(new RegExp('{' + variables[i] + '}'), replace);
            }
        }
        return key;
    }

    async getKey(key, args) {
        return await this.substituteKeyArgs(key, args);
    }

    async getKeys(keys, args) {
        var result = [];
        for (var i in keys) {
            result.push(getKey(keys[i], args));
        }
        return result;
    }

    async get(key, args) {
      let result,cacheKey;
      if(this.cacheEnabled){
        if(args){
          cacheKey = await this.getKey(key, args);
        }
        else {
          cacheKey = key;
        }

        result = await this.cacheObject.get(cacheKey);
      }
      return result;
    }

    async set(key, args, data, ttl = '') {
        let result,cacheKey;
        if (this.cacheEnabled) {
          if(args){
            cacheKey = await this.getKey(key, args);
          }
          else {
            cacheKey = key;
          }

          if(!ttl){
            ttl = this.ttl;
          }
          ttl = JSON.parse(ttl);

          result = await this.cacheObject.set(cacheKey, data, 'EX', ttl);
        }
        return result;
    }

    async delete(key, args) {
        let result;
        if (this.cacheEnabled) {
            const cacheKey = await this.getKey(key, args);
            result = await this.cacheObject.del(cacheKey);
        }
        return result;
    }
    async executeCommand(command, key, args, ...arr) {
        let result;
        if (this.cacheEnabled) {
            const cacheKey = await this.getKey(key, args);
            if(cacheKey){
              result = await this.cacheObject[command](cacheKey, arr);
            }
            else {
              result = await this.cacheObject[command]( arr);
            }
        }
        return result;
    }
};

module.exports = Cache;
module.exports.getInstance = (cacheConfig) => new Cache(cacheConfig);
