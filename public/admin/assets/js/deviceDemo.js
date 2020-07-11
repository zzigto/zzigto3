__deviceDemo=null;

class deviceDemo
{	
    constructor(USER, PWD, DEVICE_OWNER) 
    { 
        __deviceDemo=this;
        this.ACCOUNT={};
		this.MQTT=null;
		this.GPS=null;
		this.LAST_SEND_TIME=0;
		this.INTERVAL=null;
		this.SEQ=0;
		this.STATUS=false;
		this.DEVICE_SI="DEMO-01234";
		this.DEVICE_TIMEOUT=5000;
		this.DEVICE_OWNER=DEVICE_OWNER; //"admin@zzigto.net";
		this.USER=USER;
		this.PWD=PWD;
		this.LAST_ALERT_TIME=0;
		
		this.values=
		{
			P0:0,
			P0N:0,
			P0M:0,
			P0TN:0,
			P0TM:0,
			
			P1:0,
			P1N:0,
			P1M:0,
			P1TN:0,
			P1TM:0,
			
			P2:0,
			P3:0,
			P4:0
		}
		
	}



	getMqttCredentials()
	{   
		var jret={'mqtt':{'protocol':"", 'address':'', 'port':'', 'user':'', 'password':''}};
		
		if (this.ACCOUNT.attributes.mqttip)
			jret.mqtt.address=this.ACCOUNT.attributes.mqttip;
		else
			jret.mqtt.address=window.location.hostname;
			
		if (this.ACCOUNT.attributes.mqttuser)
			jret.mqtt.user=this.ACCOUNT.attributes.mqttuser;
		else
			jret.mqtt.user=this.ACCOUNT.attributes.user;
			
		if (this.ACCOUNT.attributes.mqttpassword)
			jret.mqtt.password=this.ACCOUNT.attributes.mqttpassword;
		else
			jret.mqtt.password=this.ACCOUNT.attributes.pwd;
		
		
		if (window.location.protocol=="http:")
		{
			jret.mqtt.protocol="ws";		
			jret.mqtt.port=this.ACCOUNT.attributes.mqttwsport;
		}
		else
		{   
			jret.mqtt.protocol="wss";		
			jret.mqtt.port=this.ACCOUNT.attributes.mqttwssport;
		}
		return jret;
	}


	setPin(id, v, t, h, nd, sv)
	{
		var name="P"+id;
		
		var H=Math.round(t/3600000)*3600000;
		
		
		this.values[name]=Number(v.toFixed(nd));

		if (v<this.values[name+"N"])
		{
			this.values[name+"N"]=this.values[name];					
			this.values[name+"TN"]=t;
		}
		if (v>this.values[name+"M"])
		{
			this.values[name+"M"]=this.values[name];					
			this.values[name+"TM"]=t;
		}
	}

	startExec()
	{
		try
		{		
			document.getElementById("message").innerHTML="MQTT Connection Starting";
		
			this.USER="";
			this.PWD="";
			var params=getCookie();		
			if (params && params.user && params.pwd)
			{
				this.STATUS=true;
				this.USER=params.user;
				this.PWD=params.pwd;
				
				
				this.getLocation();
				
				var url=getUrl()+"/?func=login_device&user="+params.user+"&pwd="+params.pwd+"&si="+this.DEVICE_SI+"&model="+this.DEVICE_SI+".json&owner="+this.DEVICE_OWNER;
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
				this.ACCOUNT={};
				this.ACCOUNT.attributes=jret;

				
				var mqttCredentials=this.getMqttCredentials();				
				this.MQTT=new mqtt(mqttCredentials.mqtt.protocol, mqttCredentials.mqtt.address, mqttCredentials.mqtt.port, mqttCredentials.mqtt.user, mqttCredentials.mqtt.password, "DD_"+new Date().getTime());
				this.MQTT.connect();
						
				this.values["P0"]=0;
				this.values["P3"]=0.1;
				this.values["P4"]=0;
							
				this.INTERVAL=setInterval(function() 
				{
					try
					{	
						__deviceDemo.setBlinker();
						
						if (__deviceDemo.MQTT && __deviceDemo.MQTT.mqtt && __deviceDemo.MQTT.mqtt.isConnected())
						//if (this.MQTT.mqtt.isConnected())
						{	
							if (new Date().getTime()-__deviceDemo.LAST_SEND_TIME>__deviceDemo.DEVICE_TIMEOUT)
							{	
								
								__deviceDemo.LAST_SEND_TIME=new Date().getTime();
								__deviceDemo.sendData();
								
								if (__deviceDemo.LAST_SEND_TIME-__deviceDemo.LAST_ALERT_TIME>20000 && __deviceDemo.values.P0>0.8)
								{	
									__deviceDemo.LAST_ALERT_TIME=__deviceDemo.LAST_SEND_TIME;
									__deviceDemo.sendAlert(__deviceDemo.DEVICE_SI+'.SIN='+__deviceDemo.values.P0, 'SIN of '+__deviceDemo.DEVICE_SI+' device value='+__deviceDemo.values.P0+' out of maximum limit (0.8)');
								}
								
								if (__deviceDemo.LAST_SEND_TIME-__deviceDemo.LAST_ALERT_TIME>20000 && __deviceDemo.values.P0<-0.8)
								{	
									__deviceDemo.LAST_ALERT_TIME=__deviceDemo.LAST_SEND_TIME;
									__deviceDemo.sendAlert(__deviceDemo.DEVICE_SI+'.SIN='+__deviceDemo.values.P0, 'SIN of '+__deviceDemo.DEVICE_SI+' device value='+__deviceDemo.values.P0+' out of minimum limit (-0.8)');
								}
							}
						}
					}
					catch(e)
					{
						alert(e);
					}        
					
				}, 1000);	
			}
		}
		catch(e)
		{
			alert(e)
		}        
	}
	
	setBlinker()
	{
		var cn=document.getElementById("DemoDevice").className;
		if (cn=="nav-item")
			document.getElementById("DemoDevice").className="nav-item active";
		else
			document.getElementById("DemoDevice").className="nav-item";
	}

	getLocation() 
	{
		if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition(this.showPosition);
		} 
	}

	showPosition(position) 
	{
		__deviceDemo.GPS=position.coords;
	}

	sendData()
	{
		try
		{	
			if (this.MQTT.mqtt.isConnected())
			{	
				document.getElementById("message").innerHTML="MQTT Connection True";
				this.LAST_SEND_TIME=new Date().getTime();
				
				var T=new Date().getTime();			
				var H=Math.round(T/3600000)*3600000;									
				
				var INC=this.values["P3"];
				var RAD=this.values["P2"]+this.values["P3"];
				var SIN=Math.sin(RAD);
				var COS=Math.cos(RAD);
				var LED=this.values["P4"]+1;
				if (LED>2) LED=0
												
				this.setPin(0, SIN, T, H, 2, true);
				this.setPin(1, COS, T, H, 2, true);
				this.setPin(2, RAD, T, H, 2, false);
				this.setPin(3, INC, T, H, 2, false);
				this.setPin(4, LED, T, H, 2, false);
				
											
				var gps=this.GPS;
									
				this.SEQ++;
						
				var jmsg={};
				jmsg.T=T;
				jmsg.type="data";
				jmsg.SEQ=this.SEQ;
				jmsg.value={};
				jmsg.value.P0={};
				jmsg.value.P1={};
				jmsg.value.P2={};
				jmsg.value.P3={};
				jmsg.value.P4={};

				jmsg.value.P0.V =this.values["P0"];
				jmsg.value.P0.N =this.values["P0N"];
				jmsg.value.P0.M =this.values["P0M"];
				jmsg.value.P0.TN=this.values["P0TN"];
				jmsg.value.P0.TM=this.values["P0TM"];
				
				jmsg.value.P1.V=this.values["P1"];
				jmsg.value.P1.N=this.values["P1N"];
				jmsg.value.P1.M=this.values["P1M"];
				jmsg.value.P1.TN=this.values["P1TN"];
				jmsg.value.P1.TM=this.values["P1TM"];
				
				jmsg.value.P2.V=this.values["P2"];
				jmsg.value.P3.V=this.values["P3"];
				jmsg.value.P4.V=this.values["P4"];
				
				if (this.GPS)
				{
					jmsg.gps={};
					
					jmsg.gps.lat=this.GPS.latitude;
					jmsg.gps.lng=this.GPS.longitude
					jmsg.gps.alt=this.GPS.altitude
				}        
				
				//getItem("message").value=JSON.stringify(JSON.parse(msg), null, 2);
				//getItem("message").value=JSON.stringify(jmsg, null, 2);
				
				this.MQTT.send(this.USER+"/"+this.DEVICE_SI+"/out", JSON.stringify(jmsg));
			}
			else
				document.getElementById("message").innerHTML="MQTT Connection False";
		}
		catch(e)
		{
			alert(e);
		}        
		
	}

	sendAlert(sub, text)
	{
		try
		{
				this.SEQ++;
						
				var jmsg={};
				jmsg.T=new Date().getTime();
				jmsg.type="alert";
				jmsg.SEQ=this.SEQ;
				jmsg.sub=sub;
				jmsg.text=text;
								
				this.MQTT.send(this.USER+"/"+this.DEVICE_SI+"/out", JSON.stringify(jmsg));
		}
		catch(e)
		{
			alert(e);
		}        
		
	}
	
	stopExec()
	{
		try
		{	
			document.getElementById("message").innerHTML="";
			
			this.STATUS=false;
			clearInterval(this.INTERVAL);
			document.getElementById("DemoDevice").className="nav-item";
						
			if (this.MQTT)
				this.MQTT.disconnect();
		}
		catch(e)
		{
			alert(e)
		}        
	}
}

