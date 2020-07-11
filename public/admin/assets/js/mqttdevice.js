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
					GLOBAL_MQTT.subscribe(GLOBAL_MQTT.user+"/+/in");
                },
                
                onFailure: function (message) 
                {
					alert('mqtt.onFailure:'+message.errorMessage);
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
				//alert('mqtt Connection closed');
            }
            
            this.mqtt.onMessageArrived = function (message) 
            {
                try
                {
                    var topic = message.destinationName;
                    var payload = message.payloadString;
                    var jpayload=JSON.parse(payload);
					if (jpayload.cmd=="get_data")
					{
						sendData();
					}
                    if (jpayload && jpayload.cmd=="set" && jpayload["P3"])
					{
						__deviceDemo.values.P3=Number(jpayload["P3"]);
					}
                }    
                catch(e)
                {
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
            //alert(e);
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
