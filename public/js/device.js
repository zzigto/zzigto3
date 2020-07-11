var GLOBAL_SERVICE_URL="localhost";
var GLOBAL_DEVICE_OWNER="admin@zzigto.net";
var GLOBAL_ACCOUNT=null;
var GLOBAL_MQTT=null;

var lastSendTime=0;
var interval=null;
var seq=0;

function getUrl()
{
	if (window.location.protocol=="https:")
		return "https://"+GLOBAL_SERVICE_URL;
	else
		return "http://"+GLOBAL_SERVICE_URL;
}

function httpGet(url)
{
	try
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", url, false );
		xmlHttp.send( null );
		
		return xmlHttp.responseText;
	}
	catch(e)
	{
		alert(e);
	}
}

function httpPost(url, raw)
{   
	try
	{        
		var xhr = new XMLHttpRequest();  
		xhr.open("POST", url, false);  
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.send(raw);
		return xhr.responseText;
	}    
	catch(e)
	{
		alert(e);
	}
}

function getMqttCredentials()
{   
	var jret={'mqtt':{'protocol':"", 'address':'', 'port':'', 'user':'', 'password':''}};
	
	if (GLOBAL_ACCOUNT.attributes.mqttip)
		jret.mqtt.address=GLOBAL_ACCOUNT.attributes.mqttip;
	else
		jret.mqtt.address=window.location.hostname;
		
	if (GLOBAL_ACCOUNT.attributes.mqttuser)
		jret.mqtt.user=GLOBAL_ACCOUNT.attributes.mqttuser;
	else
		jret.mqtt.user=GLOBAL_ACCOUNT.attributes.user;
		
	if (GLOBAL_ACCOUNT.attributes.mqttpassword)
		jret.mqtt.password=GLOBAL_ACCOUNT.attributes.mqttpassword;
	else
		jret.mqtt.password=GLOBAL_ACCOUNT.attributes.pwd;
	
	
	if (window.location.protocol=="http:")
	{
		jret.mqtt.protocol="ws";		
		jret.mqtt.port=GLOBAL_ACCOUNT.attributes.mqttwsport;
	}
	else
	{   
		jret.mqtt.protocol="wss";		
		jret.mqtt.port=GLOBAL_ACCOUNT.attributes.mqttwssport;
	}
	return jret;
}


function setPin(id, v, t, h, nd, sv)
{
	var name="P"+id;
	
	var H=Math.round(t/3600000)*3600000;
	
	if (!sv || Number(document.getElementById("HOUR").value)!=H)
	{
		document.getElementById(name).value=v.toFixed(nd);
		if (sv) document.getElementById(name+"N").value=v.toFixed(nd);					
		if (sv) document.getElementById(name+"M").value=v.toFixed(nd);					
		if (sv) document.getElementById(name+"TN").value=t;					
		if (sv) document.getElementById(name+"TM").value=t;					
	}
	else
	{
		document.getElementById(name).value=v.toFixed(nd);
		if (v<Number(document.getElementById(name+"N").value))
		{
			document.getElementById(name+"N").value=v.toFixed(nd);					
			document.getElementById(name+"TN").value=t;					
		}
		if (v>Number(document.getElementById(name+"M").value))
		{
			document.getElementById(name+"M").value=v.toFixed(nd);					
			document.getElementById(name+"TM").value=t;					
		}
	}
}

function startExec()
{
	try
	{	
		var url=getUrl()+"/?func=login_device&user="+document.getElementById("device.user").value+"&pwd="+document.getElementById("device.pwd").value+"&si="+document.getElementById("device.si").value+"&model="+document.getElementById("device.si").value+".json&owner="+GLOBAL_DEVICE_OWNER;
		var ret=httpGet(url);
		var jret=JSON.parse(ret);
		if (!jret)
		{
			alert("Invalid http response");
			return;
		}
		if (jret.error)
		{	
			alert(jret.error_msg);
			return;
		}
		GLOBAL_ACCOUNT={};
		GLOBAL_ACCOUNT.attributes=jret;

		
		var mqttCredentials=getMqttCredentials();				
		GLOBAL_MQTT=new mqtt(mqttCredentials.mqtt.protocol, mqttCredentials.mqtt.address, mqttCredentials.mqtt.port, mqttCredentials.mqtt.user, mqttCredentials.mqtt.password, "DD_"+new Date().getTime());
		GLOBAL_MQTT.connect();
	 
		document.getElementById("start").style.display="none";
		document.getElementById("stop").style.display="block";
		document.getElementById("device").style.display="block";
		
		document.getElementById("P2").value="0";
		document.getElementById("P3").value="0.1";
		
		
		interval=setInterval(function() 
		{
			try
			{	
				if (new Date().getTime()-lastSendTime>document.getElementById("TIMEOUT").value)
				{	
					
					lastSendTime=new Date().getTime();
					
					//var T=Date.parse('');
					
					var _T=new Date();
					var _Y=_T.getFullYear();
					var _M=_T.getMonth()+1;
					var _D=_T.getDate();
					var _H=_T.getHours();
					var _MM=_T.getMinutes();
					var _S=_T.getSeconds();

					var T=new Date().getTime();
					if (document.getElementById("YEAR").value && document.getElementById("MONTH").value && document.getElementById("DAY").value)
					{	
						var ST=document.getElementById("YEAR").value+"-"+document.getElementById("MONTH").value+"-"+document.getElementById("DAY").value+" "+_H+":"+_MM+":"+_S;
						T=new Date(ST).getTime();
					}
					
					var H=Math.round(T/3600000)*3600000;									
					
					var INC=Number(document.getElementById("P3").value);
					var RAD=Number(document.getElementById("P2").value)+Number(document.getElementById("P3").value);
					var SIN=Math.sin(RAD);
					var COS=Math.cos(RAD);
													
					setPin(0, SIN, T, H, 2, true);
					setPin(1, COS, T, H, 2, true);
					setPin(2, RAD, T, H, 2, false);
					setPin(3, INC, T, H, 2, false);
					
					document.getElementById("TIME").value=T;
					document.getElementById("HOUR").value=H;
					
										
					seq++;
					var msg='{"T":'+document.getElementById("TIME").value+', "type":"data", "seq":'+seq+', "value":{'+
							'"P0":{"V":'+document.getElementById("P0").value+', "N":'+document.getElementById("P0N").value+', "M":'+document.getElementById("P0M").value+', "TN":'+document.getElementById("P0TN").value+', "TM":'+document.getElementById("P0TM").value+'}, '+
							'"P1":{"V":'+document.getElementById("P1").value+', "N":'+document.getElementById("P1N").value+', "M":'+document.getElementById("P1M").value+', "TN":'+document.getElementById("P1TN").value+', "TM":'+document.getElementById("P1TM").value+'}, '+
							'"P2":{"V":'+document.getElementById("P2").value+'}, '+
							'"P3":{"V":'+document.getElementById("P3").value+'}}}';
							//' "gps":{"lat":"0", "lng":"0", "alt":"0"}}';
					
					document.getElementById("message").value=JSON.stringify(JSON.parse(msg), null, 2);
					
					GLOBAL_MQTT.send(document.getElementById("device.user").value+"/"+document.getElementById("device.si").value+"/out", JSON.stringify(JSON.parse(msg)));
					
				}
			}
			catch(e)
			{
				alert(e);
			}        
			
		}, 1000);	
	}
	catch(e)
	{
		alert(e)
	}        
}

function stopExec()
{
	try
	{	
		clearInterval(interval);
		
		document.getElementById("start").style.display="block";
		document.getElementById("stop").style.display="none";
		document.getElementById("device").style.display="none";
		
		if (GLOBAL_MQTT)
			GLOBAL_MQTT.disconnect();
	}
	catch(e)
	{
		alert(e)
	}        
}

