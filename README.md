# candlestick

To run job goto job folder run `pm2 start process.json` which runs on 7005 port as per config set

To run app server which will serve data to view, go to src folder run `node server.js` which runs on 7004 port as per config 

App server also calls jobs server every second which sets trade data in mongo and redis respectively

To view graph open `candle.html` file which is in view folder

# Logic
1. On every second we are getting data from coindcx trade api
2. On every minute's first data we are considering its last_price as open and close.
3. All subsequent trade data in that particular minutes gets consolidated and higher, lower and close value gets updated
4. I am using mongo to fetch data for showing candlestick graph which can be implemented via redis key's data
5. Frontend's has option to select market, stick, startTime and endTime. [Assumption is StartTime, endTime is in unixTimestamp]

# TO DO
1. Fetch data from redis as per stick, startTime and endTime
2. Error handling
3. Datepicker in frontend
