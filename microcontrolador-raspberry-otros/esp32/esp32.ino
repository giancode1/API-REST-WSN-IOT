#include <ArduinoJson.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <DHT_U.h>

//Giancarlo Culcay

const char *mqtt_server = "****";
//const char *mqtt_server = "192.168.?.?"; // pruebas locales
const int mqtt_port = 1883;
const char *mqtt_user = "esp32gc";
const char *mqtt_pass = "****";
const char *topic_subscribe = "/****/config";   //sensorId/config
const char *topic_publish = "/****/data";       //sensorId/data

const char* ssid = "****";
const char* password = "****";

WiFiClient espClient;
PubSubClient client(espClient);

#define DHTPIN 23
DHT dht(DHTPIN, DHT11);
unsigned long start_time = 0;

float dht_temperatura, dht_humedad;
float temperatura1, temperatura2, temperatura3;
int time_ms=1000;
int S1,S2,S3;



void callback(char* topic, byte* payload, unsigned int length);
void reconnect();
void setup_wifi();

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  dht.begin();
}

void setup_wifi(){
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {

  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected");

      // Suscripcion
      if(client.subscribe(topic_subscribe)){
        Serial.println("Suscripcion ok");
      }else{
        Serial.println("fallo Suscripciión");
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2 seconds");
      // Wait 2 seconds before retrying
      delay(2000);
    }
  }
}


void callback(char* topic, byte* payload, unsigned int length){
  String incoming = "";
  Serial.print("Mensaje recibido desde -> ");
  Serial.print(topic);
  Serial.println("");
  for (int i = 0; i < length; i++) {
    incoming += (char)payload[i];
  }
  incoming.trim();
  Serial.println("Mensaje -> " + incoming);

}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

    String payload = "";

  if(millis() - start_time >= time_ms){
    start_time = millis();

    dht_temperatura = dht.readTemperature();
    dht_humedad = dht.readHumidity();


    S1 = analogRead(39);
    S2 = analogRead(34);
    S3 = analogRead(35);

    temperatura1 = (500.0 * S1)/4095.0;
    temperatura2 = (500.0 * S2)/4095.0;
    temperatura3 = (500.0 * S3)/4095.0;

    DynamicJsonDocument doc(192);
    doc["dht_temperatura"] = dht_temperatura;
    doc["dht_humedad"] = dht_humedad;

    doc["temperatura1"] = temperatura1;
    doc["temperatura2"] = temperatura2;
    doc["temperatura3"] = temperatura3;

    serializeJson(doc, payload);
    Serial.print("Publish message: ");
    Serial.println(payload);
    client.publish(topic_publish, payload.c_str());

  }

}
