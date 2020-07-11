
class zzutils
{
    constructor(mode) 
    { 
		this.mode=mode;
    }
	
	log()
	{ 
		if (!this.mode)
			return;
		
		if (arguments.length==0)
			console.log();
		else
		{ 
			for (var i=0; i<arguments.length; i++)
				process.stdout.write(arguments[i]+" ")
			
			console.log();
			//let logLineDetails = ((new Error().stack).split("at ")[3]).trim();
			//console.log('DEBUG', new Date().toUTCString(), logLineDetails, "#"+buffer);			
		}
    }
	
	error()
	{ 
		
		if (arguments.length==0)
			console.log();
		else
		{ 
			for (var i=0; i<arguments.length; i++)
				process.stdout.write(arguments[i]+" ")
			
			console.log();
		}
    }
		
	logLine()
	{ 
		if (!this.mode)
			return;
		
		if (arguments.length==0)
			console.log();
		else
		{ 
			var logLineDetails = ((new Error().stack).split("at ")[3]).trim();
			console.log(new Date().toUTCString(), logLineDetails);			
			
			for (var i=0; i<arguments.length; i++)
				process.stdout.write(arguments[i]+" ")
			
			console.log();
		}
    }
	
    lPad(v, len, chpad)
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
	
}

exports.zzutils=zzutils;
