function createPinId(device, pinName)
{
	return device.si+"."+pinName;
}
//--------------------
//GOUGE
//--------------------
function initGauge(td, pinId, pin, device)
{
	//"gui":{"style":"gouge"}
	
	var canvas = document.createElement('canvas');
	canvas.id=createPinId(device, pinId)+"_widget";
	canvas._type="gauge";
	
	canvas._pin=device.config.values[pinId];
	canvas._pinName=pinId;
	td.appendChild(canvas);
		
	
	var tag=document.getElementById(canvas.id);
	if (!tag)	return;
	
	if (pin.S==null || pin.S===undefined || isNaN(Number(pin.S))) pin.S=0;
	else pin.S=Number(pin.S);
	
	if (pin.ALERT_MIN<pin.MIN) pin.ALERT_MIN=pin.MIN;
	if (pin.ALERT_MAX>pin.MAX) pin.ALERT_MAX=pin.MAX;
	
	
    var myHighlightsHP = [
        { from: pin.MIN, to: pin.ALERT_MIN, color: 'rgba(0,0,255,.8)'},
        { from: pin.ALERT_MAX, to: pin.MAX, color: 'rgba(255,0,0,.8)'}
    ];
	
	var r=pin.S;
	var k=0;
	while(r<1 && k<10) {r=r*10; k++};
	
    //var myMajorTicksHP = ['0', '100', '200', '300', '400', '450'];
    var myMajorTicksHP = [];
	myMajorTicksHP[0]=pin.MIN;
	
	var v=pin.MIN;
	for (var i=0; i<4; i++)
	{
		v=v+(pin.MAX-pin.MIN)/5;
		myMajorTicksHP[myMajorTicksHP.length]=Number(parseFloat(""+v).toFixed(k));
	}
	myMajorTicksHP[myMajorTicksHP.length]=pin.MAX;
	
    var myCommonProp = {
        width: 150,
        height: 150,
        value: 1,
        colorPlate: '#F0F0F0',
        colorMajorTicks: '#222',
        colorMinorTicks: '#222',
        colorTitle: '#222',
        colorUnits: '#222',
        colorNumbers: '#222',
        colorNeedle: 'rgba(240, 128, 128, 1)',
        colorNeedleEnd: 'rgba(255, 160, 122, .9)',
        valueBox: false
    };
	if (pin.gui && pin.gui.font)
	{
		//if (pin.gui.font.fontFamily)
		//	option.style.fontFamily=pin.gui.font.fontFamily;
	
		//if (pin.gui.font.fontSize)
		//	option.style.fontSize=pin.gui.font.fontSize;
	}
	

    var myAnimation = {
        animationRule: 'decycle',
        animationDuration: 500
    };

    var myCommonPropHP=Object.assign({},
        myCommonProp,
        myAnimation,
        {
            units:pin.U,
            minValue:pin.MIN, maxValue:pin.MAX,
            majorTicks:myMajorTicksHP,
            highlights:myHighlightsHP
        }
    );

	var title=pinId;
	if (pin.desc)
		title=pin.desc;
    var hpaConfig = Object.assign({},
        { renderTo: canvas.id, title: title },
        myCommonPropHP
    );
	
    tag._gauge = new RadialGauge(hpaConfig);

    function onRender() 
	{
        //console.log(this._value, this.value);
    }

    tag._gauge.on('render', onRender);
    tag._gauge.draw();
}


function initCombo(td, pinId, pin, device)
{
	//"gui":{"style":"combo", "values":[{"V":0, "D":"0"}, {"V":1, "D":"1"}, {"V":2, "D":"2"}]}
	if (device.config.values[pinId].IO.indexOf("I")<0) return;
		
	var select = document.createElement('select');
	select.id=createPinId(device, pinId)+"_widget";
	select._type="combo";
	
	select._device=device;
	select._pin=device.config.values[pinId];
	select._pinName=pinId;
	select.className="widgetCombo";
	select.style.width="162px",
	select.style.height="168px",
	select.onchange = function()
	{
		var jpayload={'T':new Date().getTime(), 'cmd':'set'};
		jpayload[this._pinName]=this.value;
										
		GLOBAL_MQTT.send(makeTopic(this._device.si, "in"), JSON.stringify(jpayload));				
	};
	td.appendChild(select);
	
	if (pin.gui && pin.gui.font)
	{
		if (pin.gui.font.fontFamily)
			select.style.fontFamily=pin.gui.font.fontFamily;
	
		if (pin.gui.font.fontSize)
			select.style.fontSize=pin.gui.font.fontSize;
	}
	
	
	for (var i=0; i<device.config.values[pinId].gui.values.length; i++)
	{
		var option = document.createElement("option");
		option.text = device.config.values[pinId].gui.values[i].D;
		option.value = device.config.values[pinId].gui.values[i].V;
		
		if (pin.gui && pin.gui.font)
		{
			if (pin.gui.font.fontFamily)
				option.style.fontFamily=pin.gui.font.fontFamily;
		
			if (pin.gui.font.fontSize)
				option.style.fontSize=pin.gui.font.fontSize;
		}
		
		select.add(option);	
	}
		
}

function initValue(td, pinId, pin, device)
{
	//"gui":{"style":"value"}	
	
	var div = document.createElement('div');
	div.id=createPinId(device, pinId)+"_widget";
	div._type="value";
	
	div._device=device;
	div._pin=device.config.values[pinId];
	div._pinName=pinId;
	div.className="widgetValue";
	div.style.width="150px";
	div.style.height="150px";
	if (pin.gui && pin.gui.font)
	{
		if (pin.gui.font.fontFamily)
			div.style.fontFamily=pin.gui.font.fontFamily;
	
		if (pin.gui.font.fontSize)
			div.style.fontSize=pin.gui.font.fontSize;
	}
	
	if (device.config.values[pinId].IO.indexOf("I")>=0)
	{
		div.onclick = function()
		{
			var V=prompt("Enter pin Value");
			if (V!=null)
			{
				var jpayload={'T':new Date().getTime(), 'cmd':'set'};
				jpayload[this._pinName]=V;
												
				GLOBAL_MQTT.send(makeTopic(this._device.si, "in"), JSON.stringify(jpayload));				
			}
		};
	}
	td.appendChild(div);	
}

function initLed(td, pinId, pin, device)
{
	//"gui":{"style":"value", "C":"#cccccc", "values":[{"V":0, "C":"#cccccc"}, {"V":1, "C":"#ff0000"}, {"V":2, "C":"#00ff00"}]}
	
	if (device.config.values[pinId].IO.indexOf("O")<0) return;
	
	var div = document.createElement('div');
	div.id=createPinId(device, pinId)+"_widget";
	div._type="led";
	
	div._device=device;
	div._pin=device.config.values[pinId];
	div._pinName=pinId;
	div.className="widgetLed";
	div.style.width="135px";
	div.style.height="135px";
	td.appendChild(div);
	if (pin.gui && pin.gui.font)
	{
		if (pin.gui.font.fontFamily)
			div.style.fontFamily=pin.gui.font.fontFamily;
	
		if (pin.gui.font.fontSize)
			div.style.fontSize=pin.gui.font.fontSize;
	}
	
	div.style.background=device.config.values[pinId].gui.C;
}

function setGauge(si, pinId, value)
{
	var tagId=si+"."+pinId+"_widget";
	var tag=document.getElementById(tagId);
	if (!tag)	return;
	
    //tag._gauge.on('render', onRender);
	
    tag._gauge.value = value;
    tag._gauge.draw();
}

function setCombo(si, pinId, value)
{
	var select = document.getElementById(si+"."+pinId+"_widget");
	if (!select) return;
	select.value=value;
}

function setValue(si, pinId, value)
{
	var div = document.getElementById(si+"."+pinId+"_widget");
	if (!div) return;
	div._value=value;
	div.innerHTML=value;
}

function setSlider(si, pinId, value)
{
}

function setLed(si, pinId, value)
{
	var div = document.getElementById(si+"."+pinId+"_widget");
	if (!div) return;
	div.value=value;
	
	
	for (var i=0; i<browserData.devices.attributes.devices[si].config.values[pinId].gui.values.length; i++)
		if (browserData.devices.attributes.devices[si].config.values[pinId].gui.values[i].V==value)
			div.style.background=browserData.devices.attributes.devices[si].config.values[pinId].gui.values[i].C;

}
