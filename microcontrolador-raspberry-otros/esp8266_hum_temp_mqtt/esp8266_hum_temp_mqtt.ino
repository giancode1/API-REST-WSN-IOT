#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <DHT_U.h>
#include "Servo.h"

//Giancarlo Culcay

const char* ssid = "****";
const char* password = "****";
const char* mqtt_server = "****";
const char* mqtt_pass = "****";

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(D1, DHT11);

unsigned long start_time = 0;
float temperatura, humedad;
int time_ms=1000;

int servo_pin = D7;
Servo myservo;
int angle = 0;

void setup_wifi() {
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

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("-->Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();


  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) return;

  int angle = doc["angle"];
  time_ms = doc["time_ms"] | time_ms;

  Serial.print("angle: ");
  Serial.print(angle);
  Serial.println();
  Serial.print("time_ms: ");
  Serial.print(time_ms);
  Serial.println();

  myservo.write(angle);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect
    if (client.connect("gian","nodemcu",mqtt_pass)) {
      Serial.println("connected");
      client.subscribe("/61fb410e979f19a78b9df5b5/config"); // sensorId/config
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2 seconds");
      // Wait 2 seconds before retrying
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  dht.begin();
  myservo.attach(servo_pin);
}

void loop() {
  if(!client.connected()) {
    reconnect();
  }
  client.loop();
  String payload = "";

  if(millis() - start_time >= time_ms){
    start_time = millis();

    temperatura = dht.readTemperature();
    humedad = dht.readHumidity();

    DynamicJsonDocument doc(192);
    doc["temperatura"] = temperatura;
    doc["humedad"] = humedad;

    serializeJson(doc, payload);
    Serial.print("Publish message: ");
    Serial.println(payload);
    client.publish("/61fb410e979f19a78b9df5b5/data", payload.c_str()); // sensorId/data

  }

}
