var serviceUrl="";
//var pageUrl=serviceUrl+"/dev/material-dashboard-master/material-dashboard-master/examples";
//var pageUrl="/dev/material-dashboard-master/material-dashboard-master/examples";
var pageUrl="/public/amin/html";
var partPath="htmlpart";
var demoD=null;
var use_mail=false;
var demoModelOwner=null;

function getUrl()
{
	if (window.location.protocol=="https:")
	{
		if (window.location.port=="")
			return "https://"+serviceUrl;
		else
			return "https://"+serviceUrl+":"+window.location.port;
	}
	else
	{
		if (window.location.port=="")
			return "http://"+serviceUrl;
		else
			return "http://"+serviceUrl+":"+window.location.port;
	}
}

function httpGet(url)
{
	try
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", url, false );
		xmlHttp.send( null );
		
		return xmlHttp.responseText;
	}
	catch(e)
	{
		alert(e);
	}
}

function httpPost(url, raw)
{   
	try
	{        
		var xhr = new XMLHttpRequest();  
		xhr.open("POST", url, false);  
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.send(raw);
		return xhr.responseText;
	}    
	catch(e)
	{
		alert(e);
	}
}

function nvl(v, d)
{
    if (v==null || v===undefined)
		return d;
	
	return v;
}

function nnvl(v, d)
{
    if (v=="" || v==null || v===undefined)
		return d;
	
	return v;
}

function setCookie(params)
{
    document.cookie = "params="+params;
}

function getCookie()
{
	try
	{        
		var params={};
		var ck=document.cookie;
		var items=ck.split(";");
		for (var i=0; i<items.length; i++)
		{
			var tocken=items[i].split("=");
			if (tocken && tocken.length>1)
			{
				params[tocken[0].trim()]=tocken[1].trim();
			}
			
		}
		if (params && params.params)
			return JSON.parse(params.params);
		else
			return null;
	}    
	catch(e)
	{
		return null;
	}	
}

function setFunc(mode, params)
{
	document.getElementById("ResetUserPin").style.display="none";
	if (mode==0) //not logged
	{
		document.getElementById("Desktop").style.display="none";	
		document.getElementById("CreateAccount").style.display="block";	
		document.getElementById("EditAccount").style.display="none";	
		document.getElementById("Login").style.display="block";	
		document.getElementById("PasswordChange").style.display="none";	
		document.getElementById("PasswordRecovery").style.display="block";	
		document.getElementById("Browser").style.display="none";	
		//document.getElementById("DemoDevice").style.display="none";	
		document.getElementById("ManageDevice").style.display="none";	
		document.getElementById("ManageModels").style.display="none";	
		document.getElementById("DemoDevice").style.display="none";	
		document.getElementById("Logout").style.display="none";	
		
		if (demoD) demoD.stopExec();
		demoD=null;
	}
	if (mode==1) //logged
	{
		document.getElementById("Desktop").style.display="block";	
		document.getElementById("CreateAccount").style.display="none";	
		document.getElementById("EditAccount").style.display="block";	
		document.getElementById("Login").style.display="none";	
		document.getElementById("PasswordChange").style.display="block";	
		document.getElementById("PasswordRecovery").style.display="none";	
		document.getElementById("Browser").style.display="block";	
		//document.getElementById("DemoDevice").style.display="block";	
		document.getElementById("ManageDevice").style.display="block";	
		if (!params || params.hm=="0")
			document.getElementById("ManageModels").style.display="none";	
		else
			document.getElementById("ManageModels").style.display="block";	
		document.getElementById("DemoDevice").style.display="block";
		document.getElementById("DemoDeviceTitle").innerHTML="Demo Device Start";
		document.getElementById("DemoDeviceIcon").innerHTML="play_arrow";
		document.getElementById("Logout").style.display="block";
		
		if (params && params.isSuperUser)
			document.getElementById("ResetUserPin").style.display="block";
		
		//if (demoD) demo.stopExec();
		//var params=getCookie();

		if (!demoD)
		{
			//var params=getCookie();
			demoD=new deviceDemo(params.user, params.pwd, demoModelOwner);
		}
		
		
		return;
	}
}

function loadPart(fileName)
{
	var params=getCookie();
	
	if (params && params.user && params.pwd)
		setFunc(1, params);
	else
		setFunc(0, null);
	return httpGet(partPath+"/"+fileName);
}

function onStartInfo()
{   
	try
	{  			
		var ret=httpGet(getUrl()+'/?pretty=true&func=get_start_info');
		var jret=JSON.parse(ret);
		use_mail=jret.info.usemail;
		demoModelOwner=jret.info.demoModelOwner;
	}    
	catch(e)
	{
		alert(e);
	}
}



function onLoad()
{
	onStartInfo();
	var params=getCookie();
	
	if (params && params.user)
	{
		if (params && params.pwd)
		{
			setFunc(1, params);
			document.getElementById("curUser").innerHTML=params.user;
						
			onselectItem(document.getElementById("Desktop"));
			return;
		}
	}
	setFunc(0, null);
	onselectItem(document.getElementById("Login"));
}

function onselectItem(obj)
{
	document.getElementById("Desktop").className="nav-item";	
	document.getElementById("CreateAccount").className="nav-item";	
	document.getElementById("EditAccount").className="nav-item";	
	document.getElementById("Login").className="nav-item";	
	document.getElementById("PasswordChange").className="nav-item";	
	document.getElementById("PasswordRecovery").className="nav-item";	
	document.getElementById("Browser").className="nav-item";	
	//document.getElementById("DemoDevice").className="nav-item";	
	document.getElementById("ManageDevice").className="nav-item";	
	document.getElementById("ManageModels").className="nav-item";
	document.getElementById("Logout").className="nav-item";	
	document.getElementById("ResetUserPin").className="nav-item";	
	
	obj.className="nav-item active";
		
	var params=getCookie();
	
	if (params && params.user && params.pwd)
		setFunc(1, params);
	else
		setFunc(0, null);
		
	
	if (obj.id=="Browser")
	{
		var win = window.open("browser.html", '_blank');
		win.focus();
	}
	else
	{
		var part=httpGet(partPath+"/"+obj.id+".html");		
		document.getElementById("content-html").innerHTML=part;
		
		if (obj.id=="EditAccount")
		{
			onEditAccountGet();
		}
		
		if (obj.id=="ManageDevice")
		{
			onManageDevice();
		}
		
		if (obj.id=="ManageModels")
		{
			onManageModels();
		}
				
		if (obj.id=="PasswordRecovery")
		{
			if (use_mail)
				document.getElementById("account.pin.div").style.display="none";
		}
	}
	
}

function onLogin()
{
	try
	{  	
		if (!document.getElementById("user").value)
		{
			alert ('Username/email is null');
			return;
		}
		if (!document.getElementById("pwd").value)
		{
			alert ('Password is null');
			return;
		}
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=login_user&user='+document.getElementById("user").value+'&pwd='+document.getElementById("pwd").value);
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
			var jcookies=null;
			if (jret.attributes.isSuperUser)
				jcookies={'user':document.getElementById("user").value, 'pwd':document.getElementById("pwd").value, 'hm':jret.attributes.hm, 'isSuperUser':true};
			else
				jcookies={'user':document.getElementById("user").value, 'pwd':document.getElementById("pwd").value, 'hm':jret.attributes.hm};
			
			setCookie(JSON.stringify(jcookies));
			
			window.location="main.html";
		}
		else
		{
			setCookie("");
			alert(jret.error_msg);		
		}
	}    
	catch(e)
	{
		alert(e);
	}	
}

function onLogout()
{
	try
	{  	
		if (confirm("Do you want to Logout?"))
		{  	
			document.getElementById("DemoDeviceTitle").innerHTML="Demo Device Start";
			document.getElementById("DemoDeviceIcon").innerHTML="play_arrow";
			if (demoD)
				demoD.stopExec();
	
			setCookie("");
			onselectItem(document.getElementById("Login"));
		}    
	}    
	catch(e)
	{
		alert(e);
	}	
}

function onEditAccountGet()
{   
	try
	{ 	
		var params=getCookie();
		
		if (!params || !params.user || !params.pwd)
			return;

		var ret=httpGet(getUrl()+'/?pretty=true&func=get_account&user='+params.user+'&pwd='+params.pwd);
		var jret=JSON.parse(ret);
		
		document.getElementById("account.hm").value=nvl(jret.attributes.hm, "");
		document.getElementById("account.timeZone").value=nvl(jret.attributes.tz, "");
		document.getElementById("account.user").value=nvl(jret.attributes.user, "");
		//document.getElementById("account.pwd").value=nvl(jret.attributes.pwd, "");
		
		document.getElementById("account.company").value=nvl(jret.attributes.company, "");
		document.getElementById("account.firstName").value=nvl(jret.attributes.firstName, "");
		document.getElementById("account.lastName").value=nvl(jret.attributes.lastName, "");
		document.getElementById("account.address").value=nvl(jret.attributes.address, "");
		document.getElementById("account.city").value=nvl(jret.attributes.city, "");
		document.getElementById("account.country").value=nvl(jret.attributes.country, "");
		document.getElementById("account.postalCode").value=nvl(jret.attributes.postalCode, "");
		
		
		document.getElementById("account.mqttip").value=nvl(jret.attributes.mqttip, "");
		document.getElementById("account.mqttuser").value=nvl(jret.attributes.mqttuser, "");
		document.getElementById("account.mqttpassword").value=nvl(jret.attributes.mqttpassword, "");
		document.getElementById("account.mqttport").value=nvl(jret.attributes.mqttport, "");
		document.getElementById("account.mqttwsport").value=nvl(jret.attributes.mqttwsport, "");
		document.getElementById("account.mqttsslport").value=nvl(jret.attributes.mqttsslport, "");
		document.getElementById("account.mqttwssport").value=nvl(jret.attributes.mqttwssport, "");
		
	}    
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountMore()
{   
	try
	{ 	
		if(document.getElementById("moreInfo").style.display=="none")
		{ 	
			document.getElementById("moreInfoButton").innerHTML="Hide Optional info";
			document.getElementById("moreInfo").style.display="block"
		}
		else
		{ 	
			document.getElementById("moreInfoButton").innerHTML="Show Optional info";
			document.getElementById("moreInfo").style.display="none"
		}


	}
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountMorePersonalInfo()
{   
	try
	{ 	
		if(document.getElementById("morePersonalInfo").style.display=="none")
		{ 	
			document.getElementById("morePersonalInfoButton").innerHTML="Hide Personal info";
			document.getElementById("morePersonalInfo").style.display="block"
		}
		else
		{ 	
			document.getElementById("morePersonalInfoButton").innerHTML="Show Personal info";
			document.getElementById("morePersonalInfo").style.display="none"
		}


	}
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountSet()
{   
	try
	{ 	
		if (confirm("Do you want to save account info?"))
		{ 	
			var params=getCookie();
			
			if (!params || !params.user || !params.pwd)
			{ 	
				alert("Invalid userName or Password");
				return;
			}	
			
			var jsttributes={
				hm:document.getElementById("account.hm").value,
				tz:document.getElementById("account.timeZone").value,
				user:document.getElementById("account.user").value,
				pwd:params.pwd,
				
				company:document.getElementById("account.company").value,
				firstName:document.getElementById("account.firstName").value,
				lastName:document.getElementById("account.lastName").value,
				address:document.getElementById("account.address").value,
				city:document.getElementById("account.city").value,
				country:document.getElementById("account.country").value,
				postalCode:document.getElementById("account.postalCode").value,
				
				
				mqttip:document.getElementById("account.mqttip").value,
				mqttuser:document.getElementById("account.mqttuser").value,
				mqttpassword:document.getElementById("account.mqttpassword").value,
				mqttport:document.getElementById("account.mqttport").value,
				mqttwsport:document.getElementById("account.mqttwsport").value,
				mqttsslport:document.getElementById("account.mqttsslport").value,
				mqttwssport:document.getElementById("account.mqttwssport").value,
				
			};
			
			if (!jsttributes.user)
			{
				alert ('Username is null');
				return;
			}
			if (!jsttributes.pwd)
			{
				alert ('Password is null');
				return;
			}
					
			//var ret=httpGet(getUrl()+'/?pretty=true&func=set_account&user='+params.user+'&pwd='+params.pwd+'&attributes='+JSON.stringify(jsttributes));
			
			var ret=httpPost(getUrl()+'/?pretty=true&func=set_account&user='+params.user+'&pwd='+params.pwd, JSON.stringify(jsttributes))
			
			var jret=JSON.parse(ret);
			if (!jret.error && jret.error_code==0)
			{
			}
			else
				alert(jret.error_msg);
		}    
	}    
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountCreate()
{   
	try
	{ 	
		var jsttributes={
			user:document.getElementById("account.user").value,
			pwd:document.getElementById("account.pwd").value,
			pwdcnf:document.getElementById("account.pwdcnf").value,
			hm:0,
			tz:0,
			mqttip:"",
			mqttuser:"",
			mqttpassword:"",
			mqttport:"",
			mqttwsport:"",
			mqttsslport:"",
			mqttwssport:""
		};
		
		if (!jsttributes.user)
		{
			alert ('Username is null');
			return;
		}
		if (!jsttributes.pwd)
		{
			alert ('Password is null');
			return;
		}
		if (!jsttributes.pwdcnf)
		{
			alert ('Password confirmation is null');
			return;
		}
		if (jsttributes.pwd!=jsttributes.pwdcnf)
		{
			alert ('Invalid password confirmation');
			return;
		}
		var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=create_account&attributes='+JSON.stringify(jsttributes));
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
			setCookie("");
			onselectItem(document.getElementById("Login"));
			
			if (jret.info)
				alert(jret.info.message);
			else
				alert("Your request has been notified by email, please confirm it");			
		}
		else
			alert(jret.error_msg);
	}    
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountRemove()
{   
	try
	{ 	
		if (confirm("Do you want to permantly destroy the current account"))
		{ 	
			if (confirm("Are you sure?"))
			{ 	
	
				var params=getCookie();
				if (params && params.user && params.pwd)
				{
					var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=delete_account&user='+params.user+'&pwd='+params.pwd);
					var jret=JSON.parse(ret);
					if (!jret.error && jret.error_code==0)
					{
						setCookie("");
						onselectItem(document.getElementById("Login"));
						alert("Your request has been notified by email, please confirm it");
					}
					else
						alert(jret.error_msg);
				}
				else		
					alert("Invalid login");
			}    
		}    
	}    
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountRecoveryPassword()
{   
	try
	{  	
		if (!document.getElementById("account.user").value)
		{
			alert ('Invalid email');
			return;
		}
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=pwd_recovery_account&user='+document.getElementById("account.user").value+'&pin='+document.getElementById("account.pin").value);
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
			if (jret.info)
				alert(jret.info.message+"'"+jret.info.newpwd+"'");
			else
				alert("Your request has been notified by email, please confirm it");
		}
		else
			alert(jret.error_msg);		
	}    
	catch(e)
	{
		alert(e);
	}
}

function onEditAccountPasswordChange()
{   
	try
	{ 	
		var params=getCookie();
		if (params && params.user && params.pwd)
		{
			var jsttributes={
				newpwd:document.getElementById("account.newpwd").value,
				pwdcnf:document.getElementById("account.newpwdcnf").value
			};
			
			if (!jsttributes.newpwd)
			{
				alert ('New Password is null');
				return;
			}
			if (!jsttributes.pwdcnf)
			{
				alert ('Password Confirm is null');
				return;
			}
			if (jsttributes.newpwd!=jsttributes.pwdcnf)
			{
				alert ('Password Confirm is invalid');
				return;
			}
			
			
			var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=pwd_set_account&user='+params.user+'&pwd='+params.pwd+'&attributes='+JSON.stringify(jsttributes));
			var jret=JSON.parse(ret);
			if (!jret.error && jret.error_code==0)
			{
				setCookie("");
				onselectItem(document.getElementById("Login"));
				if (jret.info)
					alert(jret.info.message);
				else
					alert("Your request has been notified by email, please confirm it");
			}
			else
				alert(jret.error_msg);			
		}
		else		
			alert("Invalid login");
	}    
	catch(e)
	{
		alert(e);
	}
}

function onManageDevice()
{   
	try
	{ 
		var params=getCookie();
		if (params && params.user && params.pwd)
		{
			var ret=httpGet(getUrl()+'/?pretty=true&func=get_device_list&user='+params.user+'&pwd='+params.pwd);
			var jret=JSON.parse(ret);
			if (jret.attributes.devices)
			{ 
				var tbody=document.getElementById("bodyDeviceList");
				tbody.innerHTML="";
				var tag="";
				for (var deviceName in jret.attributes.devices) 
				{
					var device=jret.attributes.devices[deviceName];
					
					var tr = document.createElement('tr');
					tr._params=params;
					tr._device=device;
					tr._devices=jret.attributes.devices;
					tr.onclick=function()
					{
						onManageDevicePin(this._device);
					}					
					tbody.appendChild(tr);
					
						var td = document.createElement('td');
						td.innerHTML=device.si;
						tr.appendChild(td);
					
						var td = document.createElement('td');
						td.innerHTML=nvl(device.config.desc, "");
						td._params=params;
						td._device=device;
						td.onclick=function()
						{
							var desc=prompt("Enter device description", this._device.config.desc);
							if (desc!=null)
							{
								var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_desc&user='+this._params.user+'&pwd='+this._params.pwd+"&si="+this._device.si+"&desc="+desc);
								var jnd=JSON.parse(nd);
								if (jnd.attributes.config.desc)
								{ 							
									this.innerHTML=jnd.attributes.config.desc;
								}
								else
									this.innerHTML=jnd.attributes.si;
							}
						}
						tr.appendChild(td);
						
						var td = document.createElement('td');
						td.innerHTML=nvl(device.config.remote, "");
						td._params=params;
						td._device=device;
						td.onclick=function()
						{
							var remote=prompt("Enter remote device Serial Number", this._device.config.remote);
							if (remote!=null)
							{
								var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_remote&user='+this._params.user+'&pwd='+this._params.pwd+"&si="+this._device.si+"&remote="+remote);
								var jnd=JSON.parse(nd);
								if (jnd.attributes.config.remote)
								{ 							
									this.innerHTML=jnd.attributes.config.remote;
								}
								else
									this.innerHTML="";
							}
						}
						tr.appendChild(td);
						
						var td = document.createElement('td');
						td.innerHTML="Delete";
						td.className="btn btn-primary pull-right";
						td._params=params;
						td._device=device;
						td.onclick=function()
						{
							if (confirm('Do you want to delete devics '+this._device.si+' ?'))
							{
								var nd=httpGet(getUrl()+'/?pretty=true&func=delete_device&user='+this._params.user+'&pwd='+this._params.pwd+"&si="+this._device.si);
								var jnd=JSON.parse(nd);
								if (jnd.error)
								{ 			
									alert(jnd.error_msg);
								}
								else
									onManageDevice();
							}
						}
						tr.appendChild(td);
						
				}
			}    
			else
				alert(jret.error_msg);		
		}    
		else
			alert("Invalid login");			
		
	}    
	catch(e)
	{
		alert(e);
	}
}

function onManageDevicePin(device)
{   
	try
	{ 
		var params=getCookie();
		if (params && params.user && params.pwd)
		{
			var tbody=document.getElementById("bodyPinList");
			tbody.innerHTML="";
			
			
			if (device && device.config && device.config.values)
			{ 
				var tlabel=document.getElementById("labelPinList");
				tlabel.innerHTML="Pin list of the current device '"+device.si+"'";
				
				var tag="";
				for (var pinName in device.config.values) 
				{
					var pin=device.config.values[pinName];
					
					var tr = document.createElement('tr');
					tbody.appendChild(tr);
					
						var td = document.createElement('td');
						td.innerHTML=pinName;
						tr.appendChild(td);
					
						var td = document.createElement('td');
						td.innerHTML=nvl(pin.desc, "");
						td._params=params;
						td._device=device;
						td._pin=pin;
						td._pinName=pinName;
						td.onclick=function()
						{
							var desc=prompt("Enter pin description", this._pin.desc);
							if (desc!=null)
							{
								var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_pin_desc&user='+this._params.user+'&pwd='+this._params.pwd+"&si="+this._device.si+"&pin="+this._pinName+"&desc="+desc);
								var jnd=JSON.parse(nd);
								if (jnd.attributes.config.values[this._pinName].desc)
								{ 							
									this.innerHTML=jnd.attributes.config.values[this._pinName].desc;
								}
								else
									this.innerHTML="";
							}
						}
						tr.appendChild(td);						
				}
			}    
			else
				alert(jret.error_msg);
		}    
		else
			alert("Invalid login");			
		
	}    
	catch(e)
	{
		alert(e);
	}
}

function onManageModels()
{   
	try
	{ 
		var params=getCookie();
		if (params && params.user && params.pwd)
		{
			document.getElementById("json").onchange = function(e) 
			{ 
				onManageModelsSelectFile();
			};
			//document.getElementById("jsonExec").onclick=onManageModelsSelectFile;
			
			var tbody=document.getElementById("bodyModelsList");
			tbody.innerHTML="";
			
			var ret=httpGet(getUrl()+'/?pretty=true&func=get_models_list&user='+params.user+'&pwd='+params.pwd);
			var jret=JSON.parse(ret);
			if (jret.error)
			{ 
				alert(jret.error_msg);
				return;
			}
			
			if (jret.attributes.models)
			{ 
					for (var i=0; i<jret.attributes.models.length; i++) 
					{
						var modelName=jret.attributes.models[i];
						var tr = document.createElement('tr');
						tbody.appendChild(tr);
						
							var td = document.createElement('td');
							td.innerHTML=modelName;
							td._model=modelName;
							td._params=params;
							td.onclick=function()
							{
								document.getElementById("sourceModelRow").style.display="block";	
								document.getElementById("sourceModelTitle").innerHTML=this._model;	
								var viewer=document.getElementById("sourceModel");	
								if (viewer)
								{								
									var ret=httpGet(getUrl()+'/?pretty=true&func=get_model&user='+this._params.user+'&pwd='+this._params.pwd+"&model="+this._model+"&owner="+this._params.user);
									var jret=JSON.parse(ret);
									if (jret.error)
									{ 
										alert(jret.error_msg);
										return;
									}								
									viewer.value=JSON.stringify(jret.attributes, null, 2);
								}							
								
							}							
							tr.appendChild(td);							
								

							var td = document.createElement('td');
							td._model=modelName;
							td._params=params;
							td.innerHTML="Delete";
							td.className="btn btn-primary pull-right";
							td.onclick=function()
							{
								if(confirm("Do you want to delete the model?"))
								{
									var ret=httpGet(getUrl()+'/?pretty=true&func=delete_model&user='+this._params.user+'&pwd='+this._params.pwd+"&model="+this._model);
									var jret=JSON.parse(ret);
									if (jret.error)
									{ 
										alert(jret.error_msg);
										return;
									}
									onManageModels();																													
								}
							}							
							tr.appendChild(td);
														
					}
			}    
			else
				alert(jret.error_msg);		
		}    
		
	}    
	catch(e)
	{
		alert(e);
	}
}

function onManageModelsSelectFile()
{   
	try
	{ 
		var params=getCookie();
		if (params && params.user && params.pwd)
		{
			var fileToLoad = document.getElementById("json").files[0];
			if (!fileToLoad || !fileToLoad.name)
			{ 
				alert("Invalid file name");
				return;
			}

			var fileReader = new FileReader();
			fileReader.onload = function(fileLoadedEvent)
			{
				var textFromFileLoaded = fileLoadedEvent.target.result;
				if (!textFromFileLoaded)
				{ 
					alert("The file is empty");
					document.getElementById("json").value = '';
					return;
				}
				
				try
				{ 
					if (!fileToLoad || !fileToLoad.name)
					{ 
						alert("Invalid file name");
						document.getElementById("json").value = '';
						return;
					}
						
					var json=JSON.parse(textFromFileLoaded);
					
					//var ret=httpGet(getUrl()+'/?pretty=true&func=set_model&user='+params.user+'&pwd='+params.pwd+"&model="+fileToLoad.name+"&attributes="+JSON.stringify(json));
					var ret=httpPost(getUrl()+'/?pretty=true&func=set_model&user='+params.user+'&pwd='+params.pwd+"&model="+fileToLoad.name, JSON.stringify(json));
					var jret=JSON.parse(ret);
					if (jret.error)
					{ 
						alert(jret.error_msg);
						document.getElementById("json").value = '';
						return;
					}
					onManageModels();
				}
				catch(e)
				{ 
					alert("The file is not json format");
					document.getElementById("json").value = '';
					return;
				}
																						 
			};
			fileReader.readAsText(fileToLoad, "UTF-8");
		}    
	}    
	catch(e)
	{
		alert(e);
	}
}

function onManageModelsHideText()
{   
	try
	{ 
		document.getElementById("sourceModelRow").style.display="none";
	}    
	catch(e)
	{
		alert(e);
	}
}
    

function onDeviceDemo()
{
	if (demoD && demoD.STATUS)
	{
		if (!confirm("Do you want to stop demo device?"))
			return;
		
		document.getElementById("DemoDeviceTitle").innerHTML="Demo Device Start";
		document.getElementById("DemoDeviceIcon").innerHTML="play_arrow";
		demoD.stopExec();
	}
	else
	{
		if (!confirm("Do you want to start demo device?"))
			return;
		
		document.getElementById("DemoDeviceTitle").innerHTML="Demo Device Stop";
		document.getElementById("DemoDeviceIcon").innerHTML="pause";
		demoD.startExec();
	}
}

function onResetUserPin()
{
	var params=getCookie();
	if (params && params.user && params.pwd)
	{			
		if (!document.getElementById("adminpwd").value)
		{
			alert('Enter admin password');
			return;
		}
		
		if (params.pwd!=document.getElementById("adminpwd").value)
		{
			alert('Invalid admin password');
			return;
		}
			
		
		if (!document.getElementById("useremail").value)
		{
			alert('Enter user email');
			return;
		}
				
		var ret=httpGet(getUrl()+'/?pretty=true&func=reset_user_pin&user='+params.user+'&pwd='+document.getElementById("adminpwd").value+"&useremail="+document.getElementById("useremail").value);
		var jret=JSON.parse(ret);
		if (jret.error)
		{ 
			alert(jret.error_msg);
		}
		else
		{ 
			alert("User: "+document.getElementById("useremail").value+" new pin:"+jret.pincode);
		}
		//document.getElementById("adminpwd").value="";
		//document.getElementById("useremail").value="";
		
		onselectItem(document.getElementById("Desktop"));
		
	}
	else
	{
		alert('Invalid login');
		return;
	}
}


var info=httpGet("/json/info.json");
var jinfo=JSON.parse(info);
serviceUrl=jinfo.serviceUrl;
