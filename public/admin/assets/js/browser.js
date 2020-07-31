var browserData=
{
	user:null, 
	pwd:null, 
	account:null, 
	devices:null, 
	mqttCredentials:null, 
	mqttclient:null, 
	data:{}, 
	dataRT:{}, 
	cursi:null, 
	curpin:null, 
	chartRT:null, 
	chartH:null, 
	map:null,
	gps:{},
	alert:[]
};

function goToAnchor(tag)
{
	var anchor=document.getElementById(tag);	
	if (anchor)
		anchor.scrollIntoView()
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
	return lPad(date.getFullYear(), 4, "0") + '-' + lPad(date.getMonth()+1, 2, "0") + '-' + lPad(date.getDate(), 2, "0") + " " + strTime;                    
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

function msToStrShort(msec)
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

	return this.lPad(date.getMonth()+1, 2, "0") + '-' + this.lPad(date.getDate(), 2, "0")+" "+lPad(hours, 2, "0")+":"+lPad(minutes, 2, "0");                    
	//return lPad(date.getMonth()+1, 2, "0") + '-' + lPad(date.getDate(), 2, "0") + "  " + strTime;                    
}

function msToStrDate(msec)
{    
	if (!msec) msec=new Date().getTime();
	var date=null;
	
	date = new Date(parseInt(msec, 10));
	
	return this.lPad(date.getFullYear(), 4, "0") + '-' + this.lPad(date.getMonth()+1, 2, "0") + '-' + this.lPad(date.getDate(), 2, "0");                    
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
		return browserData.user+"/"+si+"/"+io;
	}
	catch(e)
	{
	}        
	return null;
}

function getBrowserMqttCredentials(attributes)
{   
	var jret={'mqtt':{'protocol':"", 'address':'', 'port':'', 'user':'', 'password':''}};
	
	if (attributes.mqttip)
		jret.mqtt.address=attributes.mqttip;
	else
		jret.mqtt.address=window.location.hostname;
		
	if (attributes.mqttuser)
		jret.mqtt.user=attributes.mqttuser;
	else
		jret.mqtt.user=attributes.user;
		
	if (attributes.mqttpassword)
		jret.mqtt.password=attributes.mqttpassword;
	else
		jret.mqtt.password=attributes.pwd;
	
	
	if (window.location.protocol=="http:")
	{
		jret.mqtt.protocol="ws";
		
		if (attributes.mqttwsport)
			jret.mqtt.port=attributes.mqttwsport;
		else
			jret.mqtt.port=attributes.system.attributes.mqttwsport;
	}
	else
	{   
		jret.mqtt.protocol="wss";
		
		if (attributes.mqttwssport)
			jret.mqtt.port=attributes.mqttwssport;
		else
			jret.mqtt.port=attributes.system.attributes.mqttwssport;
	}
	return jret;
}

function onResize()
{
	if (browserData.chartRT)
		browserData.chartRT.resize();
	if (browserData.chartH)
		browserData.chartH.resize();
}

function onBrowserLoad()
{
	try
	{ 
		window.addEventListener('resize', onResize);	
		
		var params=getCookie();
		if (params && params.user && params.pwd)
		{
			var ret=httpGet(getUrl()+'/?pretty=true&func=get_account&user='+params.user+'&pwd='+params.pwd);
			var jret=JSON.parse(ret);
			if (!jret.error && jret.error_code==0)
			{
				browserData.user=params.user;
				browserData.pwd=params.pwd;
				
				browserData.account=jret;
								
				var ret=httpGet(getUrl()+'/?pretty=true&func=get_device_list&user='+params.user+'&pwd='+params.pwd);
				var jret=JSON.parse(ret);
				if (!jret.error && jret.error_code==0)
				{
					browserData.devices=jret;
					
					var tag='';
					
					var ct=0;
					var curSi=0
					for (deviceName in browserData.devices.attributes.devices)
					{
						if (ct==0)
						{
							var device=browserData.devices.attributes.devices[deviceName];
							curSi=device.si;
							if (device.config.desc)
								tag=tag+'<li class="nav-item active" id="li_'+device.si+'" ><a id="a_'+device.si+'" class="nav-link" onclick="onBrowserDeviceSelect(\''+device.si+'\')"><i class="material-icons">memory</i><p>'+device.config.desc+'</p></a></li>';
							else	
								tag=tag+'<li class="nav-item active" id="li_'+device.si+'" ><a id="a_'+device.si+'" class="nav-link" onclick="onBrowserDeviceSelect(\''+device.si+'\')"><i class="material-icons">memory</i><p>'+device.si+'</p></a></li>';						
						}
						else
						{
							var device=browserData.devices.attributes.devices[deviceName];
							if (device.config.desc)
								tag=tag+'<li class="nav-item" id="li_'+device.si+'" ><a id="a_'+device.si+'" class="nav-link" onclick="onBrowserDeviceSelect(\''+device.si+'\')"><i class="material-icons">memory</i><p>'+device.config.desc+'</p></a></li>';
							else	
								tag=tag+'<li class="nav-item" id="li_'+device.si+'" ><a id="a_'+device.si+'" class="nav-link" onclick="onBrowserDeviceSelect(\''+device.si+'\')"><i class="material-icons">memory</i><p>'+device.si+'</p></a></li>';						
						}
						
						ct++;
					}
					
					browserData.chartRT=new chart(document.getElementById("chartRT"), "R");				
					browserData.chartH=new chart(document.getElementById("chartH"), "H");
					
					document.getElementById("deviceList").innerHTML=tag;
					onBrowserDeviceSelect(curSi);
					
					browserData.mqttCredentials=getBrowserMqttCredentials(browserData.account.attributes);				
					browserData.mqttclient=new mqtt(browserData.mqttCredentials.mqtt.protocol, browserData.mqttCredentials.mqtt.address, browserData.mqttCredentials.mqtt.port, browserData.mqttCredentials.mqtt.user, browserData.mqttCredentials.mqtt.password, "BR_"+new Date().getTime());				
					browserData.mqttclient.connect();
					
					
					browserData.interval=setInterval(function() 
					{
						try
						{	
							if (browserData.data && browserData.data[browserData.cursi])
							{	
								for (pin in browserData.data[browserData.cursi].value)
								{	
									var div=document.getElementById("pintime_"+browserData.cursi+"_"+pin);
									if (div)
									{
										if (new Date().getTime()-div._time>60000)
										{
											var div=document.getElementById("pintimeicon_"+browserData.cursi+"_"+pin);
											//div.className="material-icons";
											div.className="material-icons text-danger";											
										}
									}						
								}
							}
						}
						catch(e)
						{
							alert(e);
						}        
						
					}, 1000);	
					
				}
				else
					alert(jret.error_msg);
				
			}
			else
				alert(jret.error_msg);
			
		}
		else
		{
			alert("Invalid login");
			//window.close();
		}
	}    
	catch(e)
	{
		alert(e);
		//window.close();
	}
}

function onBrowserDeviceSelect(si)
{
	try
	{ 
	
		for (deviceName in browserData.devices.attributes.devices)
		{
			document.getElementById("li_"+deviceName).className="nav-item";
		}    
		
		document.getElementById("li_"+si).className="nav-item active";
		
		browserData.cursi=si;
		
		onBrowserCloseChartRT();		
		onBrowserCloseChartH();		
		onBrowserCloseMap();		
		
		if (browserData.devices.attributes.devices[si].config.download)
			document.getElementById("downloadCommand").style.display="block";
		else
			document.getElementById("downloadCommand").style.display="none";
		
		if (browserData.devices.attributes.devices[si].config.gps)
			document.getElementById("gpsCommand").style.display="block";
		else
			document.getElementById("gpsCommand").style.display="none";
		
		if (browserData.devices.attributes.devices[si].config.get)
			document.getElementById("getCommand").style.display="block";
		else
			document.getElementById("getCommand").style.display="none";
		
		
		onBrowserDrawPinList(si, browserData.devices.attributes.devices[si]);

		browserData.chartRT.reset();
	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserPinMail(si, pin)
{
	try
	{ 
		var email=prompt("Enter email destination address");
		if (email!=null)
		{
			var d=browserData.data[si].value[pin].V;
			var subject="Device:"+si+" Pin:"+pin;
			var text=subject+" Current time:"+msToStr()+" Value:"+d;
			var ret=httpGet(getUrl()+"/?func=send_mail&user="+browserData.user+"&pwd="+browserData.pwd+"&subject="+subject+"&mailto="+email+"&text="+text);
			var jret=JSON.parse(ret);
			if (jret.error)
			{
				alert(jret.error_msg);
			}
		}
	}    
	catch(e)
	{
		//alert(e);
	}
}

function onBrowserSetAlert()
{
	try
	{ 
		var div=document.getElementById("alerList");
		if (div)
		{ 
			div.innerHTML="";
			
			if (browserData.alert.length>0)
			{ 
				document.getElementById("alerListCount").style.display="block";
				document.getElementById("alerListCount").innerHTML=""+browserData.alert.length;
			}
			else
				document.getElementById("alerListCount").style.display="none";
			
			
			for (var i=0; i<browserData.alert.length; i++)
			{ 
				var item=msToStrTime(browserData.alert[i].payload.T)+" "+browserData.alert[i].payload.sub//+" "+browserData.alert[i].payload.text;
				
				var tag='<a class="dropdown-item" id="alert_"'+i+' onclick="onBrowserClickAlert('+i+')">'+item+'</a>';
				
				div.innerHTML=div.innerHTML+tag;
			}    
			
		}    
	}    
	catch(e)
	{
		//alert(e);
	}
}

function onBrowserClickAlert(id)
{
	if (browserData.alert.length>id)
	{
		var tt=splitTopic(browserData.alert[id].topic);	
		if (tt)
			onBrowserDeviceSelect(tt.device);
	}
}

function onBrowserDrawPinList(si, device)
{
	try
	{ 
		var div=document.getElementById("pinList");
		var tag=""
		for (pinName in device.config.values)
		{
			var icon="content_copy";
			if (device.config.values[pinName].IO)
			{
				if (device.config.values[pinName].IO.indexOf("I")>=0 && device.config.values[pinName].IO.indexOf("O")>=0)
					icon="vertical_align_center";
				else if (device.config.values[pinName].IO.indexOf("I")>=0)
					icon="vertical_align_bottom";
				else if (device.config.values[pinName].IO.indexOf("O")>=0)
					icon="vertical_align_top";
			}
			
            tag=tag+='<div class="col-lg-3 col-md-6 col-sm-6"> \
              <div class="card card-stats"> \
                <div class="card-header card-header-warning card-header-icon"> \
                  <div class="card-icon"> \
                    <div class="material-icons" id="pinwidgetio_'+si+'_'+pinName+'">'+icon+'</div> \
                    <div class="material-icons" id="pinwidget_'+si+'_'+pinName+'">content_copy</div> \
                  </div> \
                  <p class="card-category">'+nnvl(device.config.values[pinName].desc, pinName)+'</p> \
                  <h3 class="card-title" id="pinvalue_'+si+'_'+pinName+'">0</h3> \
                  <h3 class="card-title"><small>'+device.config.values[pinName].U+'</small></h3> \
                  </h3> \
                </div> \
                <div class="card-footer"> \
                  <div class="stats"> \
                    <i class="material-icons text-danger" id="pintimeicon_'+si+'_'+pinName+'">warning</i><div  id="pintime_'+si+'_'+pinName+'">00:00:00</div>\
                    <i class="material-icons" onclick="onBrowserPinMail(\''+si+'\', \''+pinName+'\')">email</i>\
                    <i class="material-icons" onclick="onBrowserChartRT(\''+si+'\', \''+pinName+'\')">timeline</i>\
                    <i class="material-icons" onclick="onBrowserChartH(\''+si+'\', \''+pinName+'\')">leaderboard</i>\
                  </div> \
                </div>';
				
				if (device.config.values[pinName].SV)
				{
					tag=tag+'<div class="card-footer"> \
					  <div class="stats"> \
						<i class="material-icons">vertical_align_top</i><div id="pinmax_'+si+'_'+pinName+'"></div>\
					  </div> \
					</div> \
					<div class="card-footer"> \
					  <div class="stats"> \
						<i class="material-icons">vertical_align_bottom</i><div id="pinmin_'+si+'_'+pinName+'"></div>\
					  </div> \
					</div>';
				}
                tag=tag+'</div></div>';			
		}
		div.innerHTML=tag;	

		for (pinName in device.config.values)
		{
			
			if (device.config.values[pinName].gui && device.config.values[pinName].gui.style)
			{
				if (device.config.values[pinName].gui.style=="gauge")
				{
					var div=document.getElementById('pinwidget_'+si+'_'+pinName);
					div.innerHTML="";
					div.className="";
					initGauge(div, pinName, device.config.values[pinName], device);
					setGauge(device.si, pinName, nvl(device.config.values[pinName].DEFAULT, ""));
				}
				else if (device.config.values[pinName].gui.style=="combo")
				{
					var div=document.getElementById('pinwidget_'+si+'_'+pinName);
					div.innerHTML="";
					div.className="";
					initCombo(div, pinName, device.config.values[pinName], device);
					setCombo(device.si, pinName, nvl(device.config.values[pinName].DEFAULT, ""));
				}
				else if (device.config.values[pinName].gui.style=="led")
				{
					var div=document.getElementById('pinwidget_'+si+'_'+pinName);
					div.innerHTML="";
					div.className="";
					initLed(div, pinName, device.config.values[pinName], device);
					setLed(device.si, pinName, nvl(device.config.values[pinName].DEFAULT, ""));
				}
				else /*if (device.config.values[pinName].gui.style=="value")*/
				{
					var div=document.getElementById('pinwidget_'+si+'_'+pinName);
					div.innerHTML="";
					div.className="";
					initValue(div, pinName, device.config.values[pinName], device);
					setValue(device.si, pinName, nvl(device.config.values[pinName].DEFAULT, ""));
				}
			}
			else
			{
				var div=document.getElementById('pinwidget_'+si+'_'+pinName);
				div.innerHTML="";
				div.className="";
				initValue(div, pinName, device.config.values[pinName], device);
				setValue(device.si, pinName, nvl(device.config.values[pinName].DEFAULT, ""));
			}
		}
			
		
	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserMap(refresh)
{
	try
	{ 
		if (browserData && browserData.dataRT && browserData.dataRT[browserData.cursi])
		{ 
			var Len=browserData.dataRT[browserData.cursi].length;
			
			if (Len<=0)
				return;
				
			if (refresh || document.getElementById("mapContiner").style.display=="none")
			{ 
				document.getElementById("mapContiner").style.display="block";				
			}    
			else
			{ 
				document.getElementById("mapContiner").style.display="none";
				return;
			}    
			
			var D=browserData.dataRT[browserData.cursi][Len-1];
			onMap(D.T, D.gps, refresh);
		}    
	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserCloseMap()
{
	try
	{ 
		document.getElementById("mapContiner").style.display="none";
	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserCloseChartRT()
{
	try
	{ 
		//document.getElementById("chartContiner").style.display="none";
		document.getElementById("chartRtContiner").style.display="none";
		if (document.getElementById("chartHContiner").style.display=="none")
			document.getElementById("chartContiner").style.display="none";
		
		//document.getElementById("chartHContiner").style.display="none";
	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserCloseChartH()
{
	try
	{ 
		//document.getElementById("chartContiner").style.display="none";
		//document.getElementById("chartRtContiner").style.display="none";
		document.getElementById("chartHContiner").style.display="none";
		if (document.getElementById("chartRtContiner").style.display=="none")
			document.getElementById("chartContiner").style.display="none";
	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserChartRT(si, pin)
{
	try
	{ 
		document.getElementById("chartContiner").style.display="block";
		document.getElementById("chartRtContiner").style.display="block";
		
	
		var bd=nnvl(browserData.devices.attributes.devices[si].config.desc, si);
		var pd=nnvl(browserData.devices.attributes.devices[si].config.values[pin].desc, pin);
				
		browserData.curpin=pin;
		document.getElementById("currentpin").innerHTML="Board:"+bd+" Pin:"+pd;	
		document.getElementById("chartRTtitle").innerHTML="Realtime value of pin '"+pd+"'";	
		
		browserData.chartRT.update(browserData.dataRT[si], pin);
		browserData.chartRT.exec();
		
		goToAnchor("chartRTanchor");

	}    
	catch(e)
	{
		alert(e);
	}
}

function onBrowserChartEditH()
{
	onBrowserChartH(browserData.cursi, browserData.curpin);
}

function onBrowserChartH(si, pin)
{
	try
	{ 
		document.getElementById("chartContiner").style.display="block";
		document.getElementById("chartHContiner").style.display="block";
	
	
		var bd=nnvl(browserData.devices.attributes.devices[si].config.desc, si);
		var pd=nnvl(browserData.devices.attributes.devices[si].config.values[pin].desc, pin);
		
		
		browserData.curpin=pin;
		document.getElementById("currentpin").innerHTML="Board:"+bd+" Pin:"+pd;
		document.getElementById("chartHtitle").innerHTML="";	
		

		var year=prompt("Enter year of date", new Date().getFullYear());
		if (year!=null)
		{									
			var month=prompt("Enter month of date", new Date().getMonth()+1);
			if (month!=null)
			{
				document.getElementById("chartHtitle").innerHTML="Historical value of pin '"+pd+"' for "+year+"-"+month;	
				
				var data=httpGet(getUrl()+"/?func=get_data&user="+browserData.user+"&pwd="+browserData.pwd+"&si="+browserData.cursi+"&year="+year+"&month="+month);
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
					
					browserData.chartH.update(jdata, browserData.curpin);
					browserData.chartH.exec();
					
					goToAnchor("chartHanchor");
																			
				}
				catch(e)
				{
					alert(e)
				}
			}
			else
				onBrowserCloseChartH();
		}
		else
			onBrowserCloseChartH();
		
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

function onDownloadDataCommand()
{
	var year=prompt("Enter year of date", new Date().getFullYear());
	if (year!=null)
	{									
		var month=prompt("Enter month of date", new Date().getMonth()+1);
		if (month!=null)
		{
			var data=httpGet(getUrl()+"/?func=get_data&user="+browserData.user+"&pwd="+browserData.pwd+"&si="+browserData.cursi+"&year="+year+"&month="+month);
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
				
				download("download_"+year+"_"+month+"_"+browserData.cursi+".json", JSON.stringify(jdata, null, 2));
			
			}
			catch(e)
			{
				alert(e)
			}
		}
	}
}

function onGetDataCommand()
{
	try
	{ 

		var jpayload={'T':new Date().getTime(), 'cmd':'get_data'};								
		browserData.mqttclient.send(makeTopic(browserData.cursi, "in"), JSON.stringify(jpayload));								
	}    
	catch(e)
	{
		alert(e);
	}
}

function onMap(T, gps, refresh)
{
	if (!browserData.gps[browserData.cursi])
		browserData.gps[browserData.cursi]={lat:0, lng:0, alt:0};
	
	if (!refresh && browserData.gps[browserData.cursi].lat==gps.lat && browserData.gps[browserData.cursi].lng==gps.lng && browserData.gps[browserData.cursi].alt==gps.alt)
	{	
		return;
	}
//-------------------------	
	if (browserData.map)
		browserData.map.remove();

	browserData.map = L.map('mapdiv').setView([gps.lat, gps.lng], 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(browserData.map);

	var label="<b>"+msToStrDate(T)+" "+msToStrTime(T)+"</b><br>";

	if (gps.alt!=null)
		label=label+"<b>ground clearance</b><br/>"+gps.alt+" mt.";


	L.marker([gps.lat, gps.lng]).addTo(browserData.map)
		.bindPopup(label)
		.openPopup();

	goToAnchor("mapanchor");
}