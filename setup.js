const { exec } = require("child_process");
const fs = require('fs');

var jDEMO_01234={
  'version': '3.0',
  'config': {
    'TIMEOUT': 30000,
    'TIMEOUT_MAX': 1800000,
    'BOUD': 5000,
    'desc': '',
    'gps': true,
    'download': true,
    'get': true,
    'values': {
      'P0': {
        'O': 0,
        'D': 2,
        'S': '0.01',
        'T': 'float',
        'U': '',
        'IO': 'O',
        'SV': true,
        'MIN': -1,
        'MAX': 1,
        'ALERT_MIN': -0.8,
        'ALERT_MAX': 0.8,
		'DEFAULT':0,
        'desc': '',
		'gui':{'style':'gouge'}
      },
      'P1': {
        'O': 1,
        'D': 2,
        'S': '0.01',
        'T': 'float',
        'U': '',
        'IO': 'O',
        'SV': true,
        'MIN': -1,
        'MAX': 1,
        'ALERT_MIN': -0.8,
        'ALERT_MAX': 0.8,
		'DEFAULT':0,
        'desc': '',
		'gui':{'style':'gouge'}
      },
      'P2': {
        'O': 2,
        'D': 2,
        'S': '0.01',
        'T': 'float',
        'U': 'Radiants',
        'IO': 'O',
        'SV': false,
        'MIN': 0,
        'MAX': 99999999,
        'ALERT_MIN': 0,
        'ALERT_MAX': 0,
		'DEFAULT':0,
        'desc': '',
		'gui':{'style':'gouge'}
      },
      'P3': {
        'O': 3,
        'D': 2,
        'S': '0.01',
        'T': 'float',
        'U': 'Radiants',
        'IO': 'I',
        'SV': false,
        'MIN': 0,
        'MAX': 99999999,
        'ALERT_MIN': 0,
        'ALERT_MAX': 0,
		'DEFAULT':0,
        'desc': '',
		'gui': {
          'style': 'combo',
          'values': [
            {
              'V': 0,
              'D': '0'
            },
            {
              'V': 1,
              'D': '1'
            },
            {
              'V': 2,
              'D': '2'
            }
          ]
        }
      },
      'P4': {
        'O': 3,
        'D': 2,
        'S': '0',
        'T': 'int',
        'U': '',
        'IO': 'IO',
        'SV': false,
        'MIN': 0,
        'MAX': 1,
        'ALERT_MIN': 0,
        'ALERT_MAX': 1,
		'DEFAULT':0,
        'desc': 'Led',
        'gui': {
          'style': 'led',
          'C': '#cccccc',
          'values': [
            {
              'V': 0,
              'C': '#cccccc'
            },
            {
              'V': 1,
              'C': '#ff0000'
            },
            {
              'V': 2,
              'C': '#00ff00'
            }
          ]
        }
      }
    }
  }
};

var T=null;

if (fs.existsSync(__dirname+"/install.txt"))
	fs.unlinkSync(__dirname+"/install.txt");


process.stdin.resume();
step0();

//-------------------------------------------------
function getKey(label, def)
{
	var BUFSIZE=256;
	var buf = Buffer.alloc(BUFSIZE); //new Buffer(BUFSIZE);
	var key="";
	
	var bytesRead=0;
	while (key=="") 
	{
		console.log(label);
		bytesRead=fs.readSync(process.stdin.fd, buf, 0, BUFSIZE);
		
		key="";
		for (var i=0; i<buf.toString().length && buf.toString().charCodeAt(i)!=0; i++)
		{
			//console.log(i, buf.toString().charCodeAt(i));
			if (buf.toString().charCodeAt(i)!=13 && buf.toString().charCodeAt(i)!=10)
				key=key+buf.toString().substring(i, i+1);
		}	
		
		
		key=key.trim();		
		if (key=="")
		{
			if (def)
			{
				key=def;
			}	
		}	
		
		//console.log("<<", key);
	}
	
	return key;
}

function step0()
{
	try
	{
		console.log('Current directory:', __dirname);
		
		var key=getKey('Do you accept current directory setup? [Yes/no/quit + <enter>]', null);
		if (key.substring(0, 1).toUpperCase()=="Y")
			step1();
		else
		{
			console.log('Setup process aborted, change directory and repeat setup');
			process.exit(-1);
		}
	} 
	catch(e) 
	{
		console.log('install error ', e);
	}		
}


function step1()
{
	try
	{
		console.log();
		
		var superuser="";
		var superpwd="";
		var log=false;
		var MAIL_URL="";
		var USE_MAIL_SERVER=false;
		var MAIL_HOST="";
		var MAIL_FROM="";
		var MAIL_FROM_NAME="";
		
		
		var webport=80;
		var websslport=443;
		var weburl="";
		var mqttip="";
		var mqttipv4="";
		var mqttport=1883;
		var mqttsslport=8883;
		var mqttwsport=8083;
		var mqttwssport=8084;	

		superuser=getKey('Enter superuser (email):', null);
		superpwd=getKey('Enter superuser password:', null);
		var key=getKey('Do you want to active log? [Yes/no]:', null);
		if (key.substring(0, 1).toUpperCase()=="Y")
			log=true;
		
		var key=getKey('Do you want use server Mail? [Yes/no]:', null);
		if (key.substring(0, 1).toUpperCase()=="Y")
		{
			USE_MAIL_SERVER=true;	
			MAIL_URL=getKey('Enter MAIL_URL (example http://mydomain.com/sendMail.php):', null);
			MAIL_HOST=getKey('Enter MAIL_HOST:', null);
			MAIL_FROM=getKey('Enter MAIL_FROM:', null);
			MAIL_FROM_NAME=getKey('Enter MAIL_FROM_NAME:', null);
			
		}
		webport=getKey('Enter HTTP PORT (example 80):', 80);
		websslport=getKey('Enter HTTPS PORT (example 443):', 443);
		
		weburl=getKey('Enter WEB URL or SERVER IP without protocol (example zzigto.net or 192.168.0.123):', null);
		mqttip=getKey('Enter MQTT SERVER URL without protocol or SERVER IP (example service.zzigto.net or 192.168.0.123):', null);
		mqttipv4=getKey('Enter MQTT IP ADDRESS  (example 192.168.0.123):', null);
		mqttport=getKey('Enter MQTT TCP PORT  (example 1883):', 1883);
		mqttsslport=getKey('Enter MQTT TCP/SSL  (example 8883):', 8883);
		mqttwsport=getKey('Enter MQTT WS PORT  (example 8083):', 8083);
		mqttwssport=getKey('Enter MQTT WSS PORT  (example 8084):', 8084);
		
		if (!fs.existsSync(__dirname+"/system"))
			fs.mkdirSync(__dirname+"/system");
		
		
		var jreservedsystem=
		{
		//'passphrase':'Mario1961',
		'superuser':superuser,
		'demoModelOwner':superuser,
		'demoModelName':'DEMO-01234.json',
		'superpwd':superpwd,
		'homedir':__dirname,
		'log':log,
		
		'USE_MAIL_SERVER':USE_MAIL_SERVER,
		'MAIL_URL':MAIL_URL,
		'MAIL_HOST':MAIL_HOST,
		'MAIL_FROM':MAIL_FROM,
		'MAIL_FROM_NAME':MAIL_FROM_NAME
		
		}
		
		var jsystem={
		'webport': webport, 
		'websslport': websslport, 
		'weburl': weburl,
		'enabelJson':true,
		'enabelHtml':true,
		'mqttip': mqttip,	
		'mqttipv4': mqttipv4,	
		'mqttipv6': '',	
		'mqttport': mqttport,
		'mqttsslport': mqttsslport,	
		'mqttwsport': mqttwsport,
		'mqttwssport': mqttwssport
		};
		
		
		console.log("");
		console.log("");
		console.log("Data summary:");
		console.log("---------------------------------");
		console.log(JSON.stringify(jreservedsystem, null, 2));
		console.log(JSON.stringify(jsystem, null, 2));
		console.log("---------------------------------");
		
		var key=getKey('Do you want to continue? [Yes/no/quit + <enter>]', null);
		if (!key.substring(0, 1).toUpperCase()=="Y")
		{
			console.log('Setup process aborted');
			process.exit(-1);
		}
		else
		{
		
			fs.writeFileSync(__dirname+"/system/system.json", JSON.stringify(jsystem, null, 2), { mode: 0o777 });
			fs.writeFileSync(__dirname+"/system/reservedsystem.json", JSON.stringify(jreservedsystem, null, 2), { mode: 0o777 });
			
			
			step2(superuser, superpwd);
		
		} 
	} 
	catch(e) 
	{
		console.log('install error ', e);
		process.exit(-1);
	}		
}

function step2(user, pwd)
{
	try
	{
		createAccount(user, pwd);
		createModel(user)
		step3();
	} 
	catch(e) 
	{
		console.log('install error ', e);
		process.exit(-1);
	}		
}

function step3()
{
	try
	{
		installModules();	
	} 
	catch(e) 
	{
		console.log('install error ', e);
		process.exit(-1);
	}		
}

function step4()
{
	try
	{
		console.log('nodejs modules installed');
		stepEnd();
	} 
	catch(e) 
	{
		console.log('install error ', e);
		process.exit(-1);
	}		
}

function stepEnd()
{
	try
	{
		console.log('Setup completed');	
		process.exit(-1);
	} 
	catch(e) 
	{
		console.log('install error ', e);
		process.exit(-1);
	}		
}

function installModules()
{
	try 
	{
		T = setInterval(function () 
		{
			process.stdout.write(".");			
		}, 1000);
		
		
		exec('npm install', (error, stdout, stderr) => 
		{
			try 
			{
				/*if (error) 
				{
					console.log('error', error);
					return;
				}
				if (stderr) 
				{
					console.log('stderr', stderr);
					return;
				}*/
				fs.writeFileSync(__dirname+"/install.txt", stdout, { mode: 0o777 });
				
				point=false;
				step4();
				//console.log('stdout', stdout);
				clearInterval(T);
			} 
			catch(e) 
			{
				console.log('install error ', e);
				clearInterval(T);
			}
		});
	} 
	catch(e) 
	{
		console.log('install error ', e);
	}
}

function createAccount(user, pwd)
{
	try 
	{
		if (!fs.existsSync(__dirname+"/accounts/"))
			fs.mkdirSync(__dirname+"/accounts/");
		
		if (!fs.existsSync(__dirname+"/accounts/"+user))
			fs.mkdirSync(__dirname+"/accounts/"+user);
			
		var jattributes=
			{
			  'hm': '1',
			  'tz': '0',
			  'user': user,
			  'pwd': pwd,
			  'mqttip': '',
			  'mqttuser': '',
			  'mqttpassword': '',
			  'mqttport': '',
			  'mqttwsport': '',
			  'mqttsslport': '',
			  'mqttwssport': '',
			  'code': new Date().getTime()+".1234",
			  'status': true
			};

			fs.writeFileSync(__dirname+"/accounts/"+user+"/"+user+".json", JSON.stringify(jattributes, null, 2), { mode: 0o777 });
	} 
	catch(e) 
	{
		console.log('createAccount error ', e);
	}
}

function createModel(user)
{
	try 
	{
		if (!fs.existsSync(__dirname+"/models"))
			fs.mkdirSync(__dirname+"/models");
		
		if (!fs.existsSync(__dirname+"/models/"+user))
			fs.mkdirSync(__dirname+"/models/"+user);
							
		fs.writeFileSync(__dirname+"/models/"+user+"/DEMO-01234.json", JSON.stringify(jDEMO_01234, null, 2), { mode: 0o777 });
	} 
	catch(e) 
	{
		console.log('createAccount error ', e);
	}
}


