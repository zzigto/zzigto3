var GLOBAL_MQTT=null;
var GLOBAL_MQTT_STATUS=false;

class mqtt
{
    constructor(protocol, hostname, port, user, pwd, clientId, devices)
    {
        this.protocol=protocol;
        this.hostname=hostname;
        this.port=port;
        this.user=user;        
        this.pwd=pwd;        
        this.clientId=clientId;    
		this.devices=devices;
        this.mqtt=null;
        
        GLOBAL_MQTT=this;
    }
        
    connect()
    {
        try
        {
            this.mqtt = new Paho.MQTT.Client
            (
                this.hostname,        
                Number(this.port),
                '/mqtt',                
                this.clientId
            );
            
            var options = 
            {
                timeout: 3,
                useSSL: false,
                cleanSession: true,
                                               
                onSuccess:  function () 
                {
					GLOBAL_MQTT_STATUS=true;
					GLOBAL_MQTT.subscribe(GLOBAL_MQTT.user+"/+/out");
                },
                
                onFailure: function (message) 
                {
					alert('mqtt.onFailure:'+message);
                }
            };

            if (this.protocol=="wss")
                options.useSSL = true;
            else
                options.useSSL = false;
            
            options.userName = this.user;
            options.password = this.pwd;
            
            this.mqtt.onConnectionLost = function (responseObject) 
            {
				alert('mqtt.onConnectionLost');
            }
            
            this.mqtt.onMessageArrived = function (message) 
            {
                try
                {
                    var topic = message.destinationName;
                    var payload = message.payloadString;
                    var jpayload=JSON.parse(payload);
					
					var topicItems=splitTopic(topic);
					
					//topicItems.device
					
					if (jpayload.type=="alert")
					{
						var div=document.getElementById("alert");
						
						var item="TOPIC:"+topic+"\r\n";
						item=item+"SUBJECT:"+jpayload.sub+"\r\n";
						item=item+="TEXT:"+jpayload.text+"\r\n";
						
						div.innerHTML="<pre>"+item+"</pre>";
					}
					
					if (jpayload.type=="data")
					{
						var div=document.getElementById(topicItems.device+"_gpsLat");
						if (div && jpayload.gps)
							div.innerHTML=jpayload.gps.lat;
						
						var div=document.getElementById(topicItems.device+"_gpsLng");
						if (div && jpayload.gps)
							div.innerHTML=jpayload.gps.lng;
						
						var div=document.getElementById(topicItems.device+"_gpsAlt");
						if (div && jpayload.gps)
							div.innerHTML=jpayload.gps.alt;								
						
						for (var prop in jpayload.value) 
						{
							if (prop.startsWith("P"))
							{
								var div=document.getElementById(topicItems.device+"."+prop+"_value");
								if (div && jpayload.value[prop].V)
									div.innerHTML=jpayload.value[prop].V;
								
								var div=document.getElementById(topicItems.device+"."+prop+"_time");
								if (div && jpayload.T)
									div.innerHTML=msToStrTime(jpayload.T);
								
								var div=document.getElementById(topicItems.device+"."+prop+"_Hmin");
								if (div && jpayload.value[prop].N)
									div.innerHTML=jpayload.value[prop].N;
								
								var div=document.getElementById(topicItems.device+"."+prop+"_HminTime");
								if (div && jpayload.value[prop].TN)
									div.innerHTML=msToStrTime(jpayload.value[prop].TN);
								
								var div=document.getElementById(topicItems.device+"."+prop+"_Hmax");
								if (div && jpayload.value[prop].M)
									div.innerHTML=jpayload.value[prop].M;
								
								var div=document.getElementById(topicItems.device+"."+prop+"_HmaxTime");
								if (div && jpayload.value[prop].TM)
									div.innerHTML=msToStrTime(jpayload.value[prop].TM);
								
							}
						}
					}
                    
                }    
                catch(e)
                {
					var err=e;
                }                
            }
            
            this.mqtt.connect(options);
        }    
        catch(e)
        {
            alert(e);
        }                
    } 
        
    disconnect()
    {
        try
        {
            if (this.mqtt)
                this.mqtt.disconnect();
        }
        catch(e)
        {
            alert(e);
        }
    }

    unsubscribe(topic)
    {
        try
        {
            if (this.mqtt)
                this.mqtt.unsubscribe(topic);
        }
        catch(e)
        {
            alert(e);
        }
    }

    subscribe(topic)
    {
        try
        {
            this.mqtt.subscribe(topic, {qos: 0}); 
        }
        catch(e)
        {
            alert(e);
        }        
    }    
    
    send(topic, payload) 
    {
        try
        {
            if (this.mqtt)
            {
                var message = new Paho.MQTT.Message(payload);
                message.destinationName = topic;
                message.qos = 0;

                this.mqtt.send(message);
            } 
        }
        catch(e)
        {
            alert(e);
        }
    }
}
