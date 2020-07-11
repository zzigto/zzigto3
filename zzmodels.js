const fs = require('fs');


class zzmodels
{	
    constructor(zzweb) 
    { 
		this.zzweb=zzweb;

		if (!fs.existsSync(this.zzweb.home_directory+"/models"))
			fs.mkdirSync(this.zzweb.home_directory+"/models");
	}

	onClock(time)
    {
		//this.zzweb.utils.log("zzdevices.onClock:", time);
    }
	
    
	get_models_list(user, pwd)
	{
		try
		{
			if (user && pwd)
			{
				if (this.zzweb.zzaccount.validateUser(user, pwd))
				{
					if (!fs.existsSync(this.zzweb.home_directory+"/models/"+user))
						fs.mkdirSync(this.zzweb.home_directory+"/models/"+user);
					
					var jresult={'models':[]};
					
					fs.readdirSync(this.zzweb.home_directory+"/models/"+user+"/").forEach(file => {
						if (file.endsWith(".json"))
						{
							/*var fileContent=fs.readFileSync(this.zzweb.home_directory+"/models/"+user+"/"+file, {encoding:'utf8', flag:'r'});
							if (fileContent)
							{
								var jfileContent=JSON.parse(fileContent);
								if (jfileContent.si)
								{
									jresult.devices[jfileContent.si]=jfileContent;
								}
							}*/
							jresult.models[jresult.models.length]=file;
						}
					});
					return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jresult};
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

	get_model(user, pwd, owner, model)
	{
		try
		{
			if (user && pwd)
			{
				if (this.zzweb.zzaccount.validateUser(user, pwd))
				{
					var attributes=fs.readFileSync(this.zzweb.home_directory+"/models/"+owner+"/"+model, {encoding:'utf8', flag:'r'});
					var jattributes=JSON.parse(attributes);
					return {'error':false, 'error_code':0, 'error_msg':'', 'attributes':jattributes};
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

	set_model(user, pwd, model, attributes)
	{
		try
		{
			if (user && pwd)
			{
				if (this.zzweb.zzaccount.validateUser(user, pwd))
				{
					if (!fs.existsSync(this.zzweb.home_directory+"/models/"+user))
						fs.mkdirSync(this.zzweb.home_directory+"/models/"+user);
					
					if (!attributes)
						return {'error':true, 'error_code':-3002, 'error_msg':'Invalid attributes', obj:-3002};
					
					var jattributes=JSON.parse(attributes);
					fs.writeFileSync(this.zzweb.home_directory+"/models/"+user+"/"+model, JSON.stringify(jattributes, null, 2), { mode: 0o777 });			
										
					return {'error':false, 'error_code':0, 'error_msg':'', obj:{}};
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
	
	delete_model(user, pwd, model)
	{
		try
		{
			if (user && pwd)
			{
				if (this.zzweb.zzaccount.validateUser(user, pwd))
				{
					if (!fs.existsSync(this.zzweb.home_directory+"/models/"+user))
						fs.mkdirSync(this.zzweb.home_directory+"/models/"+user);
					
					if (!fs.existsSync(this.zzweb.home_directory+"/models/"+user+"/"+model))
						return {'error':true, 'error_code':-3005, 'error_msg':'Model not found', obj:-3005};
					
					fs.unlinkSync(this.zzweb.home_directory+"/models/"+user+"/"+model);
										
					return {'error':false, 'error_code':0, 'error_msg':'', obj:{}};
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
}



exports.zzmodels=zzmodels;
