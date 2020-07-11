const http = require('http');
const https = require('https');
const urlparse = require('url');
const querystring = require('querystring');

class zzhttprequest
{
    constructor()
    {
    }
    
    get(url, callback)
    {
		var query=null;
		var purl=urlparse.parse(url);
		if (purl.query)
			query = querystring.parse(purl.query);

        var data="";
        try
        {
            if (url.startsWith("https:"))
            {
                https.get(url, (resp) => 
                {
                    resp.on('data', (chunk) => 
                    {
                        data += chunk;
                    });

                    resp.on('end', () => 
                    {
						try
						{
							if (callback)
								var jdata=JSON.parse(data);
								jdata.event_type="server";
								callback.onResult({event_type:"client", error_code:0, error:false, error_msg:"", url:url, data:jdata, purl:purl, query:query});
						}
						catch(e)
						{
							if (callback) 
								callback.onResult({event_type:"client", error_code:-898, error:true, error_msg:e.message, url:url, purl:purl, query:query});            
						}
                    });

                    }).on("error", (err) => 
                    {
                        if (callback)
                            callback.onResult({event_type:"client", error_code:-899, error:true, error_msg:err, url:url, purl:purl, query:query});
                    });
                
            }
            else
            {
                http.get(url, (resp) => 
                {
                    resp.on('data', (chunk) => 
                    {
                        data += chunk;
                    });

                    resp.on('end', () => 
                    {
                        if (callback)
                            var jdata=JSON.parse(data);
                            jdata.event_type="server";
                            callback.onResult({event_type:"client", error_code:0, error:false, error_msg:"", url:url, data:jdata, purl:purl, query:query});
                    });

                    }).on("error", (err) => 
                    {
                        if (callback)
                            callback.onResult({event_type:"client", error_code:-899, error:true, error_msg:err, url:url, purl:purl, query:query});
                    });
            }
        }
        catch(e)
        {
            if (callback) 
                callback.onResult({event_type:"client", error_code:-898, error:true, error_msg:e.message, url:url, purl:purl, query:query});            
        }
    }
    
}

exports.zzhttprequest=zzhttprequest;

