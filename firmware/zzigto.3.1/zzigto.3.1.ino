/*
{
  "T": 1592856451606,
  "type": "data",
  "seq": 1085,
  "value": {
    "P0": {
      "V": 0.67,
      "N": -1,
      "M": 1,
      "TN": 1592855670275,
      "TM": 1592855761100
    },
    "P1": {
      "V": 0.74,
      "N": -1,
      "M": 1,
      "TN": 1592855581690,
      "TM": 1592855677605
    },
    "P2": {
      "V": 13.3
    },
    "P3": {
      "V": 0.1
    }
  }
}
*/


//#include <stddef.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <HTTPClient.h>
//#include <WiFiClientSecure.h>

#include <EEPROM.h>
#include <Ticker.h>
#include <PubSubClient.h>
#include <ZZIGTO_HTML_3.h>

#define EEPROM_SIZE 300
#define BUTTON 0
#define MAX_NUM_PIN 16
#define JSON_LOGIN_CAPACITY 2048
#define JSON_REMOTE_CAPACITY 2048
#define JSON_TEMP_CAPACITY 256
#define JSON_SERIAL_CAPACITY 512

boolean PRINT=true;
ZZIGTO_HTML_3 html;
WiFiServer server(80);
WiFiClient espClient;
PubSubClient client(espClient);

DynamicJsonDocument jlogin(JSON_LOGIN_CAPACITY);
DynamicJsonDocument jserial(JSON_SERIAL_CAPACITY);
DynamicJsonDocument jremote(JSON_REMOTE_CAPACITY);
DynamicJsonDocument jTmp(JSON_TEMP_CAPACITY);

typedef struct zjson
{
  int error=0;
  String message="";
} ZJson;

typedef struct zfile
{
  int address;
  int len;
} ZFile;

typedef struct zclick
{
  int click_status=0;
  long click_time=0;
} ZClick;

typedef struct zstatus
{  
  int mode=0;
  int wifi=0;
  int login=0;
  int http=0;
  int mqtt=0;
  boolean mqttsenderror=0;
  int mqttsetsetver=0;
  int async1=0;
  int async2=0;
  int wifiConnLoop=0;
  int mqttConnLoop=0;
  String wifiIp="";
  String apIp="";
  //int dataChanged=0;
  int sendNow=0;
} ZStatus;

typedef struct zled
{  
  int AP=15;
  int RT=2;
  int WIFI=4;
  int LOGIN=5;
  int HTTP=18;
  int MQTT=19;
} ZLed;

typedef struct ztimers
{  
  long wifiTime=0;
  long loginTime=0;
  long configTime=0;
  long mqttTime=0;
  long sendTime=0;
  long emailTime=0;
  long interruptTime=0;
  long lastMillis=0;
  long print_status_time=0;
  long restart_request_time=0; 
  long lastMailTime=0;
  long lastAlertTime=0;
  long blinkTime=0;
  long mqttBlinkTime=0;
} ZTimers;

typedef struct zpin
{
  int id=-1;
  float V=0;
  float N=0;
  float M=0;
  boolean SV=0;
  float S=0;
  unsigned long T=0;
  unsigned long TN=0;
  unsigned long TM=0;
  unsigned long H=0;
  boolean CH=false;
} ZPin;

typedef struct zgps
{
  String lat="";
  String lng="";
  String alt="";
  boolean CH=false;
} ZGps;


//------------------------
//GLOBAL VARIABLES
//------------------------

String request="";
String  APPWDDEFAULT="0123456789";

String SI="";

String MODE="";
String SERVICEURL="";
String APPWD="";
String SSID="";
String SSIDPWD="";
String USER="";
String PWD="";
String BOUD="";
String remote="";
unsigned long START_MILLIS=0;
unsigned long STARTTIMESEC=0;
String MODEL="";
String OWNER="";
int TZ=0;
ZStatus status;
ZTimers timers;
ZPin PIN[MAX_NUM_PIN];
ZGps GPS;
ZLed LEDARRAY;
ZClick CLICK;
unsigned int SEQ=0;

void setLed()
{
  if (CLICK.click_status==1)
  {
    offLed(LEDARRAY.AP);
    offLed(LEDARRAY.RT);
    offLed(LEDARRAY.WIFI);
    offLed(LEDARRAY.LOGIN);
    offLed(LEDARRAY.HTTP);
    offLed(LEDARRAY.MQTT);

    if (millis()-CLICK.click_time>4000)
    {
      onLed(LEDARRAY.AP);
      delay(2000);
      offLed(LEDARRAY.AP);

      asyncFunc1();
    }
        
    return;
  }
  //--------------------------------
  
  if (LEDARRAY.AP>=0)
  {
    if (status.mode==1)
    {
      if (millis()-timers.blinkTime>1000)
      {
        if (digitalRead(LEDARRAY.AP))
          digitalWrite (LEDARRAY.AP, LOW);
        else
          digitalWrite (LEDARRAY.AP, HIGH);
        
        digitalWrite (LEDARRAY.RT, LOW);
        timers.blinkTime=millis();
      }
    }
  }
  if (LEDARRAY.RT>=0)
  {
    if (status.mode==0)
    {
      if (millis()-timers.blinkTime>1000)
      {
        if (digitalRead(LEDARRAY.RT))
          digitalWrite (LEDARRAY.RT, LOW);
        else
          digitalWrite (LEDARRAY.RT, HIGH);
        
        digitalWrite (LEDARRAY.AP, LOW);
        timers.blinkTime=millis();
      }
    }
  }
  if (LEDARRAY.WIFI>=0)
  {
    if (status.wifi==0)
      digitalWrite (LEDARRAY.WIFI, LOW);
    else
      digitalWrite (LEDARRAY.WIFI, HIGH);
  }
  if (LEDARRAY.LOGIN>=0)
  {
    if (status.login==0)
      digitalWrite (LEDARRAY.LOGIN, LOW);
    else
      digitalWrite (LEDARRAY.LOGIN, HIGH);
  }
  if (LEDARRAY.HTTP>=0)
  {
    if (status.http==0)
      digitalWrite (LEDARRAY.HTTP, LOW);
    else
      digitalWrite (LEDARRAY.HTTP, HIGH);    
  }

  //Serial_println("setLed.MQTT.1:"+String(LEDARRAY.MQTT)+" "+String(status.mqtt)+" "+String(status.mqttsenderror));
  if (LEDARRAY.MQTT>=0)
  {
    if (status.mqtt==0)
      digitalWrite (LEDARRAY.MQTT, LOW);
    else
    {
      if (!status.mqttsenderror)
        digitalWrite (LEDARRAY.MQTT, HIGH);    
      else
      {
        if (millis()-timers.mqttBlinkTime>500)
        {
          if (digitalRead(LEDARRAY.MQTT))
            digitalWrite (LEDARRAY.MQTT, LOW);
          else
            digitalWrite (LEDARRAY.MQTT, HIGH);
          
          timers.mqttBlinkTime=millis();
        }
      }
    }
  }
}

void reverceLed(int pin)
{
  if (pin>=0)  
  {
      if (digitalRead(pin))
        digitalWrite (pin, LOW);
      else
        digitalWrite (pin, HIGH);
  }
}

void onLed(int pin)
{
  if (pin>=0)  
  {
    digitalWrite (pin, HIGH);
  }
}

void offLed(int pin)
{
  if (pin>=0)  
  {
    digitalWrite (pin, LOW);
  }
}



void setLedReset()
{
  onLed(LEDARRAY.AP);
  onLed(LEDARRAY.RT);
  onLed(LEDARRAY.WIFI);
  onLed(LEDARRAY.LOGIN);
  onLed(LEDARRAY.HTTP);
  onLed(LEDARRAY.MQTT);

  delay(3);
  
  offLed(LEDARRAY.AP);
  offLed(LEDARRAY.RT);
  offLed(LEDARRAY.WIFI);
  offLed(LEDARRAY.LOGIN);
  offLed(LEDARRAY.HTTP);
  offLed(LEDARRAY.MQTT);
}

void setupLed()
{
  if (LEDARRAY.AP>=0)
    pinMode(LEDARRAY.AP, OUTPUT);
  if (LEDARRAY.RT>=0)
    pinMode(LEDARRAY.RT, OUTPUT);
  if (LEDARRAY.WIFI>=0)
    pinMode(LEDARRAY.WIFI, OUTPUT);
  if (LEDARRAY.LOGIN>=0)
    pinMode(LEDARRAY.LOGIN, OUTPUT);
  if (LEDARRAY.HTTP>=0)
    pinMode(LEDARRAY.HTTP, OUTPUT);
  if (LEDARRAY.MQTT>=0)
    pinMode(LEDARRAY.MQTT, OUTPUT);
}


unsigned long getCurTimeSec()
{
  if (STARTTIMESEC > 0)
    return STARTTIMESEC + (int)((millis()-START_MILLIS) / 1000);
  else
    return 0;
}

boolean isDataChanged()
{
  if (GPS.CH) return true;
  for (int i=0; i<MAX_NUM_PIN; i++)
  {
    if (PIN[i].CH) return true;
  }
  return false;
}

void asyncFunc1()
{
  if (MODE=="0")
    setFile("MODE.txt", "1");
  else
    setFile("MODE.txt", "0");

  BOARD_restart();

  //timers.restart_request_time=millis();
  status.async1=0;
}




void ICACHE_RAM_ATTR onInterruptButton() 
{
  int val = digitalRead(BUTTON);
  Serial_println("onInterruptButton "+String(val));

  CLICK.click_status=1-val;
  CLICK.click_time=millis();    
}

String ip2Str(IPAddress ip)
{
  String s = "";
  for (int i = 0; i < 4; i++) {
    s += i  ? "." + String(ip[i]) : String(ip[i]);
  }
  return s;
}

void Serial_read()
{
  String received = "";
  while (Serial.available())
  {
    received = received + Serial.readString();
  }
  if (received!="")
  {
    //Serial_println("RECEIVED:"+received);
    ZJson err=stringToJson(received, "SERIAL");
    if (err.error==0)
    {
        String cmd=jserial["cmd"];
        int    seq=jserial["seq"];
        Serial_println("RX:"+cmd+" "+String(seq));
        if (cmd=="get_status")
        {
          Serial.println(getJStatus("\"seq\":"+String(seq)));
        }
        else if (cmd=="set_print")
        {
          int   M=jserial["mode"];
          
          if (M==0) PRINT=false;
          else PRINT=true;

          Serial.println("{\"error_code\":0, \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\", \"print\":"+String(PRINT)+"}");
          
        }
        else if (cmd=="set_device_model")
        {
          String M=jserial["model"];
          String O=jserial["owner"];

          MODEL=M;
          OWNER=O;

          setFile("OWNER.txt", OWNER);
          setFile("MODEL.txt", MODEL);

          Serial.println("{\"error_code\":0, \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\", \"model\":"+String(MODEL)+", \"owner\":"+String(OWNER)+"}");
        }
        else if (cmd=="set_data" && status.mqtt==1)
        {
          unsigned long T=getCurTimeSec();
          unsigned long H=round(T/3600)*3600;
          status.sendNow=jserial["sendNow"];

          JsonObject jv=jserial["V"];
          JsonObject jgps=jserial["GPS"];
          
          for (JsonPair   kv : jgps) 
          {
            //Serial_println("set_data.values.1");
            const char *key=kv.key().c_str();            
            String sV=jgps[key];
            if (String(key)=="lat" && GPS.lat!=sV)
            {
              GPS.lat=sV;
              GPS.CH=true;
              //Serial_println("PIN SETTED.GPS.lat"+GPS.lat);
            }
            if (String(key)=="lng" && GPS.lng!=sV)
            {
              GPS.lng=sV;
              GPS.CH=true;
              //Serial_println("PIN SETTED.GPS.lat"+GPS.lng);
            }
            if (String(key)=="alt" && GPS.alt!=sV)
            {
              GPS.alt=sV;
              GPS.CH=true;
              //Serial_println("PIN SETTED.GPS.lat"+GPS.alt);
            }
          }
          
          for (JsonPair   kv : jv) 
          {
            //Serial_println("set_data.values.1");
            const char *key=kv.key().c_str();            
            String sV=jv[key];
            float value=sV.toFloat();
            //Serial_println("set_data.key:"+String(key)+" "+sV);
            int i=String(key).substring(1).toInt();
            //Serial_println("set_data.values.1.ID:"+String(i));
            if (i>=0 && i<MAX_NUM_PIN)
            {
              //Serial_println("set_data.values.S:"+String(PIN[i].S)+" "+String(abs(value-PIN[i].V)));
              if (abs(value-PIN[i].V)>PIN[i].S)
              {
                if (H!=PIN[i].H)
                {
                  PIN[i].V=value;
                  PIN[i].H=H;
                  PIN[i].T=getCurTimeSec();
                  PIN[i].N=value;
                  PIN[i].M=value;
                  PIN[i].TN=getCurTimeSec();
                  PIN[i].TM=getCurTimeSec();
                  PIN[i].CH=true;
                  //Serial_println("PIN SETTED.new H:"+String(H));
                }
                else
                {
                  PIN[i].V=value;
                  PIN[i].T=getCurTimeSec();
                  PIN[i].CH=true;
                  if (value<PIN[i].N)
                  {
                    PIN[i].N=value;
                    PIN[i].TN=getCurTimeSec();
                  }
                  if (value>PIN[i].M)
                  {
                    PIN[i].M=value;
                    PIN[i].TM=getCurTimeSec();
                  }
                  //Serial_println("PIN SETTED.same H:"+String(H));
                }
                
                /*Serial_println("PIN SETTED.id:"+String(i));
                Serial_println("PIN SETTED.V:"+String(PIN[i].V));
                Serial_println("PIN SETTED.N:"+String(PIN[i].N));
                Serial_println("PIN SETTED.M:"+String(PIN[i].M));*/
              }
              //else
              //  Serial_println("PIN SETTED.skip:"+String(i));
            }
          }
          
          Serial.println("{\"error_code\":0, \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
        }
        else if (cmd=="send_alert" && status.login==1)
        {
            if (millis()-timers.lastAlertTime>10000)
            {
              Serial_println("send_mail.passo.1");
              timers.lastAlertTime=millis();
              String sub=jserial["sub"];
              String text=jserial["text"];

              String topic_out = USER + "/" + SI + "/out";
              String msg=makeAlertPack(sub, text);
        
              const char *_topic = topic_out.c_str();
              const char *_msg = msg.c_str();
        
              if (!publishData(_topic, _msg))
                  Serial.println("{\"error_code\":"+String(0)+", \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
              else
                  Serial.println("{\"error_code\":"+String(-104)+", \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
              timers.sendTime=millis();              
            }
        }
        else if (cmd=="send_mail" && status.login==1)
        {
            if (millis()-timers.lastMailTime>20000)
            {
              Serial_println("send_mail.passo.1");
              String to=USER; //jserial["to"];
              String sub=jserial["sub"];
              String text=jserial["text"];
              if (to!="" && sub!="" && text!="")
              {
                Serial_println("send_mail.passo.2");

                text.replace(" ", "%20");
                sub.replace(" ", "%20");
                
                String hresp=http_request(SERVICEURL+"/?func=send_mail&user="+USER+"&pwd="+PWD+"&subject="+sub+"&mailto="+to+"&text="+text, "");
                ZJson err=stringToJson(hresp, "TMP");
                if (err.error!=0)
                  Serial.println("{\"error_code\":"+String(err.error)+", \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
                else  
                {
                  int error_code=jTmp["error_code"];
                  Serial.println("{\"error_code\":"+String(error_code)+", \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
                }
              }
              else
                Serial.println("{\"error_code\":-104, \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
                
              timers.lastMailTime=millis();
            }
            else
              Serial.println("{\"error_code\":-103, \"seq\":\""+String(seq)+"\", \"cmd\":\""+cmd+"\"}");
        }
        else
        {
          Serial.println("{\"error_code\":-100, \"seq\":\""+String(seq)+"\"}");          
        }
    }
    else
    {
      Serial.println("{\"error_code\":"+String(err.error)+", \"error_msg\":\""+err.message+"\"}");          
    }
  }
}



zjson stringToJson(String sJson, String docName) 
{
  
  const char* cjson = sJson.c_str();  
  DeserializationError err;
  
  if (docName=="LOGIN")
    err = deserializeJson(jlogin, cjson);
  if (docName=="SERIAL")
    err = deserializeJson(jserial, cjson);
  if (docName=="TMP")
    err = deserializeJson(jTmp, cjson);
  if (docName=="REMOTE")
    err = deserializeJson(jremote, cjson);

  ZJson ret;
  ret.error=err.code();  

  switch (err.code()) 
  {
    case DeserializationError::Ok:
        ret.message="Ok";
        break;
    case DeserializationError::InvalidInput:
        ret.message="InvalidInput";
        break;
    case DeserializationError::NoMemory:
        ret.message="NoMemory";
        break;
    default:
        ret.message="Undefined";
  }
        
  //return err.code();
  return ret;
}


String jItem(String name, String value, boolean apice)
{
  String ret = "\"" + name + "\":";
  if (apice)
    ret = ret + "\"";
  ret = ret + value;
  if (apice)
    ret = ret + "\"";

  return ret;
}


String getRequestParam(String name, String request, String eq, String sep)
{
  int START = -1;

  START = request.indexOf(name + eq);
  if (START >= 0)
  {
    int END = request.indexOf(sep, START + 1);
    if (END >= 0 && END >= START + name.length() + 1)
    {
      String VAL = request.substring(START + name.length() + 1, END);
      return VAL;
    }
    else
    {
      END = request.indexOf(" ", START + 1);
      if (END >= 0 && END >= START + name.length() + 1)
      {
        String VAL = request.substring(START + name.length() + 1, END);
        return VAL;
      }
      else
      {
        END = request.length();
        String VAL = request.substring(START + name.length() + 1, END);
        return VAL;
      }
    }
  }
  return ("");
}


ZFile openFile(String fileName)
{
  ZFile F;

  if (fileName == "MODE.txt") {
    F.address = 0;
    F.len = 1;
    return F;
  };
  if (fileName == "APPWD.txt")  {
    F.address = 0+1;
    F.len = 32;
    return F;
  };
  if (fileName == "SI.txt")   {
    F.address = 0+1+32;
    F.len = 32;
    return F;
  };
  if (fileName == "SSID.txt") {
    F.address = 0+1+32+32;
    F.len = 32;
    return F;
  };
  if (fileName == "SSIDPWD.txt")  {
    F.address = 0+1+32+32+32;
    F.len = 32;
    return F;
  };
  if (fileName == "USER.txt")  {
    F.address = 0+1+32+32+32+32;
    F.len = 32;
    return F;
  };
  if (fileName == "PWD.txt")  {
    F.address = 0+1+32+32+32+32+32;
    F.len = 32;
    return F;
  };
  if (fileName == "BOUD.txt")  {
    F.address = 0+1+32+32+32+32+32+32;
    F.len = 16;
    return F;
  };
  if (fileName == "SERVICEURL.txt")  {
    F.address = 0+1+32+32+32+32+32+32+16;
    F.len = 32;
    return F;
  }; 
  if (fileName == "OWNER.txt")  {
    F.address = 0+1+32+32+32+32+32+32+16+32;
    F.len = 32;
    return F;
  }; 
  if (fileName == "MODEL.txt")  {
    F.address = 0+1+32+32+32+32+32+32+16+32+32;
    F.len = 32;
    return F;
  }; 

  Serial_println("INVALID FILE NAME:"+fileName);
  F.address = -1;
  F.len = -1;
  return F;
}

void setFile(String fileName, String txt)
{
  ZFile F = openFile(fileName);
  if (F.address < 0)
  {
    Serial_println("setFile Failed.1");
    return;
  }

  Serial_println("setFile "+fileName+" "+txt);
  if (txt.length() > F.len)
  {
    Serial_println("setFile Failed.2");
    return;
  }

  for (int i = 0; i < txt.length(); i++)
  {
    EEPROM.write(F.address + i, (byte)txt.charAt(i));
  }

  if (txt.length() < F.len)
  {
    EEPROM.write(F.address + txt.length(), (byte)0xFF);
  }
  EEPROM.commit();
}

String getFile(String fileName)
{
  String txt;
  ZFile F = openFile(fileName);
  if (F.address < 0)
  {
    Serial_println("getFile.Failed");
    return "";
  }

  //Serial_println("getFile.1 name:"+fileName+" address:"+String(F.address)+" len:"+String(F.len));

  for (int i = 0; i < F.len; i++)
  {
    byte br = EEPROM.read(F.address + i);
    if (br == 0xFF)
      break;

    if (isAscii((char)br))
      txt = txt + String((char)br);
  }
  //Serial_println("getFile.2 text:"+txt);
  return txt;
}

void deleteFile(String fileName)
{
  ZFile F = openFile(fileName);
  if (F.address < 0)
  {
    Serial_println("deleteFile Failed.1");
    return;
  }

  for (int i = 0; i < F.len; i++)
  {
    EEPROM.write(F.address + i, (byte)0xFF);
  }
  EEPROM.commit();
}

String getJStatus(String addString)
{   
    String out="{";
    if (addString!="")
      out=out+addString+", ";
    out=out+"\"mode\":"+String(status.mode)+", ";
    out=out+"\"wifi\":"+String(status.wifi)+", ";
    out=out+"\"login\":"+String(status.login)+", ";
    out=out+"\"http\":"+String(status.http)+", ";
    out=out+"\"mqtt\":"+String(status.mqtt)+", ";
    out=out+"\"async1\":"+String(status.async1)+", ";
    out=out+"\"wifiConnLoop\":"+String(status.wifiConnLoop)+", ";
    out=out+"\"mqttConnLoop\":"+String(status.mqttConnLoop)+", ";
    out=out+"\"wifiIp\":\""+status.wifiIp+"\", ";
    out=out+"\"apIp\":\""+status.apIp+"\",";

    out=out+"\"tz\":"+TZ+",";
    out=out+"\"systimesec\":"+String(getCurTimeSec())+"";
    out=out+"}";
    
    return out;
}

void Serial_print_status()
{   
    String st="\"cmd\":\"print_status\"";
    Serial.println(getJStatus(st));
}

void Serial_println(String out)
{
  if (PRINT)
  {
    Serial.println("#DEBUG#"+out);
    //Serial.println("{\"cmd\":\"print\", \"text\":\""+out+"\"}");
  }  
}

/*void Serial_print(String out)
{
  if (PRINT)
  {
      Serial.print(out);
  }  
}*/

//------------------------------------
void BOARD_restart()
{
  setLedReset();  
  ESP.restart();
}  

void setup_wifi()
{

  delay(10);
  //Serial_println("Connecting to "+SSID+" "+SSIDPWD);

  const char* _ssid = SSID.c_str();
  const char* _pwd  = SSIDPWD.c_str();
  WiFi.begin(_ssid, _pwd);

  int ct = 0;
  while ((WiFi.status() != WL_CONNECTED || ip2Str(WiFi.localIP()) == "0.0.0.0"))
  {
    status.wifiConnLoop=ct;
    //Serial_println("Connecting loop "+String(ct));
    if (ct > 3)
      BOARD_restart();

    long TW=millis();
    while(millis()-TW<5000)
    {
      setLed();
      delay(50);
    }  
    ct++;
  }

  String ip = ip2Str(WiFi.localIP());
  if (ip == "0.0.0.0")
  {
    status.wifi=0;
    //Serial_println("WIFI CONNECT FAILED, RESTART");
    BOARD_restart();
  }
  status.wifi=1;
  status.wifiIp=ip2Str(WiFi.localIP());
  //Serial_println("WiFi connected Ip:" + ip2Str(WiFi.localIP()));
}

String http_request(String url, String postData)
{   
  //std::unique_ptr<BearSSL::WiFiClientSecure>clientSecure(new BearSSL::WiFiClientSecure);
  //clientSecure->setFingerprint(fingerprint);

  HTTPClient http;
  String payload = "";

  //http.begin(*clientSecure, url);
  http.begin(url.c_str());

  int httpCode = 0;

  if (postData == "")
  {
    httpCode = http.GET();
    Serial_println("http_request.GET:"+url);
  }
  else
  {
    httpCode = http.POST(postData);
    Serial_println("http_request.POST");
  }

  if (httpCode > 0)
  {
    status.http=1;
    payload = http.getString();
  }
  else
  {
    status.http=0;
    Serial_println("http_request.error.httpCode:"+String(httpCode)+":"+http.errorToString(httpCode));
  }
  
  http.end();

  Serial_println("http_request.httpCode:"+String(httpCode));
  Serial_println("http_request.payload:"+payload);
  //Serial_print("resp:");
  //Serial_println(payload);

  return payload;
}

void callback(char *topic, byte *payload, unsigned int length)
{
  //Serial_println("callback.1");
  
  if (length<=0)
    return;
    
  char message_buff[length];
  int i = 0;
  for (i = 0; i < length; i++)
    message_buff[i] = payload[i];
  message_buff[i] = '\0';

  //Serial_println("callback.2:"+String(topic)+" "+String(message_buff));
  
  ZJson err=stringToJson(String(message_buff), "REMOTE");
  if (err.error==0)
  {
    if (jremote["cmd"]=="get_data")
      status.sendNow=1;
    else
      Serial.println("{\"topic\":"+String(topic)+", \"systimesec\":"+String(getCurTimeSec())+", \"pack\":"+String(message_buff)+"}");
  }
  else
      Serial.println("{\"topic\":"+String(topic)+", \"error\":true}");

  //Serial_println(String(message_buff));
}

void reconnect()
{
    if (status.mqttConnLoop>=3)
    {
      Serial_println("Mqtt fail "+String(status.mqttConnLoop)+" tentative. Restart now!!");
      BOARD_restart();

      return;
    }

    
    status.mqttConnLoop++;

    const char* _mqttuser=jlogin["mqttuser"]; 
    const char* _mqttpassword=jlogin["mqttpassword"]; 
    const char* _mqttip=jlogin["mqttipv4"]; 
    int _mqttport=jlogin["mqttport"]; 
    
    Serial_println("mqttuser:"+String(_mqttuser));
    Serial_println("mqttpassword:"+String(_mqttpassword));
    Serial_println("mqttip:"+String(_mqttip));
    Serial_println("mqttport:"+String(_mqttport));
    
    if (_mqttuser=="" || _mqttpassword=="" || _mqttip==""  || _mqttport<=0)
    {
      Serial_println("Invalid mqtt attributes");
      return;
    }

    Serial_println("mqtt.reconnect.1:"+String(status.mqttsetsetver));
    if (status.mqttsetsetver==0)
    {
      //Serial_println("mqtt.reconnect.2");
      //String __mqtturl = "mqtt://"+String(_mqttip)+"/mqtt";
      String __mqtturl = String(_mqttip);
      //String __mqtturl = "3.124.243.227";

      
      
      const char *_mqtturl = __mqtturl.c_str();
      
      client.setServer(_mqtturl, _mqttport);
      Serial_println("mqtt.reconnect.url:"+String(_mqtturl)+" "+String(_mqttport));
      client.setCallback(callback);  
      //Serial_println("mqtt.reconnect.5");
      status.mqttsetsetver=1;
      
      //Serial_println("mqtt.reconnect.6 to:"+String(_mqtturl)+", "+String(_mqttport));
    }
    Serial_println("mqtt.reconnect.1.1");

    String TOPIC_IN = USER + "/" + SI + "/in";

    const char *_device_id = SI.c_str();
    const char *_topicIn = TOPIC_IN.c_str();
    
    boolean conn = client.connect(_device_id, _mqttuser, _mqttpassword);
    Serial_println("mqtt.reconnect.1.2:"+String(_device_id)+", "+String(_mqttuser)+", "+String(_mqttpassword)+", "+String(conn));

    if (conn)
    {
      delay(2000);
      
      status.mqtt=1;
      Serial_println("mqtt.reconnect.1.3 true");
      subscribeData(_topicIn);

      Serial_println("mqtt.reconnect.1.4.remote:"+remote);

      if (remote!="")
      {        
          String TOPIC_OUT = USER + "/" + remote + "/out";
          Serial_println("mqtt.reconnect.1.5.remote:"+TOPIC_OUT);
          
          const char *_topic_out = TOPIC_OUT.c_str();
          subscribeData(_topic_out);
      }
      

      //JsonObject values=jlogin["VALUES"];
      //for (JsonPair keyValue : values) 
      //for (int i=0; i<MAX_NUM_PIN; i++)
      //{
        //String key="P"+String(i);
        //Serial_println("subscribe.loop:"+key);
        
        //const char *_key=key.c_str();            
        //const char *_remote=values[_key]["remote"];
        
        /*if (String(_remote)!="")
        {
          Serial_println("remote.1.1"+key+String(_remote));
          String TOPIC_OUT = USER + "/" + String(_remote) + "/out";
          const char *_topic_out = TOPIC_OUT.c_str();
          subscribeData(_topic_out);
        }*/
      //}
      //Serial_println("mqtt.reconnect.1.6");
    }
    else
      Serial_println("mqtt.reconnect.1.2.1 false");
}

//------------------------------------
void setupAP()
{
  Serial_println("setupAP()");
  String _SI="ZZIGTO_AP";
  if (SI!="")
    _SI=SI;

    
  const char *_ssid = _SI.c_str();
  const char *_appwd = APPWD.c_str();

  WiFi.mode(WIFI_AP);

  WiFi.softAP(_ssid, _appwd);
  IPAddress IP = WiFi.softAPIP();

  status.apIp=ip2Str(IP);
  //Serial_println("APIP:" + ip2Str(IP));

  server.begin();
}

void loopAP()
{

  WiFiClient client = server.available();

  if (client)
  {
    //Serial_println("New Client.");
    request = "";

    while (client.connected())
    {
      if (client.available())
      {
        char c = client.read();
        //Serial.write(c);

        request += c;
        if (c == '\n')
        {
          //Serial_println(request);
          String httpOut = "";

          String FUNC = getRequestParam("func", request, "=", "&");
          //Serial_println("loopAP request:" + request);
          
          if (FUNC == "set")
          {
            SERVICEURL = getRequestParam("SERVICEURL", request, "=", "&");
            String newAPPWD = getRequestParam("APPWD", request, "=", "&");
            SSID = getRequestParam("SSID", request, "=", "&");
            SSIDPWD = getRequestParam("SSIDPWD", request, "=", "&");
            USER = getRequestParam("USER", request, "=", "&");
            PWD = getRequestParam("USERPWD", request, "=", "&");

            boolean flag=false;

            Serial_println(">SERVICEURL:" + SERVICEURL);
            Serial_println(">APPWD:" + newAPPWD);
            Serial_println(">SSID:" + SSID);
            Serial_println(">SSIDPWD:" + SSIDPWD);
            Serial_println(">USER:" + USER);
            Serial_println(">PWD:" + PWD);

            String msg = "DEVICE setting";
            if (newAPPWD != "" && newAPPWD!=APPWD)
            {
              if (newAPPWD.length() >= 9)
              {
                setFile("APPWD.txt", newAPPWD);
                msg = msg + ", APPWD Password Setting ";
                flag=true;
              }
              else
                msg = msg + ", Invalid DEVICE SSID Password length<9. ";
            }
            if (SSID != "" && SSIDPWD != "")
            {
              //Serial_println("PASSO.1");

              setFile("SSID.txt", SSID);
              setFile("SSIDPWD.txt", SSIDPWD);
              flag=true;

              msg = msg + ", SSID & SSIDPWD Setting";
            }
            if (SERVICEURL != "")
            {
              setFile("SERVICEURL.txt", SERVICEURL);
              flag=true;
              msg = msg + ", SERVICEURL Setting";
            }
            if (USER != "")
            {
              setFile("USER.txt", USER);
              flag=true;
              msg = msg + ", USER Setting";
            }
            if (PWD != "")
            {
              setFile("PWD.txt", PWD);
              flag=true;
              msg = msg + ", PWD Setting";
            }
            if (BOUD != "")
            {
              setFile("BOUD.txt", BOUD);
              flag=true;
              msg = msg + ", BOUD Setting";
            }

            String error = "";
            String error_code = "";
            if (msg != "")
            {
              error = jItem("error", "false", false);
              error_code = jItem("error_code", "0", false);
            }
            else
            {
              error_code = jItem("error_code", "-1", false);
              error = jItem("error", "false", true);
            }

            if (!flag)
              msg="No operation perform";
            else
              setFile("MODE.txt", "0");

            String error_msg = jItem("error_msg", msg, true);
            String device = jItem("device", SI, true);
            httpOut = "{" + error + ", " + error_code + ", " + error_msg + ", " + device + "}";
          }
          else
          {
            httpOut = html.html_get(SERVICEURL, APPWD, SSID, SSIDPWD, USER, PWD, SI, BOUD);
          }

          client.println("HTTP/1.1 200 OK");
          client.println("Content-type:text/html");
          client.println("Access-Control-Allow-Origin: *");
          client.println("Connection: close");
          client.println();

          client.println(httpOut);
          client.println();
          client.stop();
          break;
        }
      }
    }

    //Serial_println("Client disconnected.");
    //Serial_println("");
  }
}

String makeItem(String name, String value, boolean stringType)
{
  if (!stringType) return "\""+name+"\":"+value;
  else  return "\""+name+"\":\""+value+"\"";
}

void resetChange()
{
  for (int i=0; i<MAX_NUM_PIN; i++)
  {
    PIN[i].CH=false;
  }
}

String makeDataPack(boolean onlyChanged)
{
  boolean SV=false;
  SEQ++;
  String out="{";
  out=out+     makeItem("seq", String(SEQ), false);
  out=out+", "+makeItem("type", "data", true);
  out=out+", "+makeItem("T", String(getCurTimeSec())+"000", false);
  out=out+", \"value\":{";

  int ct=0;
  for (int i=0; i<MAX_NUM_PIN; i++)
  {
    if (PIN[i].id==i) //indica che il pin esiste
    {
      if (PIN[i].SV) SV=true;
      
      if ((onlyChanged && PIN[i].CH) || (!onlyChanged))
      {
        if (ct>0)
          out=out+", ";

        if (PIN[i].SV)
        {
          out=out+"\"P"+String(i)+"\":{";
          out=out+     makeItem("V", String(PIN[i].V), false);
          out=out+", "+makeItem("N", String(PIN[i].N), false);
          out=out+", "+makeItem("M", String(PIN[i].M), false);

          if (PIN[i].TN>0)
            out=out+", "+makeItem("TN", String(PIN[i].TN)+"000", false);
          else
            out=out+", "+makeItem("TN", "0", false);
            
          if (PIN[i].TM>0)
            out=out+", "+makeItem("TM", String(PIN[i].TM)+"000", false);
          else
            out=out+", "+makeItem("TM", "0", false);
            
          out=out+"}";
        }
        else
        {
          out=out+"\"P"+String(i)+"\":{";
          out=out+makeItem("V", String(PIN[i].V), false);
          out=out+"}";
        }

        PIN[i].CH=false;
        ct++;
      }
    }
  }
  
  out=out+"}";

  if  ((onlyChanged && GPS.CH) || (!onlyChanged))
  {
    out=out+", \"gps\":{";
    out=out+     makeItem("lat", String(GPS.lat), true);
    out=out+", "+makeItem("lng", String(GPS.lng), true);
    out=out+", "+makeItem("alt", String(GPS.alt), true);
    out=out+"}";
  }
  
  
  /*out=out+", \"mem\":{";
  out=out+     makeItem("total", String(0), false);
  out=out+", "+makeItem("free",  String(0), false);
  
  out=out+"}, ";*/
  out=out+", "+makeItem("SV",  String(SV), false);
  
  out=out+"}";

  GPS.CH=false;
  return out;
}

String makeAlertPack(String sub, String text)
{
  SEQ++;
  String out="{";
  out=out+     makeItem("seq", String(SEQ), false);
  out=out+", "+makeItem("type", "alert", true);
  out=out+", "+makeItem("T", String(getCurTimeSec())+"000", false);
  out=out+", "+makeItem("sub", sub, true);
  out=out+", "+makeItem("text", text, true);  
  out=out+"}";
  return out;
}

boolean publishData(const char * topic, const char * msg)
{
  status.mqttsenderror=false;
  boolean b=client.publish(topic, msg, true);
  if (!b)
  {
    status.mqttsenderror=true;
    Serial_println("publishData.error topic:"+String(topic)+" len:"+String(String(msg).length()));
  }
  else
    Serial_println("publishData,ok topic:"+String(topic)+" len:"+String(String(msg).length())+" msg:"+String(msg));
    
  
  return status.mqttsenderror;
}

boolean subscribeData(const char * topic)
{
  if (client.subscribe(topic))
  {
    Serial_println("subscribeData.ok topic:"+String(topic));
  }
  else
    Serial_println("subscribeData.error topic:"+String(topic));
}


//------------------------------------

void setupRT() 
{
}

void loopRT() 
{
  if (!client.connected())
    status.mqtt=0;

  if (WiFi.status() != WL_CONNECTED)
    status.wifi=0;    

  
  //Serial_println("loop.1:"+String(status.wifi)+" "+String(millis()-timers.wifiTime));
  if (status.wifi==0 && millis()-timers.wifiTime>10000)
  {
    //Serial_println("wifi setting.1");    
    if (SSID!="" && SSIDPWD!="")
    {
        Serial_println("wifi setting.2");
        setup_wifi();
        timers.wifiTime=millis();
    } 
  }
  else if (status.wifi==1 && status.login<=0 && millis()-timers.loginTime>10000)
  {
    String hresp=http_request(SERVICEURL+"/?func=login_device&user="+USER+"&pwd="+PWD+"&si="+SI+"&model="+MODEL+"&owner="+OWNER, "");
    timers.loginTime=millis();
    Serial_println("login.1:"+hresp);
    if (hresp!="")
    {
      ZJson err=stringToJson(hresp, "LOGIN");
      if (err.error==0)
      {
        int error_code=jlogin["error_code"];
        Serial_println("login.2.error_code:"+String(error_code));
        if (error_code<0)
        {
          status.login=error_code;          
        }
        else   
        {
          Serial_println("login.2.1");
          
          START_MILLIS=millis();
          STARTTIMESEC=jlogin["timesec"];
          
          Serial_println("login.2.2");
          
          const char* _remote=jlogin["remote"];
          Serial_println("login.2.3");
          if (_remote[0]=='\0')
            Serial_println("login.2.3.null");
          
          remote=String(_remote);
          Serial_println("login.2.4");
          
          Serial_println("remote.1:"+remote);
          
          TZ=jlogin["tz"];
          Serial_println("login.2.5");

          Serial_println("loopRT.values.0");
          JsonObject values=jlogin["VALUES"];
          for (JsonPair   kv : values) 
          {
            //Serial_println("loopRT.values.1");
            const char *key=kv.key().c_str();            
            Serial_println("loopRT.values.1.key:"+String(key));
            
            //const char *_remote=values[key]["remote"];            
            float S=values[key]["S"];
            boolean SV=values[key]["SV"];

            //Serial_println("loopRT.values.1.S:"+String(S));
            //Serial_println("loopRT.values.1.SV:"+String(SV));
            //Serial_println("loopRT.values.1._remote:"+String(_remote));
            
            String ID=String(key).substring(1);
            int i=ID.toInt();
            
            //Serial_println("loopRT.values.1.ID:"+String(ID));
            //Serial_println("loopRT.values.1.i:"+String(i));
            
            //PIN[i].remote=String(_remote);
            PIN[i].S=S;
            PIN[i].SV=SV;
            PIN[i].id=i;
            
          }          

          Serial_println("STARTTIMESEC:"+String(STARTTIMESEC)+" TZ:"+String(TZ));
          status.login=1;
        }
      }
      else
          status.login=-2;
    }      
  }
      
  if (status.wifi==1 && status.login==1 && status.mqtt==0 && millis()-timers.mqttTime>10000)
  {
    Serial_println("mqtt.1"); 
    reconnect();   
    Serial_println("mqtt.2"); 
    timers.mqttTime=millis();
    Serial_println("mqtt.3"); 
  } 

  Serial_read();

  if (status.wifi==1 && status.login==1 && status.mqtt==1)
  {
    //Serial_println("mqttRuntime.1");
    
    int TIMEOUT_MAX=jlogin["TIMEOUT_MAX"];
    int TIMEOUT=jlogin["TIMEOUT"];
      
    if (TIMEOUT_MAX<=0)
      TIMEOUT_MAX=60000;
    
    if (TIMEOUT<=0)
      TIMEOUT=10000;
  
    //Serial_println("mqttRuntime.2:"+String(TIMEOUT)+" "+String(TIMEOUT_MAX));
    if (millis()-timers.sendTime>TIMEOUT && isDataChanged())
    {
      Serial_println("mqttRuntime.3");
      
      String topic_out = USER + "/" + SI + "/out";
      String msg=makeDataPack(true);

      const char *_topic = topic_out.c_str();
      const char *_msg = msg.c_str();

      //Serial_println("mqttRuntime.3.1 TIMEOUT:"+String(TIMEOUT)+" topic:"+String(_topic)+" msg:"+String(_msg));
      if (!publishData(_topic, _msg))
      {
        resetChange();
      }
      timers.sendTime=millis();
      //Serial_println("mqttRuntime.3.2");
      status.sendNow=0;
    }
    
    if (millis()-timers.sendTime>TIMEOUT_MAX || status.sendNow==1)
    {
      Serial_println("mqttRuntime.4");
      
      String topic_out = USER + "/" + SI + "/out";
      String msg=makeDataPack(false);

      const char *_topic = topic_out.c_str();
      const char *_msg = msg.c_str();
      
      //Serial_println("mqttRuntime.4.1 TIMEOUT:"+String(TIMEOUT_MAX)+" topic:"+String(_topic)+" msg:"+String(_msg));
      if (!publishData(_topic, _msg))
      {
        resetChange();
      }
      timers.sendTime=millis();
      //Serial_println("mqttRuntime.4.2");
      status.sendNow=0;
    }
  }

   
  if (status.mqtt==1)
    client.loop();

}

//------------------------------------

void setup() 
{  
  if (BUTTON>=0)
    pinMode(BUTTON, INPUT);
    
  setupLed();
  
  uint64_t chipid = ESP.getEfuseMac();
  uint16_t chip = (uint16_t)(chipid >> 32);
  EEPROM.begin(EEPROM_SIZE);
  Serial.begin(115200);
  delay(1000);


  char __SI[23];
  snprintf(__SI, 23, "%04X%08X", chip, (uint32_t)chipid);    
  SI=String(__SI);
  //SI="ZZ_1234567";
  
  attachInterrupt(digitalPinToInterrupt(BUTTON), onInterruptButton, CHANGE); 

  //setFile("SERVICEURL.txt", "http://192.168.178.48");
  
  MODE=getFile("MODE.txt");
  if (MODE=="") MODE="1";
  SERVICEURL=getFile("SERVICEURL.txt");
  APPWD=getFile("APPWD.txt");
  if (APPWD=="")
        APPWD=APPWDDEFAULT;

  SSID=getFile("SSID.txt");
  SSIDPWD=getFile("SSIDPWD.txt");
  USER=getFile("USER.txt");
  PWD=getFile("PWD.txt");
  BOUD=getFile("BOUD.txt");
  if (BOUD!="300" && BOUD!="600" && BOUD!="1200" && BOUD!="2400" && BOUD!="4800" && BOUD!="9600" && BOUD!="14400" && BOUD!="19200" && BOUD!="28800" && BOUD!="38400" && BOUD!="115200") 
    BOUD="115200";

  OWNER=getFile("OWNER.txt");
  MODEL=getFile("MODEL.txt");
    
  
  Serial_println("setup()");
  Serial_println("SI:"+SI);
  Serial_println("MODE:"+MODE);
  Serial_println("SSID:"+SSID);
  Serial_println("SSIDPWD:"+SSIDPWD);
  Serial_println("USER:"+USER);
  Serial_println("PWD:"+PWD);
  Serial_println("SERVICEURL:"+SERVICEURL);
  Serial_println("APPWD:"+APPWD);
  Serial_println("BOUD:"+BOUD);
  Serial_println("OWNER:"+OWNER);
  Serial_println("MODEL:"+MODEL);
  
  /*delay(3000);
  Serial.end();
  delay(2000);
  Serial.begin(BOUD.toInt());
  delay(1000);
  Serial_println("setup().BOUD");*/
  
  if (MODE=="0")
  {
    //Serial_println("setup().1.1");
    setupRT();
    //Serial_println("setup().1.2");
  }
  else
  {
    //Serial_println("setup().2.1");
    setupAP();
    //Serial_println("setup().2.2");
  }
}

void loop() 
{
  setLed();
  
  //Serial_println("LOOP.1 "+MODE);
  long ms=millis();
  if (ms<timers.lastMillis)
    BOARD_restart();
  //Serial_println("LOOP.2 "+MODE);

  timers.lastMillis=ms;
  
  timers.lastMillis=millis();
  status.mqtt=client.connected();
  status.wifi=0;
  if (WiFi.status() == WL_CONNECTED)
    status.wifi=1;
  
  
  if (timers.restart_request_time>0 && millis()-timers.restart_request_time>2000)
  {
    timers.restart_request_time=0;
    Serial_println("EXEC RESTART");
    BOARD_restart();
  }

  //Serial_println("LOOP.3 "+MODE);
  
  if (MODE=="0")
  {
    status.mode=0;
    loopRT();
  }
  else
  {
    status.mode=1;
    loopAP();
  }

  if (millis()-timers.print_status_time>5000)
  {
    timers.print_status_time=millis();
    //Serial_print_status();
  }

  delay(50);
}
