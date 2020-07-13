const fs = require('fs');
const randomInt = require('random-int');


class zzaccount
{	
    constructor(zzweb) 
    { 
		this.zzweb=zzweb;
		this.TIMEOUT=60000*60;

		if (!fs.existsSync(this.zzweb.home_directory+"/requests"))
			fs.mkdirSync(this.zzweb.home_directory+"/requests");
		
		if (!fs.existsSync(this.zzweb.home_directory+"/accounts"))
			fs.mkdirSync(this.zzweb.home_directory+"/accounts");
		
		if (!fs.existsSync(this.zzweb.home_directory+"/accountsDel"))
			fs.mkdirSync(this.zzweb.home_directory+"/accountsDel");		
	}

	onClock(time)
    {
		//this.zzweb.utils.log("zzaccount.onClock:", time);
    }

    
	request_account_code(queryData, reqfunc, attributes)
	{
		try
		{
			this.zzweb.utils.log("passo1");
			switch(queryData.reqfunc)
			{
				case 'create_account':
					this.zzweb.utils.log("passo2");
					if (attributes)
					{							
						this.zzweb.utils.log("passo3", attributes);
						var jattributes=JSON.parse(attributes);
						if (jattributes.user && jattributes.pwd)
						{
							if (fs.existsSync(this.zzweb.home_directory+"/accounts/"+jattributes.user+".json"))
							{
								this.zzweb.utils.log('CHECK TRUE');
								return {'error':true, 'error_code':-2006, 'error_msg':'Account already exist'};
							}															
							else
								this.zzweb.utils.log('CHECK FALSE');
							
							jattributes.code=this.getRandom();
							jattributes.reqfunc=queryData.reqfunc;
							jattributes.href=this.zzweb.url+'/?pretty=true&func=exec_confirmed_code&reqfunc='+jattributes.reqfunc+'&code='+jattributes.code;
							jattributes.time=new Date().getTime();
							
							fs.writeFileSync(this.zzweb.home_directory+"/requests/"+jattributes.code+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
							
							if (this.zzweb.onCheckMail())
							{
								var mail=this.emailRequestBuilder(jattributes.code, queryData.reqfunc, null);
								if (mail)
								{
									this.zzweb.sendMail(jattributes.user, mail.subject, mail.text);
									return {'reqfunc':queryData.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								}
								else							
									return {'error':true, 'error_code':-2004, 'error_msg':'An error occurred while sending the email'};
							}
							else							
							{ 	
								var jret=this.exec_confirmed_code(jattributes.code);
								if (!jret.error)
									jret.info={'message':'Account created, please save your account pin code:'+jattributes.code};
								return jret;
							}
						}
						else						
							return {'error':true, 'error_code':-2003, 'error_msg':'Invalid request user or password'};
					}	
					return {'error':true, 'error_code':-2002, 'error_msg':'Invalid request parameters'};
				
				case 'update_account':
					if (attributes)
					{							
						this.zzweb.utils.log(attributes);
						if (queryData.user && queryData.pwd)
						{
							if (!this.validateUser(queryData.user, queryData.pwd))
								return {'error':true, 'error_code':-2011, 'error_msg':'Invalid user or password'};
							
							var jattributes=JSON.parse(attributes);
							
							jattributes.code=this.getRandom();
							jattributes.reqfunc=queryData.reqfunc;
							jattributes.href=this.zzweb.url+'/?pretty=true&func=exec_confirmed_code&reqfunc='+jattributes.reqfunc+'&code='+jattributes.code;
							jattributes.time=new Date().getTime();
							jattributes.user=queryData.user;
							if (jattributes.newpwd)
							{
								jattributes.pwd=jattributes.newpwd;
								delete jattributes.newpwd;
							}
							else
								jattributes.pwd=queryData.pwd;
							
							fs.writeFileSync(this.zzweb.home_directory+"/requests/"+jattributes.code+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
							
							if (this.zzweb.onCheckMail())
							{
								var mail=this.emailRequestBuilder(jattributes.code, queryData.reqfunc, null);
								if (mail)
								{
									this.zzweb.sendMail(jattributes.user, mail.subject, mail.text);								
									return {'reqfunc':queryData.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								}
								else							
									return {'error':true, 'error_code':-2010, 'error_msg':'An error occurred while sending the email'};
							}
							else							
							{ 	
								var jret=this.exec_confirmed_code(jattributes.code);
								if (!jret.error)
									jret.info={'message':'Account updated'};
								return jret;
							}
						}
						else						
							return {'error':true, 'error_code':-2009, 'error_msg':'Invalid request user or password'};
					}	
					return {'error':true, 'error_code':-2008, 'error_msg':'Invalid request parameters'};
					
				case 'delete_account':
					if (queryData.user && queryData.pwd)
					{
						if (!this.validateUser(queryData.user, queryData.pwd))
							return {'error':true, 'error_code':-2015, 'error_msg':'Invalid user or password'};
						
						var jattributes={};
						
						jattributes.code=this.getRandom();
						jattributes.reqfunc=queryData.reqfunc;
						jattributes.href=this.zzweb.url+'/?pretty=true&func=exec_confirmed_code&reqfunc='+queryData.reqfunc+'&code='+jattributes.code;
						jattributes.time=new Date().getTime();
						jattributes.user=queryData.user;
						jattributes.pwd=queryData.pwd;
						
						fs.writeFileSync(this.zzweb.home_directory+"/requests/"+jattributes.code+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
						
						if (this.zzweb.onCheckMail())
						{
							var mail=this.emailRequestBuilder(jattributes.code, queryData.reqfunc, null);
							if (mail)
							{
								this.zzweb.sendMail(jattributes.user, mail.subject, mail.text);								
								return {'reqfunc':queryData.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
							}
							else							
								return {'error':true, 'error_code':-2014, 'error_msg':'An error occurred while sending the email'};
						}
						else							
						{ 	
							var jret=this.exec_confirmed_code(jattributes.code);
							if (!jret.error)
								jret.info={'message':'Account deleted'};
							return jret;
						}
					}
					else						
						return {'error':true, 'error_code':-2013, 'error_msg':'Invalid request user or password'};
					
				default:
					return {'error':true, 'error_code':-2012, 'error_msg':'Invalid request function'};
					
				case 'pwd_recovery_account':
					if (queryData.user)
					{						
						var jattributes={};
						
						jattributes.code=this.getRandom();
						jattributes.reqfunc=queryData.reqfunc;
						jattributes.href=this.zzweb.url+'/?pretty=true&func=exec_confirmed_code&reqfunc='+jattributes.reqfunc+'&code='+jattributes.code;
						jattributes.time=new Date().getTime();
						jattributes.user=queryData.user;
						jattributes.newpwd=this.getRandom();
						
						fs.writeFileSync(this.zzweb.home_directory+"/requests/"+jattributes.code+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
						
						if (this.zzweb.onCheckMail())
						{
							var mail=this.emailRequestBuilder(jattributes.code, queryData.reqfunc, "New Password:"+jattributes.newpwd+", Please change it as soon as possible");
							if (mail)
							{
								this.zzweb.sendMail(jattributes.user, mail.subject, mail.text);								
								return {'reqfunc':queryData.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
							}
							else							
								return {'error':true, 'error_code':-2017, 'error_msg':'An error occurred while sending the email'};
						}
						else							
						{ 	
							if (queryData.pin)
							{
								var ca=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+queryData.user+".json", {encoding:'utf8', flag:'r'});
								var jca=JSON.parse(ca);
								if (jca.code==queryData.pin)
								{
									var jret=this.exec_confirmed_code(jattributes.code);
									if (!jret.error)
										jret.info={'message':'Account password recovered', 'newpwd':jattributes.newpwd};
									return jret;
								}
								else							
									return {'error':true, 'error_code':-2017, 'error_msg':'Wrong  account pin code'};
							}
							else							
								return {'error':true, 'error_code':-2017, 'error_msg':'Invalid account pin code'};
						}
						
					}
					else						
						return {'error':true, 'error_code':-2016, 'error_msg':'Invalid request user or password'};
					
				case 'pwd_set_account':
					if (queryData.user && queryData.pwd)
					{
						if (!this.validateUser(queryData.user, queryData.pwd))
							return {'error':true, 'error_code':-2015, 'error_msg':'Invalid user or password'};
						
						var jattributes=JSON.parse(attributes);
						
						jattributes.code=this.getRandom();
						jattributes.reqfunc=queryData.reqfunc;
						jattributes.href=this.zzweb.url+'/?pretty=true&func=exec_confirmed_code&reqfunc='+jattributes.reqfunc+'&code='+jattributes.code;
						jattributes.time=new Date().getTime();
						jattributes.user=queryData.user;
						
						fs.writeFileSync(this.zzweb.home_directory+"/requests/"+jattributes.code+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
						
						if (this.zzweb.onCheckMail())
						{
							var mail=this.emailRequestBuilder(jattributes.code, queryData.reqfunc, "New Password:"+jattributes.newpwd+", Please change it as soon as possible");
							if (mail)
							{
								this.zzweb.sendMail(jattributes.user, mail.subject, mail.text);
								return {'reqfunc':queryData.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
							}
							else							
								return {'error':true, 'error_code':-2017, 'error_msg':'An error occurred while sending the email'};
						}
						else							
						{ 	
							var jret=this.exec_confirmed_code(jattributes.code);
							if (!jret.error)
								jret.info={'message':'Account password changed'};
							return jret;
						}
					}
					else						
						return {'error':true, 'error_code':-2016, 'error_msg':'Invalid request user or password'};
					
			}	
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message};
		}		
	}	
	
	exec_confirmed_code(code)
	{
		try
		{
			var data = fs.readFileSync(this.zzweb.home_directory+"/requests/"+code+".json", {encoding:'utf8', flag:'r'}); 
			if (data)
			{
				var jdata=JSON.parse(data)
				if (jdata)
				{
					if (new Date().getTime()-jdata.time<this.TIMEOUT)
					{				
						switch (jdata.reqfunc)
						{
							case 'create_account':
								if (fs.existsSync(this.zzweb.home_directory+"/accouns/"+jdata.user+".json"))
									return {'error':true, 'error_code':-2011, 'error_msg':'Account already exist'};
												
								if (jdata.reqfunc)
									delete jdata.reqfunc;
								if (jdata.newpwd)
									delete jdata.newpwd;
								if (jdata.href)
									delete jdata.href;

												
								jdata.status=true;
								fs.writeFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", JSON.stringify(jdata, null, 2), { mode: 0o777 });
								
								try 
								{
								  fs.unlinkSync(this.zzweb.home_directory+"/requests/"+code+".json")
								} 
								catch(err) 
								{
								  this.zzweb.utils.error(err)
								}							
							
								return {'func':jdata.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								break;
								
							case 'delete_account':
								if (!fs.existsSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json"))
									return {'error':true, 'error_code':-2012, 'error_msg':'Account not exist'};
													
								try 
								{
									fs.copyFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", this.zzweb.home_directory+"/accountsDel/"+jdata.user+"."+new Date().getTime()+".json");
									fs.unlinkSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json");
									fs.unlinkSync(this.zzweb.home_directory+"/requests/"+code+".json")
								} 
								catch(err) 
								{
								  this.zzweb.utils.error(err)
								}							
							
								return {'func':jdata.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								break;
								
							case 'update_account':
								if (!fs.existsSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json"))
									return {'error':true, 'error_code':-2012, 'error_msg':'Account not exist'};
													
								var attributes=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", {encoding:'utf8', flag:'r'});
								var jattributes=JSON.parse(attributes);
								
								jdata.code=jattributes.code;
													
								
								jdata.status=true;
								fs.writeFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", JSON.stringify(jdata, null, 2), { mode: 0o777 });
								
								try 
								{
								  fs.unlinkSync(this.zzweb.home_directory+"/requests/"+code+".json")
								} 
								catch(err) 
								{
								  this.zzweb.utils.error(err)
								}							
							
								return {'func':jdata.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								break;
								
							case 'pwd_recovery_account':
								if (!fs.existsSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json"))
									return {'error':true, 'error_code':-2013, 'error_msg':'Account not exist'};
													
								var attributes=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", {encoding:'utf8', flag:'r'});
								var jattributes=JSON.parse(attributes);
								
								jattributes.pwd=jdata.newpwd;
								
								fs.writeFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
								
								try 
								{
								  fs.unlinkSync(this.zzweb.home_directory+"/requests/"+code+".json")
								} 
								catch(err) 
								{
								  this.zzweb.utils.error(err)
								}							
							
								return {'func':jdata.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								break;
								
							case 'pwd_set_account':
								if (!fs.existsSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json"))
									return {'error':true, 'error_code':-2012, 'error_msg':'Account not exist'};
												
								var attributes=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", {encoding:'utf8', flag:'r'});
								var jattributes=JSON.parse(attributes);

								if (!jdata.newpwd || !jdata.pwdcnf || jdata.newpwd!=jdata.pwdcnf)
								{
									return {'error':true, 'error_code':-2012, 'error_msg':'Invalid password or password confirm'};
								}							
								jattributes.pwd=jdata.newpwd;
								
								fs.writeFileSync(this.zzweb.home_directory+"/accounts/"+jdata.user+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
								
								try 
								{
								  fs.unlinkSync(this.zzweb.home_directory+"/requests/"+code+".json")
								} 
								catch(err) 
								{
								  this.zzweb.utils.error(err)
								}							
							
								return {'func':jdata.reqfunc, 'error':false, 'error_code':0, 'error_msg':''};
								break;
								
								
							default:
								return {'func':jdata.reqfunc, 'error':true, 'error_code':-2010, 'error_msg':'Invalid function request'};
																
						}				
					}	
					else
						return {'func':'', 'error':true, 'error_code':-2009, 'error_msg':'Code timeout expired'};
				}	
				else
					return {'func':'', 'error':true, 'error_code':-2008, 'error_msg':'Invalid request data'};
				
			}	
			else
				return {'func':'', 'error':true, 'error_code':-2007, 'error_msg':'Invalid request code'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-4000, 'error_msg':e.name + ': ' + e.message};
		}		
	}

	get_account(user, pwd) 
	{
		try
		{
			
			if (!this.validateUser(user, pwd))
				return {'error':true, 'error_code':-2005, 'error_msg':'Invalid user or password'};
			
		
			var data=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+user+".json", {encoding:'utf8', flag:'r'})
			var jdata=JSON.parse(data)
			jdata.system=this.get_system(user, pwd);
			
			if (this.zzweb.jreservedsystem.superuser==user)
				jdata.isSuperUser=true;
			
			//delete jdata['pwd'];
			delete jdata['href'];
			
			return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jdata};
		}
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2012, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	set_account(user, pwd, attributes) 
	{
		try
		{
			
			if (!this.validateUser(user, pwd))
				return {'error':true, 'error_code':-2005, 'error_msg':'Invalid user or password'};
		
			var jattributes=JSON.parse(attributes);
			
			var ca=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+user+".json", {encoding:'utf8', flag:'r'});
			var jca=JSON.parse(ca);
			
			jattributes.code=jca.code;
			
			
			
			jattributes.status=true;
			jattributes.user=user;
			jattributes.pwd=pwd;
			
			fs.writeFileSync(this.zzweb.home_directory+"/accounts/"+jattributes.user+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
			
			return this.get_account(user, pwd);
		}
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2012, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	login(user, pwd) 
	{
		try
		{
			if (!this.validateUser(user, pwd))
				return {'error':true, 'error_code':-2014, 'error_msg':'Invalid user or password'};
			
			var jaccount=this.get_account(user, pwd);
			//this.zzweb.utils.log(jaccount.attributes);
			
			return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jaccount.attributes};
		}
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2013, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	login_device(user, pwd, si, model, owner) 
	{
		try
		{
			//if (!si || !user || !pwd || !model)
			//	return {'error':true, 'error_code':-2014, 'error_msg':'Invalid parameters'};

			if (!si)
				return {'error':true, 'error_code':-2014, 'error_msg':'Invalid si'};
			if (!user)
				return {'error':true, 'error_code':-2015, 'error_msg':'Invalid user'};
			if (!pwd)
				return {'error':true, 'error_code':-2016, 'error_msg':'Invalid pwd'};
			if (!model)
				return {'error':true, 'error_code':-2017, 'error_msg':'Invalid model'};
			
			if (!this.validateUser(user, pwd))
				return {'error':true, 'error_code':-2018, 'error_msg':'Invalid user or password'};
			
			var jaccount=this.get_account(user, pwd);

			var jattributes={};
						
			jattributes.error=jaccount.error;
			jattributes.error_code=jaccount.error_code;
			jattributes.error_msg=jaccount.error_msg;
			if (!jaccount.error)
			{
				jattributes.tz=jaccount.attributes.tz;
				jattributes.timesec=parseInt(""+((new Date().getTime())/1000));
				jattributes.timems=new Date().getTime();
				if (jaccount.attributes.mqttip)
				{
					this.zzweb.utils.log("jdevice.11");
					jattributes.mqttip=jaccount.attributes.mqttip;
					jattributes.mqttipv4=jaccount.attributes.mqttipv4;
					jattributes.mqttipv6=jaccount.attributes.mqttipv6;
					jattributes.mqttuser=jaccount.attributes.mqttuser;
					jattributes.mqttpassword=jaccount.attributes.mqttpassword;
					jattributes.mqttport=jaccount.attributes.mqttport;
					jattributes.mqttsslport=jaccount.attributes.mqttsslport;
					jattributes.mqttwsport=jaccount.attributes.mqttwsport;
					jattributes.mqttwssport=jaccount.attributes.mqttwssport;
				}	
				else
				{
					console.log("jdevice.22", jaccount.attributes.system.attributes);
					jattributes.mqttip=jaccount.attributes.system.attributes.mqttip;
					jattributes.mqttipv4=jaccount.attributes.system.attributes.mqttipv4;
					jattributes.mqttipv6=jaccount.attributes.system.attributes.mqttipv6;
					jattributes.mqttuser=user;
					jattributes.mqttpassword=pwd;
					jattributes.mqttport=jaccount.attributes.system.attributes.mqttport;
					jattributes.mqttsslport=jaccount.attributes.system.attributes.mqttsslport;
					jattributes.mqttwsport=jaccount.attributes.system.attributes.mqttwsport;
					jattributes.mqttwssport=jaccount.attributes.system.attributes.mqttwssport;
					
				}
				
				var jdevices=this.zzweb.zzdevices.get_device(user, pwd, si);
				//this.zzweb.utils.log(jdevices);
				
				if (!jdevices)
					return {'error':true, 'error_code':-2013, 'error_msg':'device error'};
				
				if (jdevices.error)
				{				
					jdevices=this.zzweb.zzdevices.set_device(user, pwd, si, model, owner);
					//this.zzweb.utils.log("jdevice.1", jdevices);
					if (!jdevices)
						return {'error':true, 'error_code':-2013, 'error_msg':'device error'};
					
					if (jdevices.error)
					{
						return jdevices;
					}
					
				}
				//this.zzweb.utils.log("jdevice.2", jdevices);
				
				jattributes.TIMEOUT=jdevices.attributes.config.TIMEOUT;
				jattributes.TIMEOUT_MAX=jdevices.attributes.config.TIMEOUT_MAX;
				jattributes.BOUD=jdevices.attributes.config.BOUD;
				jattributes.remote=jdevices.attributes.config.remote;
				jattributes.VALUES={};
				
				for( var prop in jdevices.attributes.config.values)
				{
					jattributes.VALUES[prop]={};
					//jattributes.VALUES[prop].remote=jdevices.attributes.config.values[prop].remote;
					jattributes.VALUES[prop].S=jdevices.attributes.config.values[prop].S;
					jattributes.VALUES[prop].SV=jdevices.attributes.config.values[prop].SV;
				}
			}	
			
			
			return jattributes;//{'error':false, 'error_code':0, 'error_msg':'', 'attributes':jattributes};
		}
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2013, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	getRandom() 
	{
	  return new Date().getTime()+"."+randomInt(1000, 9999);
	}	
	
	validateUser(user, pwd) 
	{
		try
		{
			if (!fs.existsSync(this.zzweb.home_directory+"/accounts/"+user+".json"))
			{
				this.zzweb.utils.log('FILE NOT FOUND', this.zzweb.home_directory+"/accounts/"+user+".json");
				return false;
			}
			
			var data = fs.readFileSync(this.zzweb.home_directory+"/accounts/"+user+".json", {encoding:'utf8', flag:'r'}); 
			var jdata=JSON.parse(data)
			//this.zzweb.utils.log(pwd, jdata.pwd);
			if (jdata.pwd!=pwd)		
				return false;
			
			return true;
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return false;
		}		
	}

	emailRequestBuilder(code, action, nota)
	{
		try
		{
			var subject="zzigto, "+action+" request";
			var text="The zzigto server received the request to perform the '"+action+"' function to the server. <a href='"+this.zzweb.url+"/?pretty=true&func=exec_confirmed_code&reqfunc="+action+"&code="+code+"'>Click here to confirm</a>";
			if (nota)
				text=text+"<br>"+nota;
			
			this.zzweb.utils.log(subject);
			this.zzweb.utils.log(text);
			return {'subject':subject, 'text':text}
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
		}		
		return null;
	}
	
	get_system(user, pwd)
	{
		try
		{ 
			if (!this.validateUser(user, pwd))
				return {'error':true, 'error_code':-2014, 'error_msg':'Invalid user or password'};
			
			var attributes=fs.readFileSync(this.zzweb.home_directory+"/system/system.json", {encoding:'utf8', flag:'r'});
			var jattributes=JSON.parse(attributes);
		
			return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jattributes};
		}
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2013, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	get_system_admin()
	{
		try
		{ 
			var attributes=fs.readFileSync(this.zzweb.home_directory+"/system/system.json", {encoding:'utf8', flag:'r'});
			var jattributes=JSON.parse(attributes);
		
			return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jattributes};
		}
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2013, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	reset_user_pin(user, pwd, useremail)
	{
		try
		{ 
			if (!this.validateUser(user, pwd))
				return {'error':true, 'error_code':-2014, 'error_msg':'Invalid user or password'};

			var attributes=fs.readFileSync(this.zzweb.home_directory+"/accounts/"+useremail+".json", {encoding:'utf8', flag:'r'});
			var jattributes=JSON.parse(attributes);
			jattributes.code=this.getRandom();
			
			fs.writeFileSync(this.zzweb.home_directory+"/accounts/"+useremail+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
			//var attributes=fs.readFileSync(this.zzweb.home_directory+"/system/system.json", {encoding:'utf8', flag:'r'});
			//var jattributes=JSON.parse(attributes);
		
			return {'error':false, 'error_code':0, 'error_msg':'', 'pincode':jattributes.code};
		}
		catch(e)
		{ 
			//this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-2013, 'error_msg':e.name + ': ' + e.message};
		}		
	}
}



exports.zzaccount=zzaccount;
