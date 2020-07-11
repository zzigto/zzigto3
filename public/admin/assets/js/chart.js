class chart
{
    constructor(div, mode)
    {        
		this.mode=mode;
        this.data=null;
        this.div=div;
        this.config={type: "line", data:{labels: [], datasets:[]}, options:{}};
        this.chart=null;
		this.pin=null;
		this.axis=true;
		this.resize();
    }

    update(data, pin)
    {        
        this.data=data;
		this.pin=pin;
    }

    resize()
    {
		var oldaxis=this.axis;
		if (window.innerHeight>window.innerWidth)
			this.axis=false;
		else
			this.axis=true;
		
		if (oldaxis!=this.axis)
			this.exec();
    }
	
    reset()
    {
		this.pin=null;
        this.data=null;
		this.exec();
    }
    
    exec=function()
    {
        try
        {
            {                
                this.config.options={
                        animation: false,
                        responsive: true,
                        title: {
                                fontColor: "#ffffff",
                                display: false,
                                text: ""
                        },
                        legend: {
                                    display: false,
                                    labels: {
                                        fontColor: "#ffffff"
                                    }
                                },
                        tooltips: {
                                mode: 'index',
								enabled: false,
                                intersect: false
                        },
                        hover: {
                                mode: 'nearest',
                                intersect: true
                        },
                        scales: {
                                xAxes: [{
                                        ticks: {fontColor: '#ffffff'},
                                        display: this.axis,
                                        scaleLabel: 
										{
                                          display: this.axis
                                        }
                                }],
                                yAxes: [{
                                        ticks: {fontColor: '#ffffff', fontSize:8},
                                        display: this.axis,
                                        scaleLabel: {
                                                display: this.axis
                                        }
                                }]
                        }
                }                
            }
            
            this.config["data"]["datasets"]=[];
			
			if (this.mode=="R")
            {
				var record={};
				record["fill"]=false;
				record["backgroundColor"]='#ffffff';
				record["borderColor"]='#ffffff';
				record["borderWidth"]=2;
				record["pointRadius"]=2;
				record["data"]=[];
				
				this.config["data"]["labels"]=[];
				this.config["data"]["datasets"]=[];
				if (this.data && this.pin)
				{
					for (var id=0; id<this.data.length; id++)
					{
						this.config["data"]["labels"][id]=msToStrTime(this.data[id].T);
						
						record["data"][id]=this.data[id].value[this.pin].V;				
						
						this.config["data"]["datasets"][id]=record;				
					}
				}
			}
			if (this.mode=="H")
            {
				var record={};
				record["fill"]=false;
				record["backgroundColor"]='#ffffff';
				record["borderColor"]='#ffffff';
				record["borderWidth"]=2;
				record["pointRadius"]=2;
				record["data"]=[];
				
				this.config["data"]["labels"]=[];
				this.config["data"]["datasets"]=[];
				
				var id=0;
				if (this.data && this.pin)
				{
					for (var prop in this.data.data) 
					{
						var item=this.data.data[prop];
						for (var pin in item) 
						{
							if (pin==this.pin)
							{
								if (item[pin].TN<item[pin].TM)
								{							
									this.config["data"]["labels"][id]=msToStrShort(item[pin].TN);
									record["data"][id]=item[pin].N;				
									this.config["data"]["datasets"][id]=record;				
									id++;
									
									this.config["data"]["labels"][id]=msToStrShort(item[pin].TM);
									record["data"][id]=item[pin].M;
									this.config["data"]["datasets"][id]=record;
									id++;
								}
								else
								{							
									this.config["data"]["labels"][id]=msToStrShort(item[pin].TM);
									record["data"][id]=item[pin].M;
									this.config["data"]["datasets"][id]=record;
									id++;
									
									this.config["data"]["labels"][id]=msToStrShort(item[pin].TN);
									record["data"][id]=item[pin].N;				
									this.config["data"]["datasets"][id]=record;												
									id++;
								}
								
							}
						}
					}
				}
			}
            
			
			
			
            if (this.div)
            {    
                if (!this.chart)
                {
                    this.div.style.overflow="hidden";
                    this.div.innerHTML='<canvas id="chart_'+this.div.id+'" height="'+this.div.clientHeight+'" width="'+this.div.clientWidth+'"></canvas>';
                    var ctx = document.getElementById("chart_"+this.div.id).getContext('2d');

                    this.chart = new Chart(ctx, this.config);
                }
                else
                {
                    this.chart.options=this.config.options;
                    this.chart.update();
                }
            }
        }
        catch(e)
        {
            alert(e);
        }
    } 
    
}
