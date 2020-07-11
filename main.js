var zzweb = require('./zzweb.js');
var fs = require('fs');
var zzutils = require('./zzutils');
var zzmosca = require('./zzmosca');


//---------------------------------------------------------
// START
//---------------------------------------------------------
var reservedsystem=fs.readFileSync("system/reservedsystem.json", {encoding:'utf8', flag:'r'});
var jreservedsystem=JSON.parse(reservedsystem);

if (!fs.existsSync(jreservedsystem.homedir+"/log"))
	fs.mkdirSync(jreservedsystem.homedir+"/log");

fs.appendFileSync(jreservedsystem.homedir+"/log/starts.txt", "STARTING:"+new Date()+"\r\n");

							
var web=new zzweb.zzweb(jreservedsystem.homedir, jreservedsystem.log, jreservedsystem);
web.start();


var mosca=new zzmosca.zzmosca(web, jreservedsystem.superuser, jreservedsystem.superpwd);
mosca.start();

fs.appendFileSync(jreservedsystem.homedir+"/log/starts.txt", "STARTED :"+new Date()+"\r\n");

var T = setInterval(function () 
{
	var TMS=new Date().getTime();	
	web.onClock(TMS);
	
}, 1000);

