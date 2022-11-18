// add this file to .gitignore

const keys = {
    google: {
        GOOGLECLIENT_ID: 'xxxxxxxxxx',
        GOOGLECLIENT_SECRET: 'xxxxxxxxxxx'
    },
    mongodb: {
        MONGODB_CONSTR: 'mongodb+srv://[userid]:[password]@cluster0.brf1j.mongodb.net/oautho?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&ssl=true'
    },
    session: {
        cookieKey: 'xxxxxxxxxxxxxxxx'
    },
    development: {
        port: '1111',
    },
    weatherbitapi: {
        WEATHERBIT_URI: 'https://api.weatherbit.io/v2.0/',
        WEATHERBIT_APIKEY: 'xxxxxxxxxxxxxxxx'
    },
    exchangerateapi: {
        EXCHANGERATE_URI: 'https://v6.exchangerate-api.com/v6/',
        EXCHANGERATE_APIKEY: 'xxxxxxxxxxxxxxxxxxxxx',
    }
};

export { keys };