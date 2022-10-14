const urlBase = process.env.URL_BASE;
const port = process.env.PORT;
const URL = `${urlBase}:${port}`;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API REST WSN IoT',
            version: '1.0.0',
            description: 'API REST PARA LA TRANSMISIÓN DE INFORMACIÓN Y CONTROL DE REDES DE SENSORES IOT',
            contact: {
                name: 'Giancarlo Culcay',
                email: 'gieg5c@gmail.com',
            }
        },
        servers: [
            {
                // url: `${URL}/api/v1`,
                // url: 'https://api-rest-wsn-iot.azurewebsites.net/api/v1',	    
                url: 'https://api-rest-wsn-iot-gc.azurewebsites.net/api/v1',	    
            }
        ],
    },
    apis: ["./routes/*.js"]
        
}
// console.log("ESTE ES URL:", URL);
module.exports = {options};
