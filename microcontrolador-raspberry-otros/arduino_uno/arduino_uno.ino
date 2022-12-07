#include <LiquidCrystal.h>
#include <ArduinoJson.h>

//Giancarlo Culcay

const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

float temperatura;
unsigned long start=0;
int led_verde=7;
int led_rojo=8;
int S1=0;         //sensor de temperatura
int time_ms=8000; //tiempo de muestreo por defecto

void setup() {
  Serial.begin(9600);
  pinMode(led_verde, OUTPUT);
  pinMode(led_rojo, OUTPUT);

  lcd.begin(16,2);
  lcd.print("Bienvenido");
  delay(1000);

  lcd.clear();
}

void loop() {
  lcd.setCursor(0, 0);

    if(millis() > start + time_ms){
      start = millis();
      S1=analogRead(0);
      temperatura= (500.0*S1)/1023.0;
      Serial.println(temperatura);
      lcd.print("temp=");
      lcd.print(temperatura);
    }

  if(Serial.available()>0){
    lcd.setCursor(9, 0);
    String payload = Serial.readString();

    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (err){
      Serial.println("ocurrio un error");
      Serial.println(err.c_str());
      return;
    }

    bool led = doc["led"];
    time_ms = doc["time_ms"] | time_ms;
    String mensaje = doc["mensaje"] | "";

    if(led==1){
      digitalWrite(led_verde,HIGH);
      digitalWrite(led_rojo,LOW);
    }
    if(led==0){
      digitalWrite(verde,LOW);
      digitalWrite(led_rojo,HIGH);
    }
    if(mensaje.length()>0){
      lcd.setCursor(0, 1);
      lcd.print(mensaje);
    }
   }
}
