var GLOBAL_SERVICE_URL="localhost";
var GLOBAL_DEVICES=null;
var GLOBAL_ACCOUNT=null;

function getUrl()
{
	if (window.location.protocol=="https:")
		return "https://"+GLOBAL_SERVICE_URL;
	else
		return "http://"+GLOBAL_SERVICE_URL;
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


function splitTopic(topic)
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
		console.log('zzmqtt.splitTopic.exception', e.name, e.message);
	}        
	return jret;
}

function makeTopic(si, io)
{
	try
	{	
		return GLOBAL_ACCOUNT.attributes.user+"/"+si+"/"+io;;
	}
	catch(e)
	{
		console.log('zzmqtt.makeTopic.exception', e.name, e.message);
	}        
	return null;
}

function msToStr(msec)
{    
	if (!msec) msec=new Date().getTime();
	var date=null;
	
	date = new Date(parseInt(msec, 10));
	
	var sdate = date.toString();        

	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	hours = hours % 24;
	hours = hours ? hours : 24;
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = lPad(hours, 2, "0") + ':' + lPad(minutes, 2, "0") + ":" + lPad(seconds, 2, "0");

	//return this.lPad(date.getMonth()+1, 2, "0") + '-' + this.lPad(date.getDate(), 2, "0") + "  " + strTime;                    
	return this.lPad(date.getFullYear(), 4, "0") + '-' + this.lPad(date.getMonth()+1, 2, "0") + '-' + this.lPad(date.getDate(), 2, "0") + " " + strTime;                    
}

function msToStrTime(msec)
{    
	if (!msec) msec=new Date().getTime();
	var date=null;
	date = new Date(parseInt(msec, 10));
	
	var sdate = date.toString();        

	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	hours = hours % 24;
	hours = hours ? hours : 24;
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = lPad(hours, 2, "0") + ':' + lPad(minutes, 2, "0") + ":" + lPad(seconds, 2, "0");

	//return lPad(date.getMonth()+1, 2, "0") + '-' + lPad(date.getDate(), 2, "0") + "  " + strTime;                    
	return strTime;                    
}

function msToStrHour(msec)
{    
	if (!msec) msec=new Date().getTime();
	var date=null;
	date = new Date(parseInt(msec, 10));
	
	var sdate = date.toString();        

	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	hours = hours % 24;
	hours = hours ? hours : 24;
	minutes = minutes < 10 ? '0'+minutes : minutes;

	return this.lPad(date.getFullYear(), 4, "0") + '-' + this.lPad(date.getMonth()+1, 2, "0") + '-' + this.lPad(date.getDate(), 2, "0")+" "+lPad(hours, 2, "0")+":00:00";                    
	//return lPad(date.getMonth()+1, 2, "0") + '-' + lPad(date.getDate(), 2, "0") + "  " + strTime;                    
}

function msToStrDate(msec)
{    
	if (!msec) msec=new Date().getTime();
	var date=null;
	
	date = new Date(parseInt(msec, 10));
	
	return this.lPad(date.getFullYear(), 4, "0") + '-' + this.lPad(date.getMonth()+1, 2, "0") + '-' + this.lPad(date.getDate(), 2, "0");                    
}



function lPad(v, len, chpad)
{
	if (!chpad)
		chpad=" ";

	v=""+v;
	var ret=0;
	var lenv=0;
	if (!(v === undefined))
	{            
		ret=v;
		lenv=v.length;
	}

	for (var i=0; i<len-lenv; i++)
	{
		ret=chpad.substring(0, 1)+ret;
	}
	return ret;
}


function getMqttCredentials()
{   
	var jret={'mqtt':{'protocol':"", 'address':'', 'port':'', 'user':'', 'password':''}};
	
	if (GLOBAL_ACCOUNT.attributes.mqttip)
		jret.mqtt.address=GLOBAL_ACCOUNT.attributes.mqttip;
	else
		jret.mqtt.address=window.location.hostname;
		
	if (GLOBAL_ACCOUNT.attributes.mqttuser)
		jret.mqtt.user=GLOBAL_ACCOUNT.attributes.mqttuser;
	else
		jret.mqtt.user=GLOBAL_ACCOUNT.attributes.user;
		
	if (GLOBAL_ACCOUNT.attributes.mqttpassword)
		jret.mqtt.password=GLOBAL_ACCOUNT.attributes.mqttpassword;
	else
		jret.mqtt.password=GLOBAL_ACCOUNT.attributes.pwd;
	
	
	if (window.location.protocol=="http:")
	{
		jret.mqtt.protocol="ws";
		
		if (GLOBAL_ACCOUNT.attributes.mqttwsport)
			jret.mqtt.port=GLOBAL_ACCOUNT.attributes.mqttwsport;
		else
			jret.mqtt.port=GLOBAL_ACCOUNT.attributes.system.attributes.mqttwsport;
	}
	else
	{   
		jret.mqtt.protocol="wss";
		
		if (GLOBAL_ACCOUNT.attributes.mqttwssport)
			jret.mqtt.port=GLOBAL_ACCOUNT.attributes.mqttwssport;
		else
			jret.mqtt.port=GLOBAL_ACCOUNT.attributes.system.attributes.mqttwssport;
	}
	return jret;
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
		parent.document.getElementById("currentUser").value='';
		parent.document.getElementById("currentPwd").value='';
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

function createPinId(device, pinName)
{
	return device.si+"."+pinName;
}

function loginExec()
{   
	try
	{ 
		document.getElementById("alert").innerHTML="";
		if (!document.getElementById("browser.user").value)
		{
			alert ('Email is null');
			return;
		}
		if (!document.getElementById("browser.pwd").value)
		{
			alert ('Password is null');
			return;
		}
		
		var ret=httpGet(getUrl()+'/?pretty=true&func=get_account&user='+document.getElementById("browser.user").value+'&pwd='+document.getElementById("browser.pwd").value);
		var jret=JSON.parse(ret);
		if (!jret.error && jret.error_code==0)
		{
			GLOBAL_ACCOUNT=jret;
			setCurrentUser(document.getElementById("browser.user").value, document.getElementById("browser.pwd").value);
			
			var ret=httpGet(getUrl()+'/?pretty=true&func=get_device_list&user='+document.getElementById("browser.user").value+'&pwd='+document.getElementById("browser.pwd").value);
			var jret=JSON.parse(ret);
			if (!jret.error && jret.error_code==0)
			{
				GLOBAL_DEVICES=jret;
				setCurrentUser(document.getElementById("browser.user").value, document.getElementById("browser.pwd").value);
				
				parent.document.getElementById("login").style.display="none";			
				parent.document.getElementById("browser").style.display="block";
				
				devicesExec(jret);
				
				var mqttCredentials=getMqttCredentials();				
				var mqttclient=new mqtt(mqttCredentials.mqtt.protocol, mqttCredentials.mqtt.address, mqttCredentials.mqtt.port, mqttCredentials.mqtt.user, mqttCredentials.mqtt.password, "BR_"+new Date().getTime(), GLOBAL_DEVICES);				
				mqttclient.connect();
			}
			else
				alert(jret.error_msg);
			
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
		if (confirm('Do you want to exit ?'))
		{ 
			resetCurrentUser();
						
			parent.document.getElementById("login").style.display="block";			
			parent.document.getElementById("browser").style.display="none";
		}    		
	}    
	catch(e)
	{
		alert(e);
	}
}

function download(filename, text) 
{
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function devicesExec(jret)
{   
	try
	{ 
		if (!jret.error && jret.attributes.devices)
		{ 
			var dashboard=document.getElementById("dashboard");	
			if (dashboard)
			{
				dashboard.innerHTML="";
				var table = document.createElement('table');
				table.style.width="100%";
                dashboard.appendChild(table);
				
						
				for (var deviceName in jret.attributes.devices) 
				{
					var tr = document.createElement('tr');
					tr.style.width="100%";
					table.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
						
							var div = document.createElement('div');
							div.className="label";
							td.appendChild(div);
							
							var device=jret.attributes.devices[deviceName];
							if (device.config.desc)
								div.innerHTML=device.config.desc+" ("+device.si+")";
							else
								div.innerHTML=device.si;
							
													

					devicesDetail(dashboard, table, device);
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

function devicesDetail(dashboard, table, device)
{ 
	try
	{ 
		var tr = document.createElement('tr');
		table.appendChild(tr);

			//var td = document.createElement('td');
			//tr.appendChild(td);
		
			var td = document.createElement('td');
			td.colSpan=5;
			tr.appendChild(td);
			
				var div = document.createElement('div');
				div.className="continer";
				td.appendChild(div);
				
			var tableDetail = document.createElement('table');
			tableDetail.style.width="100%";
			div.appendChild(tableDetail);
			
					var tr = document.createElement('tr');
					tr.style.width="100%";
					tableDetail.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
						
						var td = document.createElement('td');
						td.colSpan=3
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Real time';
							td.appendChild(div);

						var td = document.createElement('td');
						td.colSpan=4
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Parameters';
							td.appendChild(div);
							
						var td = document.createElement('td');
						td.colSpan=4
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Hourly Data';
							td.appendChild(div);
														
							
					var tr = document.createElement('tr');
					tableDetail.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Name';
							div.style.width='150px';
							td.appendChild(div);
							
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Value';
							td.appendChild(div);

						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Time';
							td.appendChild(div);
							
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Unit';
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Min';
							td.appendChild(div);

						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Max';
							td.appendChild(div);

						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='AMin';
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='AMax';
							td.appendChild(div);
							
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Min';
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='TMin';
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='Max';
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML='TMax';
							td.appendChild(div);
														

					
					//-------------------------------------------------
			
									
				for (var pinName in device.config.values) 
				{
					var tr = document.createElement('tr');
					tableDetail.appendChild(tr);
					
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.title="Pin:"+createPinId(device, pinName);
							div._pin=device.config.values[pinName];
							div._pinName=pinName;
							div.className="columnValue";
							if (device.config.values[pinName].desc)
								div.innerHTML=device.config.values[pinName].desc+" ("+pinName+")";
							else
								div.innerHTML=pinName;
							td.appendChild(div);
							

						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.title="Value of "+createPinId(device, pinName);
							div.id=createPinId(device, pinName)+"_value";
							div._pin=device.config.values[pinName];
							div._pinName=pinName;
							div.className="columnValue";
							div.innerHTML="0";
							td.appendChild(div);

						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.title="Time of "+createPinId(device, pinName);
							div.id=createPinId(device, pinName)+"_time";
							div._pin=device.config.values[pinName];
							div._pinName=pinName;
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
							
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnValue";
							div.innerHTML=device.config.values[pinName].U;
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnValue";
							div.innerHTML=device.config.values[pinName].MIN;
							td.appendChild(div);

						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnValue";
							div.innerHTML=device.config.values[pinName].MAX;
							td.appendChild(div);

						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnValue";
							div.innerHTML=device.config.values[pinName].ALERT_MIN;
							td.appendChild(div);

						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnValue";
							div.innerHTML=device.config.values[pinName].ALERT_MAX;
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=createPinId(device, pinName)+"_Hmin";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=createPinId(device, pinName)+"_HminTime";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=createPinId(device, pinName)+"_Hmax";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
						var td = document.createElement('td');
						//td.style.display="none";
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=createPinId(device, pinName)+"_HmaxTime";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
							
													
						if (device.config.values[pinName].IO=="I")
						{
							var td = document.createElement('td');
							tr.appendChild(td);
						
								var div = document.createElement('div');
								div._device=device;
								div._pin=device.config.values[pinName];
								div._pinName=pinName;
								div.className="miniButton";
								div.innerHTML="Set";							
								div.onclick=function()
								{
									var V=prompt("Enter pin Value");
									if (V!=null)
									{
										if (this._pin.T=="int")
										{
											if (isNaN(V))
											{
												alert("Invalid integer value");
												return;
											}
										}
										
										if (this._pin.T=="float")
										{
											if (isNaN(V))
											{
												alert("Invalid float value");
												return;
											}
										}
										
										
										var jpayload={'T':new Date().getTime(), 'cmd':'set'};
										jpayload[this._pinName]=V;
										
										GLOBAL_MQTT.send(makeTopic(this._device.si, "in"), JSON.stringify(jpayload));
									}
								}
								td.appendChild(div);
						}    
						
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div._device=device;
							div._pin=device.config.values[pinName];
							div._pinName=pinName;
							div.className="miniButton";
							div.innerHTML="Mail";							
							div.onclick=function()
							{
								var email=prompt("Enter email destination address");
								if (email!=null)
								{
									var div=document.getElementById(this._device.si+"."+this._pinName+"_value");
									if (div)
									{									
										var subject="Device:"+this._device.si+" Pin:"+this._pinName;
										var text="Current time:"+msToStr()+" Value:"+div.innerHTML;
										httpGet(getUrl()+"/?func=send_mail&user="+document.getElementById("browser.user").value+"&pwd="+document.getElementById("browser.pwd").value+"&subject="+subject+"&mailto="+email+"&text="+text);
									}
								}
							}
							td.appendChild(div);
											
						
				}    
				
											
				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);
				
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML="Gps Latitude";
							td.appendChild(div);
							
						var td = document.createElement('td');
						td.colSpan=3;
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=device.si+"_gpsLat";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);
				
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML="Gps Longitude";
							td.appendChild(div);
							
						var td = document.createElement('td');
						td.colSpan=3;
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=device.si+"_gpsLng";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
							
				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);
				
						var td = document.createElement('td');
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.className="columnTitle";
							div.innerHTML="Altitude";
							td.appendChild(div);
							
						var td = document.createElement('td');
						td.colSpan=3;
						tr.appendChild(td);
					
							var div = document.createElement('div');
							div.id=device.si+"_gpsAlt";
							div.className="columnValue";
							div.innerHTML="";
							td.appendChild(div);
				
				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);

					var td = document.createElement('td');
					tr.appendChild(td);

						var div = document.createElement('div');
						div._device=device;
						div._pin=device.config.values[pinName];
						div._pinName=pinName;
						div.className="miniButton";
						div.innerHTML="Download";
						div.onclick=function()
						{
							if (document.getElementById(device.si+"_hystoric").style.display=="block")
							{
								document.getElementById(device.si+"_hystoric").style.display="none";
								return;
							}	
							document.getElementById(device.si+"_hystoric").innerHTML=""
							
							var year=prompt("Enter year of date", new Date().getFullYear());
							if (year!=null)
							{									
								var month=prompt("Enter month of date", new Date().getMonth()+1);
								if (month!=null)
								{
									var data=httpGet(getUrl()+"/?func=get_data&user="+document.getElementById("browser.user").value+"&pwd="+document.getElementById("browser.pwd").value+"&si="+this._device.si+"&year="+year+"&month="+month);
									try
									{
										var jdata=JSON.parse(data);
										if (jdata.error)
										{
											alert("Data not found");
											return;
										}
										if (!jdata.data)
										{
											alert('Invalid Data');
											return;
										}
										
										download("download_"+year+"_"+month+"_"+this._device.si+".json", JSON.stringify(jdata, null, 2));
									
									}
									catch(e)
									{
										alert(e)
									}
								}
							}
						}
						td.appendChild(div);										
				
					//var td = document.createElement('td');
					//tr.appendChild(td);
				
						var div = document.createElement('div');
						div._device=device;
						div._pin=device.config.values[pinName];
						div._pinName=pinName;
						div.className="miniButton";
						div.innerHTML="Historical";							
						div.onclick=function()
						{
							if (document.getElementById(device.si+"_hystoric").style.display=="block")
							{
								document.getElementById(device.si+"_hystoric").style.display="none";
								return;
							}	
							document.getElementById(device.si+"_hystoric").innerHTML=""
							
							var year=prompt("Enter year of date", new Date().getFullYear());
							if (year!=null)
							{									
								var month=prompt("Enter month of date", new Date().getMonth()+1);
								if (month!=null)
								{
									var data=httpGet(getUrl()+"/?func=get_data&user="+document.getElementById("browser.user").value+"&pwd="+document.getElementById("browser.pwd").value+"&si="+this._device.si+"&year="+year+"&month="+month);
									try
									{
										var jdata=JSON.parse(data);
										if (jdata.error)
										{
											alert("Data not found");
											return;
										}
										if (!jdata.data)
										{
											alert('Invalid Data');
											return;
										}
										
										
										var historic=document.getElementById(device.si+"_hystoric");
										historic.style.display="block";
										
										var button_div = document.createElement('div');
										//button_div.className="continer";
										button_div.id=device.si+"_button_div";	
										historic.appendChild(button_div);

										var chart_div = document.createElement('div');
										//chart_div.className="continer";
										chart_div.id=device.si+"_chart_div";	
										historic.appendChild(chart_div);
										
										if (jdata.data)
										{
											var table=document.createElement('table');
											table.style.width="100%";
											chart_div.appendChild(table);

												var tr=document.createElement('tr');
												tr.style.width="100%";
												table.appendChild(tr);
												
													var td=document.createElement('td');
													tr.appendChild(td);
													
														var div=document.createElement('div');
														td.appendChild(div);														
														div.innerHTML='Day/Hour';
														div.className="columnTitleLeft";
														
													var td=document.createElement('td');
													tr.appendChild(td);
													
														var div=document.createElement('div');
														td.appendChild(div);														
														div.innerHTML='Pin';
														div.className="columnTitleLeft";
														
													var td=document.createElement('td');
													tr.appendChild(td);
													
														var div=document.createElement('div');
														td.appendChild(div);														
														div.innerHTML='Min';
														div.className="columnTitleLeft";
														
													var td=document.createElement('td');
													tr.appendChild(td);
													
														var div=document.createElement('div');
														td.appendChild(div);														
														div.innerHTML='TMin';
														div.className="columnTitleLeft";
														
													var td=document.createElement('td');
													tr.appendChild(td);
													
														var div=document.createElement('div');
														td.appendChild(div);														
														div.innerHTML='Max';
														div.className="columnTitleLeft";
														
													var td=document.createElement('td');
													tr.appendChild(td);
													
														var div=document.createElement('div');
														td.appendChild(div);														
														div.innerHTML='TMax';
														div.className="columnTitleLeft";
														
											var ldt=0;
											for (var dt in jdata.data) 
											{												
												for (var pin in jdata.data[dt]) 
												{
													var tr=document.createElement('tr');
													table.appendChild(tr);
													
														var td=document.createElement('td');
														tr.appendChild(td);
														
															if (ldt!=dt)
															{
																var div=document.createElement('div');
																td.appendChild(div);
																
																div.innerHTML=msToStrHour(dt);
																div.className="columnValue";
															}
															
														var td=document.createElement('td');
														tr.appendChild(td);
														
															var div=document.createElement('div');
															td.appendChild(div);
															
															div.innerHTML=pin;
															div.className="columnValue";
															
														var td=document.createElement('td');
														tr.appendChild(td);
														
															var div=document.createElement('div');
															td.appendChild(div);
															
															div.innerHTML=jdata.data[dt][pin].N;
															div.className="columnValue";
															
														var td=document.createElement('td');
														tr.appendChild(td);
														
															var div=document.createElement('div');
															td.appendChild(div);
															
															div.innerHTML=msToStrTime(jdata.data[dt][pin].TN);
															div.className="columnValue";
															
														var td=document.createElement('td');
														tr.appendChild(td);
														
															var div=document.createElement('div');
															td.appendChild(div);
															
															div.innerHTML=jdata.data[dt][pin].M;
															div.className="columnValue";
															
														var td=document.createElement('td');
														tr.appendChild(td);
														
															var div=document.createElement('div');
															td.appendChild(div);
															
															div.innerHTML=msToStrTime(jdata.data[dt][pin].TM);
															div.className="columnValue";
													ldt=dt;
												}												
											}
										}
										
										//var CD=document.getElementById(this._device.si+"_chart_div");
										//CD.innerHTML="<pre>"+JSON.stringify(jdata, null, 2)+"</pre>";
																				
									}
									catch(e)
									{
										alert(e)
									}
								}
							}
						}
						td.appendChild(div);
				
				var tr = document.createElement('tr');
				tableDetail.appendChild(tr);
				
					var td = document.createElement('td');
					td.colSpan=25;
					tr.appendChild(td);
				
						var div = document.createElement('div');
						div.className="continer";
						div.style.display="none"
						div.id=device.si+"_hystoric"
						//div.style.height="400px";
						//div.style.overflow="auto";
						td.appendChild(div);
					
	}    
	catch(e)
	{
		alert(e);
	}
}

