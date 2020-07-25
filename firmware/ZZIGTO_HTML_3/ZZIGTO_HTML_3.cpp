#include "ZZIGTO_HTML_3.h"


String ZZIGTO_HTML_3::html_get(String SERVICEURL, String APPWD, String SSID, String SSIDPWD, String USER, String PWD, String SI, String BOUD)
{
String html= \
"<html>\n" \
"    <head>\n" \
"        <title>ESP32-8266 Web Setup</title>\n" \
"        <style>\n" \
"        .content \n" \
"        {\n" \
"          max-width: 500px;\n" \
"          margin: auto;\n" \
"          font-family: verdana;\n" \
"          color:#002244;\n" \
"          font-size: 12px;\n" \
"        }\n" \
"        </style>\n" \
"    </head>\n" \
"    <body>\n" \
"        <script>\n" \
"            function onDClick(id)\n" \
"            {\n" \
"                var tag=document.getElementById(id);\n" \
"                if (!tag.value)\n" \
"                    return;\n" \
"                if (tag.type=='password')\n" \
"                    tag.type='text';\n" \
"                else\n" \
"                    tag.type='password';\n" \
"            }\n" \
"            function onOk(id)\n" \
"            {\n" \
"                if (document.getElementById('APPWDC').value && document.getElementById('APPWDC').value!=document.getElementById('APPWD').value) {alert('New device password not match'); return;}\n" \
"                if (confirm('Caution!! The data you have edited will be saved in the memory of the card you have chosen, therefore they could be read by expert people. Are you sure you want to continue ?'))\n" \
"                    httpGet('http://192.168.4.1/func=set&SSID='+document.getElementById('SSID').value+'&SSIDPWD='+document.getElementById('SSIDPWD').value+'&USER='+document.getElementById('USER').value+'&USERPWD='+document.getElementById('PWD').value+'&BOUD='+document.getElementById('BOUD').value+'&APPWD='+document.getElementById('APPWDC').value+'&SERVICEURL='+document.getElementById('SERVICEURL').value);\n" \
"                else\n" \
"                    alert('operation canceled');\n" \
"            }\n" \
"            function httpGet(url)\n" \
"            {\n" \
"                 try\n" \
"                 {\n" \
"                     var xmlHttp = new XMLHttpRequest();\n" \
"                     xmlHttp.open( 'GET', url, false );\n" \
"                     xmlHttp.send( null );\n" \
"                     if (xmlHttp.responseText)\n" \
"                     {\n" \
"                        var jret=JSON.parse(xmlHttp.responseText);\n" \
"                        alert(jret.error_msg);\n" \
"                     }\n" \
"                     else\n" \
"                       alert('Invalid server response');\n" \
"                 }\n" \
"                 catch(e)\n" \
"                 {\n" \
"                     alert('tabledb: exception '+e);\n" \
"                 }\n" \
"             }\n" \
"        </script>\n" \
"        <font face='verdana' color='#002244'>\n" \
"        <font size='5'><b>ZZIGTO</b></font>\n" \
"        <font size='1'>ESP32/8266 firmware setup Version:1.10</font>\n" \
"        <div class='content'>\n" \
"            <br><br>\n" \
"           <table>\n" \
"                <tr><td>Device Id</td><td><input readonly type='text' id='SI' value='@SI@'></td></tr>\n" \
"                <tr><td>Service Url</td><td><input type='text' id='SERVICEURL' value='@SERVICEURL@'></td></tr>\n" \
"                <tr><td>Servial boudrate</td><td><select id='BOUD' value='@BOUD@'>\n" \
"                    <option value=\"300\">300</option>\n" \
"                    <option value=\"600\">600</option>\n" \
"                    <option value=\"1200\">1200</option>\n" \
"                    <option value=\"2400\">2400</option>\n" \
"                    <option value=\"4800\">4800</option>\n" \
"                    <option value=\"9600\">9600</option>\n" \
"                    <option value=\"14400\">14400</option>\n" \
"                    <option value=\"19200\">19200</option>\n" \
"                    <option value=\"28800\">28800</option>\n" \
"                    <option value=\"38400\">38400</option>\n" \
"                    <option value=\"57600\">57600</option>\n" \
"                    <option value=\"115200\" selected>115200</option>\n" \
"                </select></td></tr>\n" \

"                <tr><td>New device password</td><td><input type='password' id='APPWD' value='@APPWD@' ondblclick='onDClick(\"APPWD\")'></td></tr>\n" \
"                <tr><td>New device password confirm</td><td><input type='password' id='APPWDC'ondblclick='onDClick(\"APPWDC\")'></td></tr>\n" \
"                <tr><td>Router SSID</td><td><input type='text' id='SSID' value='@SSID@'></td></tr>\n" \
"                <tr><td>Router Password</td><td><input type='password' id='SSIDPWD' value='@SSIDPWD@' ondblclick='onDClick(\"SSIDPWD\")'></td></tr>\n" \
"                <tr><td>ZZIGTO User</td><td><input id='USER' value='@USER@'></td></tr>\n" \
"                <tr><td>ZZIGTO Password</td><td><input type='password' id='PWD' value='@PWD@' ondblclick='onDClick(\"PWD\")'></td></tr>\n" \
"                <tr><td><hr></td><td><hr></td></tr>\n" \
"                <tr><td><font size='1'>*double click on item for view/hide password</font></td><td><input type='button' id='ok' value='Confirm' style='width:100%' onclick='onOk()'></td></tr>\n" \
"            </table>\n" \
"        </font>\n" \
"        </div>\n" \
"    </body>\n" \
"</html>\n";

html.replace("@SI@", SI);
html.replace("@SERVICEURL@", SERVICEURL);
html.replace("@APPWD@", APPWD);
html.replace("@SSID@", SSID);
html.replace("@SSIDPWD@", SSIDPWD);
html.replace("@USER@", USER);
html.replace("@PWD@", PWD);
html.replace("@BOUD@", BOUD);

return html;
}
