const fs = require('fs');

var devices=null;
var jtemp=null;

class zzdevices
{	
    constructor(zzweb) 
    { 
		devices=this;
		this.zzweb=zzweb;

		if (!fs.existsSync(this.zzweb.home_directory+"/devices"))
			fs.mkdirSync(this.zzweb.home_directory+"/devices");
	}

	onClock(time)
    {
		//this.zzweb.utils.log("zzdevices.onClock:", time);
    }
	
    
	set_device(user, pwd, si, model, owner)
	{
		try
		{
			if (user && model && owner && si)
			{
				if (this.zzweb.zzaccount.validateUser(user, pwd))
				{
					if (!fs.existsSync(this.zzweb.home_directory+"/devices/"+user))
						fs.mkdirSync(this.zzweb.home_directory+"/devices/"+user);
										
					var jCureDevice=this.get_device(user, pwd, si)
					if (jCureDevice.error)
					{
						var jmodel=this.zzweb.zzmodels.get_model(user, pwd, owner, model);
						if (jmodel.error)
							return jmodel;
						
						var jattributes=jmodel.attributes;
						//jattributes.version="3.0";
						//jattributes=jmodel;
						//jattributes.config=JSON.parse(attributes);
						jattributes.time=new Date().getTime();
						jattributes.si=si;
						jattributes.owner=owner;
						jattributes.model=model;
						
						fs.writeFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });			
						return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jattributes};
					}
					else
					{
						return {'error':true, 'error_code':-3002, 'error_msg':'Device already exist', obj:-3002};
					}	
				}	
				else
				{
					return {'error':true, 'error_code':-3002, 'error_msg':'Invalid login', obj:-3002};
				}	
			}	
			else
			{
				return {'error':true, 'error_code':-3001, 'error_msg':'Invalid parameters', obj:-3001};
			}	
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message, obj:-3000};
		}		
	}	

	set_device_desc(user, pwd, si, desc)
	{
		try
		{
			this.zzweb.utils.log("set_device_desc", user, pwd, si, desc);
			
			var jdevice=this.get_device(user, pwd, si);
			if (!jdevice || jdevice.error)
				return {'error':true, 'error_code':-3005, 'error_msg':'Device error', obj:-3005};
			
			//this.zzweb.utils.log("jdevice", jdevice);
			
			if (desc)
				jdevice.attributes.config.desc=desc;
			else
				jdevice.attributes.config.desc="";
			
			//this.zzweb.utils.log("DEVICE", jdevice.attributes);
			
			fs.writeFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", JSON.stringify(jdevice.attributes, null, 2), { mode: 0o777 });

			return this.get_device(user, pwd, si);
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message, obj:-3000};
		}		
	}	

	set_device_alias(user, pwd, si, alias)
	{
		try
		{
			this.zzweb.utils.log("set_device_alias", user, pwd, si, alias);
			
			var jdevice=this.get_device(user, pwd, si);
			if (!jdevice || jdevice.error)
				return {'error':true, 'error_code':-3005, 'error_msg':'Device error', obj:-3005};
			
			//this.zzweb.utils.log("jdevice", jdevice);
			
			if (alias)
				jdevice.attributes.config.alias=alias;
			else
				jdevice.attributes.config.alias="";
			
			//this.zzweb.utils.log("DEVICE", jdevice.attributes);
			
			fs.writeFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", JSON.stringify(jdevice.attributes, null, 2), { mode: 0o777 });

			return this.get_device(user, pwd, si);
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message, obj:-3000};
		}		
	}	
	
	set_device_pin_desc(user, pwd, si, pin, desc)
	{
		try
		{
			this.zzweb.utils.log("set_device_pin_desc", user, pwd, si, pin, desc);
			
			var jdevice=this.get_device(user, pwd, si);
			if (!jdevice || jdevice.error)
				return {'error':true, 'error_code':-3005, 'error_msg':'Device error', obj:-3005};
			
			//this.zzweb.utils.log("jdevice", jdevice);
			
			if (desc)
				jdevice.attributes.config.values[pin].desc=desc;
			else
				jdevice.attributes.config.values[pin].desc="";
			
			//this.zzweb.utils.log("DEVICE", jdevice.attributes);
			
			fs.writeFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", JSON.stringify(jdevice.attributes, null, 2), { mode: 0o777 });

			return this.get_device(user, pwd, si);
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message, obj:-3000};
		}		
	}	
	
	set_device_pin_remote(user, pwd, si, pin, remote)
	{
		try
		{
			this.zzweb.utils.log("set_device_pin_alias", user, pwd, si, pin, remote);
			
			var jdevice=this.get_device(user, pwd, si);
			if (!jdevice || jdevice.error)
				return {'error':true, 'error_code':-3005, 'error_msg':'Device error', obj:-3005};
			
			//this.zzweb.utils.log("jdevice", jdevice);
			
			if (remote)
				jdevice.attributes.config.values[pin].remote=remote;
			else
				jdevice.attributes.config.values[pin].remote="";
			
			//this.zzweb.utils.log("DEVICE", jdevice.attributes);
			
			fs.writeFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", JSON.stringify(jdevice.attributes, null, 2), { mode: 0o777 });

			return this.get_device(user, pwd, si);
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message, obj:-3000};
		}		
	}	

	set_device_remote(user, pwd, si, remote)
	{
		try
		{
			this.zzweb.utils.log("set_device_remote", user, pwd, si, remote);
			
			var jdevice=this.get_device(user, pwd, si);
			if (!jdevice || jdevice.error)
				return {'error':true, 'error_code':-3005, 'error_msg':'Device error', obj:-3005};
			
			//this.zzweb.utils.log("jdevice", jdevice);
			
			if (remote)
				jdevice.attributes.config.remote=remote;
			else
				jdevice.attributes.config.remote="";
			
			//this.zzweb.utils.log("DEVICE", jdevice.attributes);
			
			fs.writeFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", JSON.stringify(jdevice.attributes, null, 2), { mode: 0o777 });

			return this.get_device(user, pwd, si);
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3000, 'error_msg':e.name + ': ' + e.message, obj:-3000};
		}		
	}	
	
	get_device(user, pwd, si)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				if (!fs.existsSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json"))
					return {'error':true, 'error_code':-3005, 'error_msg':'Device not found', obj:-3005};
				
				var attributes=fs.readFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", {encoding:'utf8', flag:'r'});
				var jattributes=JSON.parse(attributes);
				return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jattributes};
					
			}	
			else
				return {'error':true, 'error_code':-3003, 'error_msg':'Invalid login', obj:-3003};
			
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3003, 'error_msg':e.name + ': ' + e.message, obj:-3003};
		}		
	}
	
	delete_device(user, pwd, si)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				if (!fs.existsSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json"))
					return {'error':true, 'error_code':-3005, 'error_msg':'Device not found', obj:-3005};
				
				var attributes=fs.readFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json", {encoding:'utf8', flag:'r'});
				fs.unlinkSync(this.zzweb.home_directory+"/devices/"+user+"/"+si+".json");
				
				return {'error':false, 'error_code':0, 'error_msg':''};
					
			}	
			else
				return {'error':true, 'error_code':-3003, 'error_msg':'Invalid login', obj:-3003};
			
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3003, 'error_msg':e.name + ': ' + e.message, obj:-3003};
		}		
	}
	
		
	get_device_list(user, pwd)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				var jresult={'devices':{}};
				
				try
				{
					fs.readdirSync(this.zzweb.home_directory+"/devices/"+user+"/").forEach(file => {
						if (file.endsWith(".json"))
						{
							//devices.zzweb.utils.log("passo.get_device_pretty_list.1.file", file);
							var fileContent=fs.readFileSync(this.zzweb.home_directory+"/devices/"+user+"/"+file, {encoding:'utf8', flag:'r'});
							if (fileContent)
							{
								//devices.zzweb.utils.log("passo.get_device_pretty_list.1", fileContent);
								var jfileContent=JSON.parse(fileContent);
								//devices.zzweb.utils.log("passo.get_device_pretty_list.2", jfileContent);
								if (jfileContent.si)
								{
									jresult.devices[jfileContent.si]=jfileContent;
								}
							}
						}
					});
				}	
				catch(e)
				{ 
					//this.zzweb.utils.log(e);
					return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':{'devices':{}}};
				}		
				return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jresult};
			}	
			else
				return {'error':true, 'error_code':-3008, 'error_msg':'Invalid login'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3007, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	_get_data(user, pwd, deviceName, msfrom, msto)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				jtemp={};
				
				var filenames=fs.readdirSync(this.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/data"); 
				
				filenames.forEach(file =>  
				{
					//for (var i=0; i<files.length; i++)
					//{
						var items=file.split(".");
						if (items && items[0])
						{
							if (Number(items[0])>=Number(msfrom) && Number(items[0])<=Number(msto))
							{
								this.zzweb.utils.log("OK", items[0]);
								var data = fs.readFileSync(devices.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/data/"+items[0]+".json", {encoding:'utf8', flag:'r'}); 
								this.zzweb.utils.log("passo.a.1");
								var jdata=JSON.parse(data);
								if (jdata)
								{
									jtemp[items[0]]=jdata;
									this.zzweb.utils.log("passo.a.2", jtemp);
								}						
								else
									this.zzweb.utils.log("passo.a.3");
							}
							else
								this.zzweb.utils.log("SKIP", items[0], Number(items[0]), msfrom, msto);
						}
					//}
					//this.zzweb.utils.log("passo.a.3", jtemp);
					//return {'error':false, 'error_code':0, 'error_msg':'', 'data':jresult};
				}); 
				this.zzweb.utils.log("passo.a.3", jtemp);
				return {'error':false, 'error_code':0, 'error_msg':'', 'data':jtemp};
				
			}	
			else
				return {'error':true, 'error_code':-3008, 'error_msg':'Invalid login'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3007, 'error_msg':e.name + ': ' + e.message};
		}		
	}
	
	get_data(user, pwd, deviceName, year, month)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				var FILE=devices.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/data/"+this.zzweb.utils.lPad(year, 4, "0")+this.zzweb.utils.lPad(month, 2, "0");
				var data = fs.readFileSync(FILE+".json", {encoding:'utf8', flag:'r'}); 
				var jdata=JSON.parse(data);
				
				var F=devices.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/tick/tick.json";
				var tick = fs.readFileSync(F, {encoding:'utf8', flag:'r'}); 
				var jtick=JSON.parse(tick);
				jdata.tick=jtick;
				
				
				return {'error':false, 'error_code':0, 'error_msg':'', 'data':jdata};				
			}	
			else
				return {'error':true, 'error_code':-3008, 'error_msg':'Invalid login'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3007, 'error_msg':e.name + ': ' + e.message};
		}		
	}	
	
	get_tick_data(user, pwd, deviceName)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				var F=devices.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/tick/tick.json";
				var tick = fs.readFileSync(F, {encoding:'utf8', flag:'r'}); 
				var jtick=JSON.parse(tick);
				
				
				return {'error':false, 'error_code':0, 'error_msg':'', 'data':jtick};				
			}	
			else
				return {'error':true, 'error_code':-3008, 'error_msg':'Invalid login'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3007, 'error_msg':e.name + ': ' + e.message};
		}		
	}	
	
	delete_tick(user, pwd, deviceName)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				var F=devices.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/tick/tick.json";
				fs.unlinkSync(F);
				
				return {'error':false, 'error_code':0, 'error_msg':''};				
			}	
			else
				return {'error':true, 'error_code':-3008, 'error_msg':'Invalid login'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3007, 'error_msg':e.name + ': ' + e.message};
		}		
	}	
	
	delete_data(user, pwd, deviceName, year, month)
	{
		try
		{
			if (this.zzweb.zzaccount.validateUser(user, pwd))
			{
				var F=devices.zzweb.home_directory+"/devices/"+user+"/"+deviceName+"/data/"+this.zzweb.utils.lPad(year, 4, "0")+this.zzweb.utils.lPad(month, 2, "0")+".json";
				fs.unlinkSync(F); 				
				
				return {'error':false, 'error_code':0, 'error_msg':''};				
			}	
			else
				return {'error':true, 'error_code':-3008, 'error_msg':'Invalid login'};
		}	
		catch(e)
		{ 
			this.zzweb.utils.log(e);
			return {'error':true, 'error_code':-3007, 'error_msg':e.name + ': ' + e.message};
		}		
	}	
}



exports.zzdevices=zzdevices;
