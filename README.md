# API REST PARA LA TRANSMISIÓN DE INFORMACIÓN Y CONTROL DE REDES DE SENSORES IOT

[Link Documento Publicado](https://repositorio.uta.edu.ec/handle/123456789/35022)  
[Link Proyecto Backend](https://api-rest-wsn-iot-gc.azurewebsites.net/docs/)
### Autor

- Ing. Giancarlo Culcay - [giancode1](https://github.com/giancode1)
- LinkedIn - [Linkedin](https://www.linkedin.com/in/giancarlo-culcay/)
- Twitter - [@gianccool](https://twitter.com/giancode1)
- Website - [https://www.giancarlo-culcay.com/](https://www.giancarlo-culcay.com/)

## Resumen

La cantidad de datos que el Internet de las cosas genera está creciendo de forma exponencial, cada vez son más los dispositivos llamados “cosas” que se conectan a internet y proporcionan datos de importancia para diferentes sectores, acceder a estos miles de datos es complicado con las técnicas convencionales, además en estos últimos años por el tema de la pandemia fue necesario que los dispositivos se configuren a distancia y faciliten mucho trabajo. Este proyecto analiza las tecnologías para el funcionamiento de las redes de sensores, IoT, protocolos de comunicación para el IoT y desarrolla una API REST con Node.js y Express para que los usuarios puedan crear los recursos (nodos, sensores, datos) cada uno relacionado con el otro. Se usa los servicios en la nube para desplegar un contenedor de broker: EMQ X el cual sirve como servidor para las conexiones de los dispositivos IoT, mediante la suscripción y publicación de datos ordenados por su id de sensor. Como la seguridad de estas redes ha dado mucho que hablar, las conexiones MQTT son autenticadas mediante un token de seguridad y no se permiten conexiones anónimas. Este proyecto usa soluciones serverless, la aplicación API REST se encuentra alojada en el servicio de App Service de Azure y cualquier cliente que desea obtener datos de la API debe tener un usuario registrado y cada vez que realice las solicitudes debe contar con un token de acceso. Se usa bases de datos de MongoDB por su rendimiento, documentos ligeros y permitir datos sin estructura fija para las características de los sensores y datos que pueden tener diferentes valores, y que cambian continuamente. Los usuarios pueden realizar las operaciones CRUD con los recursos, y para obtener los datos pueden especificar el límite, offset, fecha de los datos que deseen obtener.

![Image text](./imgs/doc_swagger.png)

## Banco de Pruebas

![Image text](./imgs/Banco_de_pruebas.png)

## Ejemplos consultas endpoints

### Nodo 1, Datos Página Web

![Image text](./imgs/nodo1-datos-navegador.png)

Para ver la información de los nodos restantes visita el [Proyecto](https://repositorio.uta.edu.ec/handle/123456789/35022) en la cual se detalla los datos y sus configuraciones.

- Comunicación Asíncrona
- Autenticación, Autorización
- JWT
- Comunicación bidireccional con dispositivos iot
- Envio de datos, configuración remota.

## Tecnologias, dipositivos usados en el proyecto

- Node.js
- Express
- HTML/CSS/JavaScript
- TypeScript
- Python 3
- NoSQL - MongoDB
- Contenedores Docker
- Microsoft Azure
- MQTT
- React Native
- JMeter

## Dipositivos usados en el proyecto

- Arduino
- ESP32
- ESP8266
- PIC
- Sensores varios
- LCD
- Raspberry PI

## Instalar dependencias
```bash
npm install
# or
yarn
```
## Completar variables de entorno 

Crea archivo ```.env``` con las mismas variables de ```.env.example```
Se recomienda que el JWT tenga 24 caracteres alfanumericos.
Completa las variables con el string de conexiónde tu db de mongo.

## Completar variables de entorno, usuario en DB

Crea en tu db, un usuario con rol "admin"
ejemplo:
```json
{
  "name": "Usuario",
	"email": "usuario@email.com",
	"password": "*******",
	"role": "admin"
}
```
Crea mas usuarios con role "user"  
Puedes crear mas usuarios-nodos-sensores-data por medio del endpoint /users. Observa los parámetros de ejemplo en [swagger](https://api-rest-wsn-iot-gc.azurewebsites.net/docs/)

## Modo Desarrollo
```bash
npm run dev   # recomendado
npm run dev2  # ignora errores , precacución
```
## Build
```bash
npm run build
npm run start
```

## Desarrollo local mongodb - docker
```bash
docker-compose up -d
```
## Configuración dispositivos IoT
Básicamente se debe tener acceso a la dirección del broker o servidor MQTT y la contraseña.
Los datos se serializan y deserializan a JSON tanto en subida y bajada de datos y configuración.

Se presenta una parte del ejemplo de los 3 en carpeta "microcontrolador-raspberry-otros"  

Para mas información ver el proyecto publicado.

- esp8266_hum_tem_mqtt.ino:

```c++
const char* mqtt_server = "****";
const char* mqtt_pass = "****";

  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) return;

# Datos que llegan de comunicacion mqtt
  int angle = doc["angle"];
  time_ms = doc["time_ms"] | time_ms;

    DynamicJsonDocument doc(192);
    doc["temperatura"] = temperatura;
    doc["humedad"] = humedad;

    serializeJson(doc, payload);
    Serial.print("Publish message: ");
    Serial.println(payload);
    client.publish("/61fb410e979f19a78b9df5b5/data", payload.c_str()); // sensorId/data
```
