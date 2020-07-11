const mqtt = require('mqtt')
const fs = require('fs');


var mqttclient=null;

class zzmqttclient
{
    constructor(user, pwd)
    {
        try
        {            
			mqttclient=this;
			
			this.isConnected=false;
            this.mq=null;
			
            this.clientId="ZZIGTOTEST_"+new Date().getTime();
            this.user=user;
            this.pwd=pwd;
						
            this.protocol="mqtt";
            //this.address="service.zzigto.net";
            this.address="localhost";
            this.port=1883;								
        }
        catch(e)
        {
			console.log(e);
        }        
    }
	
    
    connectMqtt()
    {
        try
        {
            var options=
            {
                clientId:this.clientId,
                username:this.user,
                password:this.pwd,
                clean:true
            };
            
            console.log(this.protocol+'://'+this.address+":"+this.port+"/mqtt", options);
            this.mq = mqtt.connect(this.protocol+'://'+this.address+":"+this.port+"/mqtt", options);
            
            this.mq.on('connect', function () 
            {
				mqttclient.isConnected=true;
				console.log('zzmqtt.connectMqtt.connect');
				
				//mqttclient.subscribe("+/+/out");
            });

            this.mq.on('message', function (topic, message) 
            {
                try
                {
					console.log("mqtt.on.1", topic, message);
                }
                catch(e)
                {
					console.log(e);
                }        
            });
            
            this.mq.on('close',function()
            {
				mqttclient.isConnected=false;
				//console.log('zzmqtt.connectMqtt.close');
            })      
            
            this.mq.on("error", function(error) 
            {
				console.log('zzmqtt.connectMqtt.error', error);
            });

            this.mq.on('offline', function() 
            {
				console.log('zzmqtt.connectMqtt.offline');
            });

            this.mq.on('reconnect', function() 
            {
				//console.log('zzmqtt.connectMqtt.reconnect');
            });            
        }    
        catch(e)
        {
			console.log('zzmqtt.connectMqtt.exception', e.name, e.message);
        }                
    } 
        
    disconnect()
    {
        try
        {
            if (mqttclient.mq)
                mqttclient.mq.disconnect();
        }
        catch(e)
        {
			console.log('zzmqtt.disconnect.exception', e.name, e.message);
        }        
    }

    unsubscribe(topic)
    {
        try
        {
            console.log("unsubscribe:"+topic);
            if (mqttclient.mq)
                mqttclient.mq.unsubscribe(topic);
        }
        catch(e)
        {
			console.log('zzmqtt.unsubscribe.exception', e.name, e.message);
        }        
    }

    subscribe(topic)
    {
        try
        {
            console.log("subscribe:"+topic);
            if (mqttclient.mq)
                mqttclient.mq.subscribe(topic, function (error) 
                {
                    if (error && __globalService.callback)
						console.log('zzmqtt.subscribe error', error);
                })
        }
        catch(e)
        {
			console.log('zzmqtt.subscribe.exception', e.name, e.message);
        }        
    }
    
    publish(topic, payload) 
    {
        try
        {
            if (mqttclient.mq)
            {
                mqttclient.mq.publish(topic, payload);
            }
        }
        catch(e)
        {
			console.log('zzmqtt.publish.exception', e.name, e.message);
        }        
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
			console.log('zzmqtt.publish.exception', e.name, e.message);
        }        
		return jret;
    }
}
	
//exports.zzmqttclient=zzmqttclient;



var mc=new zzmqttclient('mcrolle@gmail.com', 'eee');
mc.connectMqtt();

