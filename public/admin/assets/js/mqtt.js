var GLOBAL_MQTT=null;
var GLOBAL_MQTT_STATUS=false;

class mqtt
{
    constructor(protocol, hostname, port, user, pwd, clientId)
    {
        this.protocol=protocol;
        this.hostname=hostname;
        this.port=port;
        this.user=user;        
        this.pwd=pwd;        
        this.clientId=clientId;    
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
                //'/mqtt',                
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
					document.getElementById("mqttstatus").innerHTML='flash_on';
                },
                
                onFailure: function (message) 
                {
					//alert('mqtt.onFailure:'+message);
					document.getElementById("mqttstatus").innerHTML='flash_off';
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
				//alert('mqtt.onConnectionLost');
				document.getElementById("mqttstatus").innerHTML='flash_off';
            }
            
            this.mqtt.onMessageArrived = function (message) 
            {
                try
                {
					document.getElementById("mqttstatus").innerHTML='flash_on';
					
                    var topic = message.destinationName;
                    var payload = message.payloadString;
                    var jpayload=JSON.parse(payload);
					
					var topicItems=splitTopic(topic);
					
					
					if (jpayload.type=="data")
					{
						if (!browserData.data[topicItems.device])
							browserData.data[topicItems.device]={};
													
						browserData.data[topicItems.device]=jpayload;
						
						if (!browserData.dataRT[topicItems.device])
							browserData.dataRT[topicItems.device]=[];
						
						if (browserData.dataRT[topicItems.device].length>20)
							browserData.dataRT[topicItems.device].splice (0, 1);
						
						browserData.dataRT[topicItems.device][browserData.dataRT[topicItems.device].length]=jpayload;						
					}
					
					if (jpayload.type=="alert")
					{
						//var item="TOPIC:"+topic+"\r\n";
						//item=item+"SUBJECT:"+jpayload.sub+"\r\n";
						//item=item+="TEXT:"+jpayload.text+"\r\n";
						if (browserData.alert.length>20)
							browserData.alert.splice (0, 1);
						
						browserData.alert[browserData.alert.length]={topic:topic, payload:jpayload};
						onBrowserSetAlert();
					}
					
					
					if (topicItems.device!=browserData.cursi)
						return;
					
					//topicItems.device
					
					
					if (jpayload.type=="data")
					{
												
						/*var div=document.getElementById("led_"+topicItems.device);
						if (div)
							div.style.background="#00ff00";
						
						if (div && jpayload.gps)
						{							
							drawMap(topicItems.device, jpayload.T, jpayload.gps.lat, jpayload.gps.lng, jpayload.gps.alt)						
						}*/
						
						for (var prop in jpayload.value) 
						{							
							if (prop==browserData.curpin)
							{
								browserData.chartRT.update(browserData.dataRT[browserData.cursi], browserData.curpin);
								browserData.chartRT.exec();
							}
								
								
							if (prop.startsWith("P"))
							{
								
								var div=document.getElementById("pinvalue_"+topicItems.device+"_"+prop);
								if (div)
									div.innerHTML=jpayload.value[prop].V;

								if (jpayload.value[prop].M!=null)
								{
									var div=document.getElementById("pinmax_"+topicItems.device+"_"+prop);
									if (div)
										div.innerHTML=msToStrTime(jpayload.value[prop].TM)+" Value:"+jpayload.value[prop].M;
								}
								
								if (jpayload.value[prop].N!=null)
								{
									var div=document.getElementById("pinmin_"+topicItems.device+"_"+prop);
									if (div)
										div.innerHTML=msToStrTime(jpayload.value[prop].TN)+" Value:"+jpayload.value[prop].N;
								}
								
								var div=document.getElementById("pintime_"+topicItems.device+"_"+prop);
								if (div && jpayload.T)
								{
									div._time=jpayload.T;
									div.innerHTML=msToStrTime(jpayload.T);
									
									
									var div=document.getElementById("pintimeicon_"+topicItems.device+"_"+prop);
									div.className="material-icons";
									//div.className="material-icons text-danger";
								}

								var div=document.getElementById(topicItems.device+"."+prop+"_widget");
								if (div._type=="gauge")
									setGauge(topicItems.device, prop, jpayload.value[prop].V);
								
								else if (div._type=="combo")
									setCombo(topicItems.device, prop, jpayload.value[prop].V);
								
								else if (div._type=="led")
									setLed(topicItems.device, prop, jpayload.value[prop].V);
								
								else
								//if (div._type=="value")
									setValue(topicItems.device, prop, jpayload.value[prop].V);
								
							}
						}
						
					}
                    
                }    
                catch(e)
                {
					//alert(e);
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
