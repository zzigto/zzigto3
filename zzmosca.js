var mosca = require('mosca')
var fs = require('fs');

var GLOBAL_MOSCA=null;

class zzmosca
{
    constructor(zzweb, superuser, superpwd) 
    { 
		GLOBAL_MOSCA=this;
		this.status=false;
		this.zzweb=zzweb;
		this.superuser=superuser;
		this.superpwd=superpwd;
		this.connections={};
		this.settings = 
		{
			port: this.zzweb.jsystem.mqttport
			,allowNonSecure:true
			,http: 
			{
				port: this.zzweb.jsystem.mqttwsport,
				bundle: true,
				static: './'
			}
			,secure : 
			{
				port: this.zzweb.jsystem.mqttsslport,
				keyPath: this.zzweb.home_directory+'/cert/key.pem',
				certPath: this.zzweb.home_directory+'/cert/cert.pem',
			}
			,https: 
			{
				keyPath: this.zzweb.home_directory+'/cert/key.pem',
				certPath: this.zzweb.home_directory+'/cert/cert.pem',
				port: this.zzweb.jsystem.mqttwssport,
				bundle: true,
				static: './'
			}
		};
		
		console.log("MQTT Server port TCP", this.zzweb.jsystem.mqttport);
		console.log("MQTT Server port WS", this.zzweb.jsystem.mqttwsport);
		console.log("MQTT Server port TCP SSL", this.zzweb.jsystem.mqttsslport);
		console.log("MQTT Server port WSS", this.zzweb.jsystem.mqttwssport);
		
    }
	
	start()
	{ 
		this.server = new mosca.Server(this.settings);
		
		this.server.on('ready', function() 
		{
			GLOBAL_MOSCA.status=true;
			try
			{
				console.log("Mosca server is up and running");
			}
			catch(e)
			{
				//console.log("ready", e);
				GLOBAL_MOSCA.zzweb.utils.log("Mosca error:", e.message);

			}
		});
		
		this.server.authenticate = function (client, username, password, callback) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.1");
			try
			{
				if (!client.id)
				{
					GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.failed.1");
					callback(null, false);
					return;
				}
					
				var su=false;
				var spassword=password.toString('utf8');
				GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate", client.id, username, spassword);
				
				if (GLOBAL_MOSCA.superuser==username && GLOBAL_MOSCA.superpwd==spassword)
				{
					GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.superuser");
					su=true;
				}
				else
				{
					GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.step.1", username, spassword);
					var jret=GLOBAL_MOSCA.zzweb.zzaccount.get_account(username, spassword);
					if (jret.error)
					{
						//delete this.connections[client.id];
						GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.failed.2", username, spassword);
						callback(null, false);
						return;
					}
					GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.ok", username, spassword);
				}
				GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authenticate.ok", client.id, username, spassword);
				
				GLOBAL_MOSCA.connections[client.id]={};
				GLOBAL_MOSCA.connections[client.id].user=username;
				GLOBAL_MOSCA.connections[client.id].pwd=spassword;
				GLOBAL_MOSCA.connections[client.id].su=su;
				callback(null, true);
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("authenticate.error", e.message);
			}
		};	
		
		this.server.authorizePublish=function(client, topic, payload, callback) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authorizePublish.1");
			try
			{
				if (GLOBAL_MOSCA.connections[client.id].su || topic.startsWith(GLOBAL_MOSCA.connections[client.id].user))
				{
					GLOBAL_MOSCA.zzweb.utils.log("Mosca authorizePublish", client.id, topic);
					callback(null, true);
					return;
				}
				GLOBAL_MOSCA.zzweb.utils.log("Mosca authorizePublish.fail", client.id);
				callback(null, false);
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("authorizePublish.error", e.message);
			}
		};
		this.server.authorizeSubscribe=function(client, topic, callback) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.authorizeSubscribe.1");
			try
			{
				//console.log("Mosca authorizeSubscribe.connections", GLOBAL_MOSCA.connections);
				if (GLOBAL_MOSCA.connections[client.id].su || topic.startsWith(GLOBAL_MOSCA.connections[client.id].user))
				{
					GLOBAL_MOSCA.zzweb.utils.log("Mosca authorizeSubscribe.ok", client.id, topic);
					callback(null, true);
					return;
				}
				GLOBAL_MOSCA.zzweb.utils.log("Mosca authorizeSubscribe.fail", client.id, topic);
				callback(null, false);
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("authorizeSubscribe.error", e.message);
			}
		};
		
		this.server.on('clientConnected', function(client) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.clientConnected.1");
			try
			{
				GLOBAL_MOSCA.zzweb.utils.log('client connected');
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("clientConnected.error", e.message);
			}
		});

		this.server.on('published', function(packet, client) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("published.1");
			var message="";
			try
			{
				if (packet.topic.endsWith("/out"))
				{
					GLOBAL_MOSCA.zzweb.utils.log("published.2");
					message=packet.payload.toString('utf8');
					
					var jmessage=JSON.parse(message);
					if (jmessage.type && jmessage.type=="data" && jmessage.T && jmessage.SV!=0)
					{
						GLOBAL_MOSCA.zzweb.utils.log("published.2.1");
						GLOBAL_MOSCA.saveDataM(packet.topic, jmessage);
					}
					else
						GLOBAL_MOSCA.zzweb.utils.log("published.2.2");
				}
				else
					GLOBAL_MOSCA.zzweb.utils.log("published.3");
				
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("published.error", e.message);
			}
		});

		this.server.on('subscribed', function(topic, client) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.subscribed.1");
			try
			{
				GLOBAL_MOSCA.zzweb.utils.log('subscribed : ', topic);
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("subscribed.error", e.message);
			}
		});

		this.server.on('unsubscribed', function(topic, client) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.unsubscribed.1");
			try
			{
				GLOBAL_MOSCA.zzweb.utils.log('unsubscribed : ', topic);
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("unsubscribed.error", e.message);
			}
		});

		this.server.on('clientDisconnecting', function(client) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.clientDisconnecting.1");
			try
			{
				GLOBAL_MOSCA.zzweb.utils.log('clientDisconnecting : ', client.id);
				delete GLOBAL_MOSCA.connections[client.id];
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("clientDisconnecting.error", e.message);
			}
		});

		this.server.on('clientDisconnected', function(client) 
		{
			GLOBAL_MOSCA.zzweb.utils.log("zzmosca.clientDisconnected.1");
			try
			{
				GLOBAL_MOSCA.zzweb.utils.log('clientDisconnected : ', client.id);
				delete GLOBAL_MOSCA.connections[client.id];
			}
			catch(e)
			{
				GLOBAL_MOSCA.zzweb.utils.log("clientDisconnected.error", e.message);
			}
		});		
    }
	
	splitTopic(topic)
	{
		var jret={};
        try
        {	
			var items=topic.split("/");
            if (items && items.length>0)
                jret.root=items[0];
            if (items && items.length>1)
                jret.device=items[1];			
            if (items && items.length>2)
                jret.io=items[2];			
        }
        catch(e)
        {
			GLOBAL_MOSCA.zzweb.utils.log('zzmqtt.publish.exception.error', e.message);
        }        
		return jret;
    }
	

	
    lPad(v, len, chpad)
    {
        if (!chpad)
            chpad=" ";

        v=""+v;
        var ret=0;
        var lenv=0;
        if (!(v === undefined))
        {            
            ret=v;
            lenv=v.length;
        }

        for (var i=0; i<len-lenv; i++)
        {
            ret=chpad.substring(0, 1)+ret;
        }
        return ret;
    }
	
		
    saveDataM(topic, jmessage) 
	{
		GLOBAL_MOSCA.zzweb.utils.log("saveDataM.1");
		
		var items=GLOBAL_MOSCA.splitTopic(topic);
		if (items.root && items.device)
		{
			var date=new Date(jmessage.T);
			var _M=date.getMonth()+1;
			var _Y=date.getFullYear();
			var _D=date.getDate();
									
			var H=Math.floor(jmessage.T/3600000)*3600000;	
			var D=Math.floor(jmessage.T/86400000)*86400000;
			
			//console.log("Date:", "M:", _M, "Y:", _Y, "D:", _D, "H:", H, "D:", D);
			
			
			jmessage.value.H=H;
			jmessage.value.D=D;


			var P=GLOBAL_MOSCA.zzweb.home_directory+"/devices/"+items.root+"/"+items.device+"/data";
			//var F=P+"/"+D+".json";
			var F=P+"/"+this.lPad(_Y, 4, '0')+this.lPad(_M, 2, '0')+".json";
			
			//console.log("File:", F, "T:", jmessage.T, "H:", H, "D:", D);
			
			if (!fs.existsSync(F))
			{
				//console.log("FILE NOT EXIST");
				if (!fs.existsSync(GLOBAL_MOSCA.zzweb.home_directory+"/devices/"+items.root+"/"+items.device))
					fs.mkdirSync(GLOBAL_MOSCA.zzweb.home_directory+"/devices/"+items.root+"/"+items.device);
				
				if (!fs.existsSync(GLOBAL_MOSCA.zzweb.home_directory+"/devices/"+items.root+"/"+items.device+"/data"))
					fs.mkdirSync(GLOBAL_MOSCA.zzweb.home_directory+"/devices/"+items.root+"/"+items.device+"/data");
				
				var jdata={};
				for (var prop in jmessage.value) 
				{
					try
					{
						//console.log("prop:", prop);
						if (jmessage.value[prop].TN && jmessage.value[prop].TM)
						{
							//console.log("setprop:", prop);
							if (!jdata[H])
								jdata[H]={};
							
							if (!jdata[H][prop])
								jdata[H][prop]={};
							
							jdata[H][prop].CT=0;
							jdata[H][prop].N=jmessage.value[prop].N;
							jdata[H][prop].TN=jmessage.value[prop].TN;
							jdata[H][prop].M=jmessage.value[prop].M;
							jdata[H][prop].TM=jmessage.value[prop].TM;
						}
						//else
						//	console.log("skipprop:", prop);
					}
					catch(e)
					{
					}						
				}
				//jdata[H]=jmessage.value;
				
				//console.log("passo1");
				fs.writeFileSync(F, JSON.stringify(jdata), { mode: 0o777 });
				//console.log("passo1.1");
			}
			else
			{
				//console.log("FILE EXIST");
				var data = fs.readFileSync(F, {encoding:'utf8', flag:'r'}); 
				//console.log("passo.2");
				var jdata=JSON.parse(data);
				if (jdata)
				{	
					//console.log("passo.2.1", D);
					if (jdata[H])
					{
						//console.log("EXIST:", H);							
						for (var prop in jmessage.value) 
						{
							if (!jdata[H].hasOwnProperty(prop))
								jdata[H][prop]={'CT':0};
							
							//if (jdata[H][prop])
							//	jdata[H][prop].CT++;
							
							try
							{
								if (jmessage.value[prop].hasOwnProperty('N'))
								{
									//console.log("zzmosca.exist N", prop, JSON.stringify(jmessage.value[prop], null, 2));
									
									if (!jdata[H][prop].hasOwnProperty('N') || jmessage.value[prop].N<jdata[H][prop].N)
									{
										//if (!jdata[H][prop])
										//	jdata[H][prop]={};
										
										jdata[H][prop].N=jmessage.value[prop].N;
										jdata[H][prop].TN=jmessage.value[prop].TN;
									}
								}
								//else
								//	console.log("zzmosca.notexist N", prop, JSON.stringify(jmessage.value[prop], null, 2));

							}
							catch(e)
							{
								GLOBAL_MOSCA.zzweb.utils.log("zzmosca.error.2:", e.message);
							}
								
							try
							{
								if (jmessage.value[prop].hasOwnProperty('M'))
								{
									if (!jdata[H][prop].hasOwnProperty('M') || jmessage.value[prop].M>jdata[H][prop].M)
									{
										//if (!jdata[H][prop])
										//	jdata[H][prop]={};
										
										jdata[H][prop].N=jmessage.value[prop].M;
										jdata[H][prop].TN=jmessage.value[prop].TM;
									}
								}
								//else
								//	console.log("passo.2.4");
							}
							catch(e)
							{
								GLOBAL_MOSCA.zzweb.utils.log("zzmosca.error.3:", e.message);
							}
						}
						
						//jdata[H]=jmessage.value;
						//console.log("passo2", JSON.stringify(jdata, null, 2));
						fs.writeFileSync(F, JSON.stringify(jdata, null, 2), { mode: 0o777 });
					}
					else
					{
						//console.log("NOT EXIST:", H);	
						
						for (var prop in jmessage.value) 
						{
							try
							{
								//console.log("prop:", prop);
								if (jmessage.value[prop].hasOwnProperty('TN') && jmessage.value[prop].hasOwnProperty('TM'))
								//if (jmessage.value[prop].TN && jmessage.value[prop].TM)
								{
									console.log("setprop:", prop);
									
									if (!jdata.hasOwnProperty('H'))
									//if (!jdata[H])
										jdata[H]={};
									
									if (!jdata.H.hasOwnProperty(prop))
									//if (!jdata[H][prop])
										jdata[H][prop]={};
									
									jdata[H][prop].CT=0;
									jdata[H][prop].N=jmessage.value[prop].N;
									jdata[H][prop].TN=jmessage.value[prop].TN;
									jdata[H][prop].M=jmessage.value[prop].M;
									jdata[H][prop].TM=jmessage.value[prop].TM;
								}
								//else
								//	console.log("skipprop:", prop);
							}
							catch(e)
							{
								GLOBAL_MOSCA.zzweb.utils.log("zzmosca.error.1.error:", e.message);
							}						
						}
						//jdata[H]=jmessage.value;
						//console.log("passo3", JSON.stringify(jdata, null, 2));
						fs.writeFileSync(F, JSON.stringify(jdata, null, 2), { mode: 0o777 });
					}
				}
				else
				{
					GLOBAL_MOSCA.zzweb.utils.log("INVALID JSON");
				}
			}
			
			
			//console.log("DATA:", jmessage, jmessage.T, H, D);
		}
	}
}

exports.zzmosca=zzmosca;

