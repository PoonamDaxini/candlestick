const amqp = require('amqplib');
const debug = require("debug")("jobs");
const co = require("co");

class LoggerQueue {

    constructor(addresses, vhost, username, password) {
        this.addresses = addresses;
        this.vhost = vhost;
        this.username = username;
        this.password = password;

        this.connection = null;
        this.pullChannel = null;
        this.pushChannel = null;
        this.getChannel = null;
        this.pubChannel = null;
        this.subChannel = null;

        this.reconnection = false;
        this.connectionInterval = null;
        this.pullInterval = null;
    }

    static getInstance(addresses, vhost, username, password) {
        return new LoggerQueue(addresses, vhost, username, password);
    }

    start() {
        this.connection = this.connect();

        this.connectionEvents();

        return this;
    }

    startChannel(conn, channel) {
        this[channel] = conn.createChannel();

        this.channelEvents(channel);

        return this[channel];
    }

    connect() {
        const self = this;
        return co(function *() {
            let conn;
            for (const address of self.addresses) {
                try {
                    conn = yield amqp.connect(
                        `amqp://${self.username}:${self.password}@${address.host}:${address.port}/${self.vhost}`
                    );

                    break;
                } catch (e) {
                    conn = null;
                }
            }

            if (conn) {
                return Promise.resolve(conn);
            } else {
                return Promise.reject("CONNECTION_FAILED");
            }
        });
    }

    push(queueName, data, options) {
        const opt = Object.assign(
            {},
            LoggerQueue.getDefaultQueueOptions(),
            typeof options === 'object' ? options : {}
        );

        return new Promise((resolve, reject) => {
            this.connection.then((conn) => {
                if (!this.pushChannel) {
                    this.pushChannel = this.startChannel(conn, "pushChannel");
                }
                return this.pushChannel;
            }).then((channel) => {
                return new Promise((internalResolve, internalReject) => {
                    channel.assertQueue(queueName, opt).then(() => {
                        internalResolve(channel);
                    }).catch((err) => {
                        internalReject(err);
                    });
                });
            }).then((channel) => {
                let msg;
                if (typeof data === 'object') {
                    if (data instanceof Buffer) {
                        msg = data;
                    } else {
                        msg = new Buffer(JSON.stringify(data));
                    }
                } else if (typeof data === 'string') {
                    msg = new Buffer(data);
                } else {
                    reject("INVALID_QUEUE_DATA");
                }

                const sent = channel.sendToQueue(queueName, msg, {persistent: true});

                if (sent){
                    resolve(true);
                }
                else{
                    reject("NOT_SENT_TO_QUEUE");
                }

            }).catch((err) => {
                if (err === 'CONNECTION_FAILED') {
                    this.reconnect();
                }

                reject(err);
            });
        });
    }

    pull(queueName, callback, autoAck, options) {
        const opt = Object.assign(
            {},
            LoggerQueue.getDefaultQueueOptions(),
            typeof options === 'object' ? options : {}
        );

        return new Promise((resolve, reject) => {
            this.connection.then((conn) => {

                if (this.pullInterval) {
                    clearInterval(this.pullInterval);
                    this.pullInterval = null;
                }

                conn.on("close", () => {
                    this.pull(queueName, callback, autoAck, options);
                });

                if (!this.pullChannel) {
                    this.pullChannel = this.startChannel(conn, "pullChannel");
                }
                return this.pullChannel;
            }).then((channel) => {
                return new Promise((internalResolve, internalReject) => {
                    channel.assertQueue(queueName, opt).then(() => {
                        internalResolve(channel);
                    }).catch((err) => {
                        internalReject(err);
                    });
                });
            }).then((channel) => {
                return channel.consume(queueName, (msg) => {
                    callback(msg, channel);
                }, {noAck: autoAck});
            }).then((consumerTag) => {
                resolve(consumerTag);
            }).catch((err) => {
                if (err === 'CONNECTION_FAILED') {
                    this.reconnect();
                    if (!this.pullInterval) {
                        this.pullInterval = setInterval(() => {
                            this.pull(queueName, callback, autoAck, options);
                        }, 5000);
                    }
                }
                reject(err);
            });
        });
    }

    get(queueName, autoAck, options) {
        const opt = Object.assign(
            {},
            LoggerQueue.getDefaultQueueOptions(),
            typeof options === 'object' ? options : {}
        );

        return new Promise((resolve, reject) => {
            this.connection.then((conn) => {
                if (!this.getChannel) {
                    this.getChannel = this.startChannel(conn, "getChannel");
                }
                return this.getChannel;
            }).then((channel) => {
                return new Promise((internalResolve, internalReject) => {
                    channel.assertQueue(queueName, opt).then(() => {
                        internalResolve(channel);
                    }).catch((err) => {
                        internalReject(err);
                    });
                });
            }).then((channel) => {
                channel.get(queueName, {noAck: autoAck}).then((msg) => {
                    if (!autoAck && msg) {
                        channel.ack(msg);
                    }

                    resolve(msg);
                });
            }).catch((err) => {
                if (err === 'CONNECTION_FAILED') {
                    this.reconnect();
                }
                reject(err);
            });
        });
    }

    publish(exchange, data) {
        return new Promise((resolve, reject) => {
            this.connection.then((conn) => {
                if (!this.pubChannel) {
                    this.pubChannel = this.startChannel(conn, "pubChannel");
                }
                return this.pubChannel;
            }).then((channel) => {
                channel.assertExchange(exchange, 'fanout', {durable: false});

                let msg;
                if (typeof data === 'object') {
                    if (data instanceof Buffer) {
                        msg = data;
                    } else {
                        msg = new Buffer(JSON.stringify(data));
                    }
                } else if (typeof data === 'string') {
                    msg = new Buffer(data);
                } else {
                    reject("INVALID_QUEUE_DATA");
                }

                const sent = channel.publish(exchange, '', msg);

                if (sent){
                    resolve(true);
                }
                else{
                    reject("NOT_SENT_TO_QUEUE");
                }

            }).catch((err) => {
                if (err === 'CONNECTION_FAILED') {
                    this.reconnect();
                }

                reject(err);
            });
        });
    }

    subscribe(exchange, callback) {
        return new Promise((resolve, reject) => {
            this.connection.then((conn) => {

                if (this.subInterval) {
                    clearInterval(this.subInterval);
                    this.subInterval = null;
                }

                conn.on("close", () => {
                    this.subscribe(exchange, callback);
                });

                if (!this.subChannel) {
                    this.subChannel = this.startChannel(conn, "subChannel");
                }
                return this.subChannel;
            }).then((channel) => {
                return new Promise((internalResolve, internalReject) => {
                    channel.assertExchange(exchange, 'fanout', {durable: false});

                    channel.assertQueue('', {exclusive: true}).then((q) => {
                        channel.bindQueue(q.queue, exchange, '');

                        internalResolve({ channel: channel, queue: q.queue });
                    }).catch((err) => {
                        internalReject(err);
                    });
                });
            }).then((cq) => {
                return cq.channel.consume(cq.queue, (msg) => {
                    callback(msg);
                }, {noAck: true});
            }).then((consumerTag) => {
                resolve(consumerTag);
            }).catch((err) => {
                if (err === 'CONNECTION_FAILED') {
                    this.reconnect();
                    if (!this.subInterval) {
                        this.subInterval = setInterval(() => {
                            this.subscribe(exchange, callback);
                        }, 5000);
                    }
                }

                reject(err);
            });
        });
    }

    reconnect() {
        if (!this.reconnection) {
            this.reconnection = true;
            this.start();
        }
    }

    connectionEvents() {
        this.connection.then((conn) => {
            if (conn != null) {
                this.reconnection = false;

                if (this.connectionInterval) {
                    clearInterval(this.connectionInterval);
                    this.connectionInterval = null;
                }

                conn.on("close", () => {
                    if (!this.connectionInterval) {
                        this.connectionInterval = setInterval(() => {
                            this.reconnect();
                        }, 3000);
                    }

                    this.connection = Promise.reject("CONNECTION_FAILED");
                });

                conn.on("error", () => {
                    if (!this.connectionInterval) {
                        this.connectionInterval = setInterval(() => {
                            this.reconnect();
                        }, 3000);
                    }

                    this.connection = Promise.reject("CONNECTION_FAILED");
                });
            }
        }).catch(() => {
            this.reconnection = false;
        });
    }

    channelEvents(channel) {
        this[channel].then((c) => {
            c.on("close", () => {
                this[channel] = null;
            });

            c.on("error", () => {
                this[channel] = null;
            });
        });
    }

    static getDefaultQueueOptions() {
        return {
            exclusive: false,
            durable: true,
            autoDelete: false
        };
    }
}

module.exports = LoggerQueue;

