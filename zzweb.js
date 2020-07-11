const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const zzaccount = require('./zzaccount');
const zzdevices = require('./zzdevices');
const zzhttprequest = require('./zzhttprequest');
const zzmodels = require('./zzmodels');
const zzutils = require('./zzutils');


var web=null;

class zzweb
{
    constructor(home_directory, log, jreservedsystem) 
    { 
		web=this;
		this.home_directory=home_directory;
		this.jreservedsystem=jreservedsystem;
		this.utils=new zzutils.zzutils(log);

		
		try
		{ 
			var attributes=fs.readFileSync(this.home_directory+"/system/system.json", {encoding:'utf8', flag:'r'});
			this.jsystem=JSON.parse(attributes);
		
			this.port=this.jsystem.webport;
			this.sslport=this.jsystem.websslport;
			this.url=this.jsystem.weburl;			
			this.enabelJson=this.jsystem.enabelJson;
			this.enabelHtml=this.jsystem.enabelHtml;
			
			attributes=fs.readFileSync(this.home_directory+"/system/reservedsystem.json", {encoding:'utf8', flag:'r'});
			this.jreservedsystem=JSON.parse(attributes);
			
			this.passphrase=this.jreservedsystem.passphrase;
			
		}
		catch(e)
		{ 
			this.utils.log(e);
			
			var error=zzerrors.get("zzweb", "constructor", 1, e.name + ': ' + e.message);
			return {'error':true, 'error_code':error.code, 'error_msg':error.message};
		}		
		
		
		/*this.port=port;
		this.sslport=sslport;
		this.url=url;
		this.home_directory=home_directory;
		this.passphrase=passphrase;		
		this.enabelJson=enabelJson;
		this.enabelHtml=enabelHtml;*/
		
		this.zzaccount=new zzaccount.zzaccount(this);
		this.zzdevices=new zzdevices.zzdevices(this);
		this.zzmodels=new zzmodels.zzmodels(this);
		this.zzhttprequest=new zzhttprequest.zzhttprequest();

		
		//this.mailUrl="http://service.zzigto.net/php/sendMail.php?MAIL_HOST=mx.enaiponline.com&MAIL_FROM=support@zzigto.net&MAIL_FROM_NAME=support";
    }
	
	onGetMailUrl()
    {		
		if (this.onCheckMail())
			return this.jreservedsystem.MAIL_URL+"?MAIL_HOST="+this.jreservedsystem.MAIL_HOST+"&MAIL_FROM="+this.jreservedsystem.MAIL_FROM+"&MAIL_FROM_NAME="+this.jreservedsystem.MAIL_FROM_NAME;
		else
			return null;
    }

	onCheckMail()
    {		
		if (this.jreservedsystem.USE_MAIL_SERVER && this.jreservedsystem.MAIL_URL && this.jreservedsystem.MAIL_HOST && this.jreservedsystem.MAIL_FROM && this.jreservedsystem.MAIL_FROM_NAME)
			return true;
		else
			return false;
    }
	
	onClock(time)
    {		
		//var d=new Date(time)		
		//this.utils.log("zzweb.onClock:", time, d.toUTCString(), d.toString());
		
		
		this.zzaccount.onClock(time);
		this.zzdevices.onClock(time);
    }
    
    start()
    {
		if (this.sslport)
		{
			const options = 
			{
				key: fs.readFileSync(this.home_directory+'/cert/key.pem'),
				cert: fs.readFileSync(this.home_directory+'/cert/cert.pem'),
				passphrase: this.passphrase
			};

			
			https.createServer(options, function (req, res) 
			{				
				var postData=null;
				
				if (req.method=='POST')
				{
					postData=web.getPOST_data(req, res);
				}
				else
				{
					var _res=web.makeResponse(req, postData);				
					res.writeHead(_res.code, {'Content-Type': _res.type});
					res.end(_res.obj);
				}
			}).listen(this.sslport);
			this.utils.log("HTTPS Server port "+this.sslport)
		}
		
		if (this.port)
		{
			http.createServer(function (req, res) 
			{
				var postData=null;
				
				if (req.method=='POST')
				{
					postData=web.getPOST_data(req, res);
				}
				else
				{
					var _res=web.makeResponse(req, postData);				
					res.writeHead(_res.code, {'Content-Type': _res.type});
					res.end(_res.obj);
				}
			}).listen(this.port);
			this.utils.log("HTTP Server port "+this.port)
		}
    }
	
	getPOST_data(req, res)
    {		
		try
		{
			var body = '';
			var _req=req;
			req.on('data', function(data) 
			{
				body += String(data);
			});
			
			req.on('end', function () 
			{
				//console.log("getPOST_data", body);
				
				var _res=web.makeResponse(_req, body);				
				res.writeHead(_res.code, {'Content-Type': _res.type});
				res.end(_res.obj);
				
			});
		}	
		catch(e)
		{ 
			this.utils.log(e);
		}		
    }
			
	
	makeResponse(req, postData)
    {		
		try
		{		
			var resultType="json";
			var queryData = url.parse(req.url, true).query;		
			
			var attributes=null;
			if (queryData.attributes)
			{		
				attributes=queryData.attributes;
			}
			else
			{
				if (postData)
				{
					attributes=postData;
				}
			}
				
			var result={};
			var html="";
			var htmlCode=200;
			var htmlMimeType="";
			
			//this.utils.log("req.url", req.url);
			
			if (req.url.startsWith("/mqtt/auth"))
			{
				//this.utils.log("passo mqtt/auth.1", queryData);
				
				if (queryData.username && queryData.password)
				{
					//this.utils.log("passo mqtt/auth.2", queryData.username, queryData.password);
					var jret=this.zzaccount.get_account(queryData.username, queryData.password);
					//this.utils.log("passo mqtt/auth.2.1", jret);
					if (!jret.error)
					{
						//this.utils.log("passo mqtt/auth.3");
						return {'code':200, 'obj':'', 'type':'text/html'};
					}
					else
						return {'code':400, 'obj':'', 'type':'text/html'};
				}
				//this.utils.log("passo mqtt/auth.4");
				return {'code':401, 'obj':'', 'type':'text/html'};
			}
			
			if (req.url.startsWith("/mqtt/superuser"))
			{
				//this.utils.log("passo mqtt/superuser.1");
				return {'code':401, 'obj':'', 'type':'text/html'};
			}
						
			if (req.url.startsWith("/mqtt/acl"))
			{
				//this.utils.log("passo mqtt/acl.1", queryData);				
				if (queryData.username && queryData.topic)
				{
					
					if (this.jreservedsystem.superuser==queryData.username)
					{
						this.utils.log("passo mqtt/acl.2");
						return {'code':200, 'obj':'', 'type':'text/html'};
					}
					
					this.utils.log("passo mqtt/acl.2", queryData.username, queryData.topic);
					if (queryData.topic.startsWith(queryData.username+"/"))
					{
						this.utils.log("passo mqtt/acl.3");
						return {'code':200, 'obj':'', 'type':'text/html'};
					}
					else
						this.utils.log("passo mqtt/acl.4");
				}
				return {'code':401, 'obj':'', 'type':'text/html'};
			}
			
			if (this.enabelJson && queryData.func)
			{
				this.utils.log(queryData.func);
				//this.utils.log(this.home_directory);
				switch (queryData.func)
				{
					case 'exec_confirmed_code': //from browser with USER/PWD/CODE
					
						if (queryData.code)
						{
							result = this.zzaccount.exec_confirmed_code(queryData.code);
						}
						else
						{
							result= {'func':queryData.func, 'error':true, 'error_code':-1007, 'error_msg':'Invalid code request', obj:{}};
						}
						break;

					/*case 'use_email':
						this.utils.log('use_email.0', queryData.func, attributes);
						result={'func':queryData.func, 'error':false, 'error_code':0, 'error_msg':'', 'usemail':this.onCheckMail(), obj:{}};
						this.utils.log('use_email.1');
						result.func=queryData.func;
						break;*/

					case 'get_start_info':
						console.log('use_email.0', queryData.func);
						var info={'demoModelOwner':this.jreservedsystem.demoModelOwner, 'usemail':this.onCheckMail()};
						
						result={'func':queryData.func, 'error':false, 'error_code':0, 'error_msg':'', 'info':info, obj:{}};
						this.utils.log('use_email.1');
						result.func=queryData.func;
						break;					
						
					case 'reset_user_pin': //from administrator browser	with USER/PWD/user email
						this.utils.log('reset_user_pin.0', queryData.func, attributes);
						result=this.zzaccount.reset_user_pin(queryData.user, queryData.pwd, queryData.useremail);
						this.utils.log('reset_user_pin.1');
						result.func=queryData.func;
						break;					
						
					case 'request_account_code': //from browser	with USER/PWD
						this.utils.log('request_account_code.0', queryData.func, attributes);
						result=this.zzaccount.request_account_code(queryData, queryData.func, attributes)
						this.utils.log('request_account_code.1');
						result.func=queryData.func;
						break;					
						
					case 'get_account': //from browser	with USER/PWD
						if (queryData.user && queryData.pwd)
							result=this.zzaccount.get_account(queryData.user, queryData.pwd);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1006, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;										
					
					case 'set_account': //from browser	with USER/PWD
						if (queryData.user && queryData.pwd && attributes)
							result=this.zzaccount.set_account(queryData.user, queryData.pwd, attributes);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1006, 'error_msg':'Invalid Login or attributes', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'set_device': //from device with USER/PWD/SN
						if (queryData.user && queryData.pwd && queryData.si && queryData.model && queryData.owner)
							result = this.zzdevices.set_device(queryData.user, queryData.pwd, queryData.si, queryData.model, queryData.owner);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1006, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
						
					case 'set_device_desc': //from browser
						if (queryData.user && queryData.pwd && queryData.si)
							result= this.zzdevices.set_device_desc(queryData.user, queryData.pwd, queryData.si, queryData.desc);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
					
					case 'set_device_pin_desc': //from browser
						if (queryData.user && queryData.pwd && queryData.si && queryData.pin)
							result= this.zzdevices.set_device_pin_desc(queryData.user, queryData.pwd, queryData.si, queryData.pin, queryData.desc);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
						
					case 'set_device_pin_remote': //from browser
						if (queryData.user && queryData.pwd && queryData.si && queryData.pin)
							result= this.zzdevices.set_device_pin_remote(queryData.user, queryData.pwd, queryData.si, queryData.pin, queryData.remote);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
						
					case 'set_device_remote': //from browser
						if (queryData.user && queryData.pwd && queryData.si)
							result= this.zzdevices.set_device_remote(queryData.user, queryData.pwd, queryData.si, queryData.remote);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
						
					case 'set_device_alias': //from browser
						if (queryData.user && queryData.pwd && queryData.si)
							result= this.zzdevices.set_device_alias(queryData.user, queryData.pwd, queryData.si, queryData.alias);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
					
					case 'get_device': //from device with USER/PWD/SI
						if (queryData.user && queryData.pwd && queryData.si)
							result= this.zzdevices.get_device(queryData.user, queryData.pwd, queryData.si);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
					
					case 'delete_device': //from device with USER/PWD/SI
						if (queryData.user && queryData.pwd && queryData.si)
							result= this.zzdevices.delete_device(queryData.user, queryData.pwd, queryData.si);
						else
							result= {'func':queryData.func, 'error':true, 'error_code':-1005, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
										
					case 'get_device_list': //from browser with USER/PWD
						if (queryData.user && queryData.pwd)
							result= this.zzdevices.get_device_list(queryData.user, queryData.pwd);
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;
										
					case 'login_user': //from browser with USER/PWD
						result=this.zzaccount.login(queryData.user, queryData.pwd);
						result.func=queryData.func;
						break;
						
					case 'login_device': //from device with USER/PWD
						result=this.zzaccount.login_device(queryData.user, queryData.pwd, queryData.si, queryData.model, queryData.owner);
						result.func=queryData.func;
						break;
						
					case 'get_system': //from browser	with USER/PWD
						if (queryData.user && queryData.pwd)
							result= this.zzaccount.get_system(queryData.user, queryData.pwd);
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'get_data': //from browser	with USER/PWD
						//if (queryData.user && queryData.pwd && queryData.si && queryData.msfrom && queryData.msto)
						if (queryData.user && queryData.pwd && queryData.si && queryData.year && queryData.month)
							//result= this.zzdevices.get_data(queryData.user, queryData.pwd, queryData.si, queryData.msfrom, queryData.msto);
							result= this.zzdevices.get_data(queryData.user, queryData.pwd, queryData.si, queryData.year, queryData.month);
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'send_mail': //from browser	with USER/PWD
						if (this.onCheckMail())
						{ 
							if (queryData.user && queryData.pwd && queryData.mailto && queryData.subject && queryData.text)
							{ 
								if (!this.zzaccount.validateUser(queryData.user, queryData.pwd))
									return {'error':true, 'error_code':-2011, 'error_msg':'Invalid user or password'};
								
								if (this.sendMail(queryData.mailto, queryData.subject, queryData.text))
									result= {'error':false, 'error_code':0, 'error_msg':'', obj:{}};
								else
									result= {'error':true, 'error_code':-2023, 'error_msg':'Mail server not configured', obj:{}};
							}	
							else
								result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						}	
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Mail server not configured', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'get_models_list': //from browser	with USER/PWD
						if (queryData.user && queryData.pwd)
							result= this.zzmodels.get_models_list(queryData.user, queryData.pwd);
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'get_model': //from browser	with USER/PWD/MODELHOWNER/MODELNAME
						if (queryData.user && queryData.pwd && queryData.owner && queryData.model)
							result= this.zzmodels.get_model(queryData.user, queryData.pwd, queryData.owner, queryData.model);
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Params', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'set_model': //from browser	with USER/PWD/MODEL
						if (queryData.user && queryData.pwd)
							if (queryData.model && attributes)
								result= this.zzmodels.set_model(queryData.user, queryData.pwd, queryData.model, attributes);
							else
								result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid model name or attributes', obj:{}};
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;										
						
					case 'delete_model': //from browser	with USER/PWD/MODEL
						if (queryData.user && queryData.pwd)
							if (queryData.model)
								result= this.zzmodels.delete_model(queryData.user, queryData.pwd, queryData.model);
							else
								result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid model name or attributes', obj:{}};
						else
							result= {'error':true, 'error_code':-1003, 'error_msg':'Invalid Login', obj:{}};
						result.func=queryData.func;
						break;										
					default:
						result= {'func':queryData.func, 'error':true, 'error_code':-1002, 'error_msg':'Invalid function request', obj:{}};						
				}
			}
			else
			{ 
				if (this.enabelHtml && !queryData.func)
				{ 
					var request=req.url.split("?");
					//this.utils.log("request:", request);
					
					if (request && request.length>0 && request[0])
					{
						if (request[0]=="/")
							request[0]="index.html";
						
						if (fs.existsSync(this.home_directory+"/public/"+request[0]))
						{
							htmlMimeType=this.getWebMimeType(request[0]);
							html=this.getWebFile(request[0], htmlMimeType);
							htmlCode=200;
						}
						else
						{
							htmlMimeType=this.getWebMimeType('404.html');
							html=this.getWebFile('404.html', htmlMimeType);
							htmlCode=404;
						}
					}
					else
					{
						htmlMimeType=this.getWebMimeType('404.html');
						html=this.getWebFile('404.html', htmlMimeType);
						htmlCode=404;
					}
					
					resultType="html";
				}
				else
					result= {'func':queryData.func, 'error':true, 'error_code':-1001, 'error_msg':'Invalid function request', obj:{}};
			}
			
			if (resultType=="json")
			{ 
				if (queryData.pretty)
					return {'code':200, 'obj':JSON.stringify(result, null, 2), 'type':"text/plain"};
				else
					return {'code':200, 'obj':JSON.stringify(result), 'type':"text/plain"};
			}	
			if (resultType=="html")
			{ 
				this.utils.log("passo html");
				return {'code':htmlCode, 'obj':html, 'type':htmlMimeType};
			}	
		}	
		catch(e)
		{ 
			this.utils.log(e);
			return {'code':200, 'obj':e.name + ': ' + e.message, 'type':"text/html"};
		}		
		
    }
	
	getWebFile(fileName, mimeType)
	{ 
		try
		{ 
			this.utils.log("getWebFile:", fileName, mimeType);
			if (mimeType.startsWith("image"))
				return 	fs.readFileSync(this.home_directory+'/public/'+fileName);
			else
				return 	fs.readFileSync(this.home_directory+'/public/'+fileName, {encoding:'utf8', flag:'r'});
			
			/*switch (fileName)
			{ 
				case '404.html':
					return 	fs.readFileSync(this.home_directory+'/public/internal/404.html', {encoding:'utf8', flag:'r'});
				
				default:
					this.utils.log("getWebFile:", fileName, mimeType);
					return 	fs.readFileSync(this.home_directory+'/public/'+fileName, {encoding:'utf8', flag:'r'});
			}*/
		}	
		catch(e)
		{ 
			this.utils.log(e);
			return "";
		}		

    }

	getWebMimeType(fileName)
	{ 
		try
		{ 
			if (fileName.toLowerCase().endsWith("html") || fileName.toLowerCase().endsWith("htm")) return "text/html";
			if (fileName.toLowerCase().endsWith("css")) return "text/css";
			if (fileName.toLowerCase().endsWith("js")) return "text/javascript";
			
			if (fileName.toLowerCase().endsWith("gif")) return "image/gif";
			if (fileName.toLowerCase().endsWith("png")) return "image/png";
			if (fileName.toLowerCase().endsWith("ico")) return "image/vnd.microsoft.icon";
						
			if (fileName.toLowerCase().endsWith("jpeg") || fileName.toLowerCase().endsWith("jpg")) return "image/jpeg";
			
			return "text/plain";
		}	
		catch(e)
		{ 
			this.utils.log(e);
			return "";
		}		

    }
	
	sendMail(MAIL_TO, MAIL_SUBJECT, MAIL_TEXT)
	{ 
		if (this.onGetMailUrl())
		{ 
			var cb=new callback();
			try
			{ 
				MAIL_TEXT=MAIL_TEXT.split("&").join("^");
				this.zzhttprequest.get(this.onGetMailUrl()+"&MAIL_TO="+MAIL_TO+"&MAIL_SUBJECT="+MAIL_SUBJECT+"&MAIL_TEXT="+MAIL_TEXT, cb);
			}	
			catch(e)
			{ 
				this.utils.log(e);
				return {'error':true, 'error_code':-1066, 'error_msg':e.name + ': ' + e.message};
			}		
			return true;
		}		
		return false;
    }
}

class callback
{
	constructor()
	{
	}
	
	onResult(response) 
	{ 
		try
		{ 
			web.utils.log(JSON.stringify(response, null, 2));
		}	
		catch(e)
		{ 
			web.utils.log(e);
		}		
	}
}

exports.zzweb=zzweb;
