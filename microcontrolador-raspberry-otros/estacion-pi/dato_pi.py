# Raspberry PI actua como concentrador de dispositivos sin acceso a internet
import serial, time, json
import paho.mqtt.client as mqtt

#Giancarlo Culcay

broker = '****' # Dirección del broker MQTT
port = 1883
topic_pub = '/****/data'  # SensorId/data
topic_sub = '/****/config'  # SensorId/config
client_id = 'pi-python-mqtt--01'
username = 'pi'
password = '****' # Token de acceso


serial_port = serial.Serial("/dev/ttyACM0", 9600)
print("Estableciendo conexion serial con Arduino ", serial_port)

def on_connect(client, userdata, flags, rc):
    print("Se conecto con broker mqtt")
    client.subscribe(topic_sub)


def on_message(client, userdata, msg):
    my_msg=str(msg.payload.decode("utf-8"))
    print("Mensaje recibido: ", my_msg)
    serial_port.write(my_msg.encode())


client = mqtt.Client(client_id)
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker, port, 60)

while True:
    client.loop()
    if serial_port.inWaiting() > 0:
        data  = serial_port.readline().decode('utf-8')
        data = float(data.rstrip())
        print("Mensaje recibido: ", data)
        my_data = {'temperatura': data}
        client.publish(topic_pub, payload=json.dumps(my_data), qos=0, retain=False)

# close serial port
serial_port.close()
print("Conexion serial cerrada")
