var serviceUrl="localhost";

function getUrl()
{
	if (window.location.protocol=="https:")
		return "https://"+serviceUrl;
	else
		return "http://"+serviceUrl;
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
		//if (xhr.status == 200)
		//{     
			return xhr.responseText;
		//}
	}    
	catch(e)
	{
		alert(e);
	}
}

function passwordView(item)
{   
	try
	{ 
		if (document.getElementById(item).type=="password")	
			document.getElementById(item).type="text";
		else
			document.getElementById(item).type="password";
	}    
	catch(e)
	{
		alert(e);
	}
}

function newAccountOpen()
{   
	try
	{ 
		resetCurrentUser();
		document.getElementById("iframediv").style.display="block";	
		document.getElementById("iframe").src="newaccount.html";	
		document.getElementById("iframe").height="400px";	
	}    
	catch(e)
	{
		alert(e);
	}
}

function passwordRecoveryOpen()
{   
	try
	{ 
		resetCurrentUser();
		document.getElementById("iframediv").style.display="block";	
		document.getElementById("iframe").src="pwdrecovery.html";	
		document.getElementById("iframe").height="200px";	
	}    
	catch(e)
	{
		alert(e);
	}
}

function loginOpen()
{   
	try
	{ 
		resetCurrentUser();
		document.getElementById("iframediv").style.display="block";	
		document.getElementById("iframe").src="login.html";	
		document.getElementById("iframe").height="200px";	
	}    
	catch(e)
	{
		alert(e);
	}
}

function accountOpen()
{   
	try
	{ 
		document.getElementById("iframediv").style.display="block";	
		document.getElementById("iframe").src="account.html";	
		document.getElementById("iframe").height="700px";	
	}    
	catch(e)
	{
		alert(e);
	}
}

function accountExec()
{   
	try
	{ 	
		if (confirm("Do you want to save account info?"))
		{ 	
			var jsttributes={
				user:getCurrentUser(),
				pwd:getCurrentPwd(),
				hm:parseInt(document.getElementById("account.hm").value),
				tz:parseInt(document.getElementById("account.timeZone").value),
				mqttip:document.getElementById("account.mqttip").value,
				mqttuser:document.getElementById("account.mqttuser").value,
				mqttpassword:document.getElementById("account.mqttpassword").value,
				mqttport:document.getElementById("account.mqttport").value,
				mqttwsport:document.getElementById("account.mqttwsport").value,
				mqttsslport:document.getElementById("account.mqttsslport").value,
				mqttwssport:document.getElementById("account.mqttwssport").value
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
					
			var ret=httpGet(getUrl()+'/?pretty=true&func=set_account&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+'&attributes='+JSON.stringify(jsttributes));
			var jret=JSON.parse(ret);
			if (!jret.error && jret.error_code==0)
			{
				document.getElementById("account.user").value=jret.attributes.user;
				document.getElementById("account.pwd").value=jret.attributes.pwd;
				document.getElementById("account.hm").value=jret.attributes.hm;
				document.getElementById("account.timeZone").value=jret.attributes.tz;
				document.getElementById("account.mqttip").value=jret.attributes.mqttip;
				document.getElementById("account.mqttuser").value=jret.attributes.mqttuser;
				document.getElementById("account.mqttpassword").value=jret.attributes.mqttpassword;
				document.getElementById("account.mqttport").value=jret.attributes.mqttport;
				document.getElementById("account.mqttwsport").value=jret.attributes.mqttwsport;
				document.getElementById("account.mqttsslport").value=jret.attributes.mqttsslport;
				document.getElementById("account.mqttwssport").value=jret.attributes.mqttwssport;			
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

function accountDeleteExec()
{   
	try
	{ 	
		
		if (!getCurrentUser())
		{
			alert ('Username is null');
			return;
		}
		if (!getCurrentPwd())
		{
			alert ('Password is null');
			return;
		}
		
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=delete_account&user='+getCurrentUser()+'&pwd='+getCurrentPwd());
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
			if (jret.info)
				alert(jret.info.message);
			else
				alert("Your request has been notified by email, please confirm it");
		}
		else
			alert(jret.error_msg);
		
		forcedLogoutExec();
	}    
	catch(e)
	{
		alert(e);
	}
}

function accountSetPasswordExec()
{   
	try
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
		
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=pwd_set_account&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+'&attributes='+JSON.stringify(jsttributes));
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
			alert("Your request has been notified by email, please confirm it");
		else
			alert(jret.error_msg);
		
		forcedLogoutExec();

	}    
	catch(e)
	{
		alert(e);
	}
}

function accountRefreshExec()
{   
	try
	{ 	
		
		if (!getCurrentUser())
		{
			alert ('Username is null');
			return;
		}
		if (!getCurrentPwd())
		{
			alert ('Password is null');
			return;
		}
		
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=get_account&user='+getCurrentUser()+'&pwd='+getCurrentPwd());
		var jret=JSON.parse(ret);
		
		document.getElementById("account.hm").value=jret.attributes.hm;
		document.getElementById("account.timeZone").value=jret.attributes.tz;
		document.getElementById("account.user").value=jret.attributes.user;
		document.getElementById("account.pwd").value=jret.attributes.pwd;
		document.getElementById("account.mqttip").value=jret.attributes.mqttip;
		document.getElementById("account.mqttuser").value=jret.attributes.mqttuser;
		document.getElementById("account.mqttpassword").value=jret.attributes.mqttpassword;
		document.getElementById("account.mqttport").value=jret.attributes.mqttport;
		document.getElementById("account.mqttwsport").value=jret.attributes.mqttwsport;
		document.getElementById("account.mqttsslport").value=jret.attributes.mqttsslport;
		document.getElementById("account.mqttwssport").value=jret.attributes.mqttwssport;
		
	}    
	catch(e)
	{
		alert(e);
	}
}


function newAccountExec()
{   
	try
	{  
		var jsttributes={
			user:document.getElementById("newAccount.user").value,
			pwd:document.getElementById("newAccount.pwd").value,
			pwdcnf:document.getElementById("newAccount.pwdcnf").value,
			hm:0,
			tz:0,
			mqttip:document.getElementById("newAccount.mqttip").value,
			mqttuser:document.getElementById("newAccount.mqttuser").value,
			mqttpassword:document.getElementById("newAccount.mqttpassword").value,
			mqttport:document.getElementById("newAccount.mqttport").value,
			mqttwsport:document.getElementById("newAccount.mqttwsport").value,
			mqttsslport:document.getElementById("newAccount.mqttsslport").value,
			mqttwssport:document.getElementById("newAccount.mqttwssport").value
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
			if (jret.info)
				alert(jret.info.message);
			else
				alert("Your request has been notified by email, please confirm it");
		}
		else
			alert(jret.error_msg);
		
		forcedLogoutExec();

	}    
	catch(e)
	{
		alert(e);
	}
}

function passwordRecoveryExec()
{   
	try
	{  	
		if (!document.getElementById("pwdRecovery.user").value)
		{
			alert ('Username/email is null');
			return;
		}
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=request_account_code&reqfunc=pwd_recovery_account&user='+document.getElementById("pwdRecovery.user").value);
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
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

function loginExec()
{   
	try
	{  	
		if (!document.getElementById("login.user").value)
		{
			alert ('Username/email is null');
			return;
		}
		if (!document.getElementById("login.pwd").value)
		{
			alert ('Password is null');
			return;
		}
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=login_user&user='+document.getElementById("login.user").value+'&pwd='+document.getElementById("login.pwd").value);
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
			setCurrentUser(document.getElementById("login.user").value, document.getElementById("login.pwd").value);
			
			if (!jret.hm)
				parent.document.getElementById("modelsButton").style.display="none";
			else
				parent.document.getElementById("modelsButton").style.display="block";
		
			parent.document.getElementById("iframe").src="";
			parent.document.getElementById("iframediv").style.display="none";
			
			parent.document.getElementById("newAccountOpen").style.display="none";
			parent.document.getElementById("pwdButton").style.display="none";
			parent.document.getElementById("loginButton").style.display="none";
			
			parent.document.getElementById("accountButton").style.display="block";
			parent.document.getElementById("deviceButton").style.display="block";
			parent.document.getElementById("logoutButton").style.display="block";
			parent.document.getElementById("deviceDemoButton").style.display="block";
			
		}
		else
			alert(jret.error_msg);
	}    
	catch(e)
	{
		alert(e);
	}
}

function logoutExec()
{   
	try
	{  	
		if (confirm('Do you whant logout to zzigro?'))		
		{
			setCurrentUser("", "");
			
			parent.document.getElementById("currentUser").innerHTML="";
			parent.document.getElementById("iframe").src="";
			
			parent.document.getElementById("newAccountOpen").style.display="block";
			parent.document.getElementById("pwdButton").style.display="block";
			parent.document.getElementById("loginButton").style.display="block";
			
			parent.document.getElementById("accountButton").style.display="none";
			parent.document.getElementById("deviceButton").style.display="none";
			parent.document.getElementById("logoutButton").style.display="none";
			parent.document.getElementById("deviceDemoButton").style.display="none";
			
		}
	}    
	catch(e)
	{
		alert(e);
	}
}

function forcedLogoutExec()
{   
	try
	{  	
		setCurrentUser("", "");
		
		parent.document.getElementById("currentUser").innerHTML="";
		parent.document.getElementById("iframe").src="";
		parent.document.getElementById("iframediv").style.display="none";
		
		parent.document.getElementById("newAccountOpen").style.display="block";
		parent.document.getElementById("pwdButton").style.display="block";
		parent.document.getElementById("loginButton").style.display="block";
		
		parent.document.getElementById("accountButton").style.display="none";
		parent.document.getElementById("deviceButton").style.display="none";
		parent.document.getElementById("logoutButton").style.display="none";
			
	}    
	catch(e)
	{
		alert(e);
	}
}

function setCurrentUser(user, pwd)
{   
	try
	{  		
		parent.document.getElementById("currentUser").value=user;
		parent.document.getElementById("currentPwd").value=pwd;
	}    
	catch(e)
	{
		alert(e);
	}
}

function resetCurrentUser()
{   
	try
	{  		
		//parent.document.getElementById("currentUser").value='';
		//parent.document.getElementById("currentPwd").value='';
		document.getElementById("currentUser").value='';
		document.getElementById("currentPwd").value='';
	}    
	catch(e)
	{
		alert(e);
	}
}

function getCurrentUser()
{   
	try
	{  		
		return parent.document.getElementById("currentUser").value;
	}    
	catch(e)
	{
		alert(e);
	}
}

function getCurrentPwd()
{   
	try
	{  		
		return parent.document.getElementById("currentPwd").value;
	}    
	catch(e)
	{
		alert(e);
	}
}

function devicesOpen()
{   
	try
	{ 
		document.getElementById("iframediv").style.display="block";	
		document.getElementById("iframe").src="devices.html";	
		document.getElementById("iframe").height="700px";			
	}    
	catch(e)
	{
		alert(e);
	}
}

function devicesExec()
{   
	try
	{ 
		var ret=httpGet(getUrl()+'/?pretty=true&func=get_device_list&user='+getCurrentUser()+'&pwd='+getCurrentPwd());
		var jret=JSON.parse(ret);
		if (jret.attributes.devices)
		{ 
			var dashboard=document.getElementById("dashboard");	
			if (dashboard)
			{
				dashboard.innerHTML="";
				var table = document.createElement('table');
                dashboard.appendChild(table);

				var tr = document.createElement('tr');
				table.appendChild(tr);
				
					var td = document.createElement('td');
					td.colSpan=3;
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="DEVICES";
						td.appendChild(div);
				
				var tr = document.createElement('tr');
				table.appendChild(tr);
				
					var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="SI";
						td.appendChild(div);

					/*var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="ALIAS";
						td.appendChild(div);*/

					var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="DESC";
						td.appendChild(div);
						
				for (var deviceName in jret.attributes.devices) 
				{
					var tr = document.createElement('tr');
					table.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
						
							var div = document.createElement('div');
							div.className="label";
							td.appendChild(div);
							
							var device=jret.attributes.devices[deviceName];
							
							div.innerHTML=device.si;
							
							
						/*var td = document.createElement('td');
						tr.appendChild(td);
						
							var div = document.createElement('div');
							div.className="link";
							div._device=device;
							div.onclick=function()
							{
								var alias=prompt("Enter device alias");
								if (alias)
								{
									var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_alias&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&si="+this._device.si+"&alias="+alias);
									var jnd=JSON.parse(nd);
									if (jnd.attributes.config.alias)
									{ 							
										this.innerHTML=jnd.attributes.config.alias;
									}
									else
										this.innerHTML=jnd.attributes.si;
								}
							}
							
							td.appendChild(div);
							
							if (device.config.alias)
								div.innerHTML=device.config.alias;
							else
								div.innerHTML=device.si;*/
							

						var td = document.createElement('td');
						tr.appendChild(td);
						
							var div = document.createElement('div');
							div.className="link";
							div._device=device;
							div.onclick=function()
							{
								var desc=prompt("Enter device description");
								if (desc)
								{
									var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_desc&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&si="+this._device.si+"&desc="+desc);
									var jnd=JSON.parse(nd);
									if (jnd.attributes.config.desc)
									{ 							
										this.innerHTML=jnd.attributes.config.desc;
									}
									else
										this.innerHTML=jnd.attributes.si;
								}
							}							
							td.appendChild(div);
							
							if (device.config.desc)
								div.innerHTML=device.config.desc;
							else
								div.innerHTML=device.si;
							
						
						var td = document.createElement('td');
						tr.appendChild(td);
						
						
							var div = document.createElement('div');
							div.className="miniButton";
							div._device=device;
							div.innerHTML="X";
							div.onclick=function()
							{
								if (confirm('Do you want to delete devics '+this._device.si+' ?'))
								{
									var nd=httpGet(getUrl()+'/?pretty=true&func=delete_device&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&si="+this._device.si);
									var jnd=JSON.parse(nd);
									if (jnd.error)
									{ 			
										alert(jnd.error_msg);
									}
									else
										devicesExec();
								}
							}							
							td.appendChild(div);

					devicesDetail(table, device);
				}
			}
		}    
		else
			alert(jret.error_msg);		
		
	}    
	catch(e)
	{
		alert(e);
	}
}

function devicesDetail(table, device)
{ 
	//try
	//{ 
		var tr = document.createElement('tr');
		table.appendChild(tr);

			var td = document.createElement('td');
			tr.appendChild(td);
		
			var td = document.createElement('td');
			td.colSpan=5;
			tr.appendChild(td);
			
				var div = document.createElement('div');
				div.className="continer";
				td.appendChild(div);
				
			var tableDetail = document.createElement('table');
			div.appendChild(tableDetail);

				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);
				
					var td = document.createElement('td');
					td.colSpan=3;
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="PIN LIST";
						td.appendChild(div);
			
			
				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);

					var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="NAME";
						td.appendChild(div);
						
					var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="DESC";
						td.appendChild(div);
						
					var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="REMOTE";
						td.appendChild(div);
						
				for (var pinName in device.config.values) 
				{
					var tr = document.createElement('tr');
					tableDetail.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="label";
							div.innerHTML=pinName;
							td.appendChild(div);
							
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="link";
							if (device.config.values[pinName].desc)
								div.innerHTML=device.config.values[pinName].desc;
							div._device=device;
							div._pin=device.config.values[pinName];
							div._pinName=pinName;
							div.onclick=function()
							{
								var desc=prompt("Enter pin description");
								if (desc!=null)
								{
									var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_pin_desc&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&si="+this._device.si+"&pin="+this._pinName+"&desc="+desc);
									var jnd=JSON.parse(nd);
									if (jnd.attributes.config.values[this._pinName].desc)
									{ 							
										this.innerHTML=jnd.attributes.config.values[this._pinName].desc;
									}
									else
										this.innerHTML="";
								}
							}														
							td.appendChild(div);

						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="link";
							if (device.config.values[pinName].remote)
								div.innerHTML=device.config.values[pinName].remote;
							div._device=device;
							div._pin=device.config.values[pinName];
							div._pinName=pinName;
							div.onclick=function()
							{
								var remote=prompt("Enter remote device SI or ALIAS");
								if (remote!=null)
								{
									var nd=httpGet(getUrl()+'/?pretty=true&func=set_device_pin_remote&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&si="+this._device.si+"&pin="+this._pinName+"&remote="+remote);
									var jnd=JSON.parse(nd);
									if (jnd.attributes.config.values[this._pinName].remote)
									{ 							
										this.innerHTML=jnd.attributes.config.values[this._pinName].remote;
									}
									else
										this.innerHTML="";
								}
							}														
							td.appendChild(div);
							
				}    
					
	/*}    
	catch(e)
	{
		alert(e);
	}*/
}

function modelsOpen()
{   
	try
	{ 
		document.getElementById("iframediv").style.display="block";	
		document.getElementById("iframe").src="models.html";	
		document.getElementById("iframe").height="700px";			
	}    
	catch(e)
	{
		alert(e);
	}
}


function modelsExec()
{   
	try
	{ 
		var ret=httpGet(getUrl()+'/?pretty=true&func=get_models_list&user='+getCurrentUser()+'&pwd='+getCurrentPwd());
		var jret=JSON.parse(ret);
		if (jret.error)
		{ 
			alert(jret.error_msg);
			return;
		}
		
		if (jret.attributes.models)
		{ 
			var dashboard=document.getElementById("dashboard");	
			if (dashboard)
			{
				dashboard.innerHTML="";
				var viewer=document.getElementById("viewer");
				viewer.innerHTML="";
				
				document.getElementById("jsonExec").onclick=function()
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
							return;
						}
						
						try
						{ 
							if (!fileToLoad || !fileToLoad.name)
							{ 
								alert("Invalid file name");
								return;
							}
								
							var json=JSON.parse(textFromFileLoaded);
							
							var ret=httpGet(getUrl()+'/?pretty=true&func=set_model&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&model="+fileToLoad.name+"&attributes="+JSON.stringify(json));
							var jret=JSON.parse(ret);
							if (jret.error)
							{ 
								alert(jret.error_msg);
								return;
							}
							modelsExec();																				
						}
						catch(e)
						{ 
							alert("The file is not json format");
							return;
						}
																								 
					};
					fileReader.readAsText(fileToLoad, "UTF-8");
				}
				
				var table = document.createElement('table');
				table.className="continer";
                dashboard.appendChild(table);

				var tr = document.createElement('tr');
				table.appendChild(tr);
				
					var td = document.createElement('td');
					tr.appendChild(td);
					
						var div = document.createElement('div');
						div.className="columnTitle";
						div.innerHTML="MODEL NAME";
						div.style.width="250px";
						td.appendChild(div);
				
						
				for (var i=0; i<jret.attributes.models.length; i++) 
				{
					var modelName=jret.attributes.models[i];
					var tr = document.createElement('tr');
					table.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
						
							//var model=jret.attributes.models[modelName];
							
							var div = document.createElement('div');
							div.className="link";
							div.innerHTML=modelName;							
							div._model=modelName;
							td.appendChild(div);							
							div.onclick=function()
							{
								var viewer=document.getElementById("viewer");	
								if (viewer)
								{								
									var ret=httpGet(getUrl()+'/?pretty=true&func=get_model&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&model="+this._model+"&owner="+getCurrentUser());
									var jret=JSON.parse(ret);
									if (jret.error)
									{ 
										alert(jret.error_msg);
										return;
									}								
									viewer.innerHTML="<div class='continer' style='width:100%'><div class='columnTitle'>"+this._model+"</div><pre>"+JSON.stringify(jret.attributes, null, 2)+"</pre></div>";
								}							
								
							}							
							td.appendChild(div);
							

						var td = document.createElement('td');
						tr.appendChild(td);
						
							var div = document.createElement('div');
							div.innerHTML="X";
							div.className="miniButton";
							div._model=modelName;
							div.onclick=function()
							{
								if(confirm("Do you want to delete the model?"))
								{
									var ret=httpGet(getUrl()+'/?pretty=true&func=delete_model&user='+getCurrentUser()+'&pwd='+getCurrentPwd()+"&model="+this._model);
									var jret=JSON.parse(ret);
									if (jret.error)
									{ 
										alert(jret.error_msg);
										return;
									}
									modelsExec();																													
								}
							}							
							td.appendChild(div);
													
				}
			}
		}    
		else
			alert(jret.error_msg);		
		
	}    
	catch(e)
	{
		alert(e);
	}
}


function accountMoreExec()
{ 
	try
	{ 
		if (document.getElementById("account.more.info").style.display=="none")
		{ 
			document.getElementById("account.more.info").style.display="block";
			document.getElementById("account.more").innerHTML="Less";	
		}    
		else
		{ 
			document.getElementById("account.more.info").style.display="none";
			document.getElementById("account.more").innerHTML="More";	
		}    

	}    
	catch(e)
	{
		alert(e);
	}
}	

function browserOpen()
{ 
	try
	{ 
		var win = window.open('browser.html', '_blank');
		win.focus();
	}    
	catch(e)
	{
		alert(e);
	}
}	

function deviceDemoOpen()
{ 
	try
	{ 
		var win = window.open('device.html', '_blank');
		win.focus();
	}    
	catch(e)
	{
		alert(e);
	}
}	
