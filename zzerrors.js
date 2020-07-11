class zzerrors
{
    constructor()
    {
		this.jerrors=
		{
			'zzweb':
			{
				'constructor':{'1':{'code': -1002, 'message':""}}
			}
		};
		
		this.jerrors.zzweb={'constructor':{}, 'onClock':{}, 'start':{}, 'getPOST_data':{}, 'makeResponse':{}, 'getWebFile':{}, 'getWebMimeType':{}, 'sendMail':{}  };
		this.jerrors.zzweb.constructor.1={'code': -1002, 'message':""};
		this.jerrors.zzweb.makeResponse.1={'code': -1003, 'message':""};
		
		this.jerrors.zzaccount={};
		this.jerrors.zzdevices={};
		this.jerrors.zzmqttclient={};
		this.jerrors.zzhttprequest={};
    }
	
	get(className, method, code, message)
    {
        try
        {
			return {this.jerrors[className][method][code]};
        }
        catch(e)
        {
			return {{'code': -999, 'message':Generic Error for className:'+className+" method:"+method+" code:"+code+" message:"+message}};
        }        
    }
    
exports.zzerrors=zzerrors;
