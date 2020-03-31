//cron
const request = require('superagent');

setInterval(async () => { 
	await request.get("http://localhost:7005/coindcx/").then(res=>{
		console.log(res.body);
	}).catch(err => {
		console.log(err);
	});
	
 }, 1000);