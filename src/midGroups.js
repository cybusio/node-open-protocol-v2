module.exports = /** @type {const} */ ({
    "psetSelected": {
        "data": 15,
        "subscribe": 14,
        "unsubscribe": 17,
        "errSubExist": 13,
        "errNoSub": 14,
        "ack": 16,
        "generic": true
    },
    "lockAtBatchDoneUpload": {
        "data": 22,
        "subscribe": 21,
        "unsubscribe": 24,
        "errSubExist": 88,
        "errNoSub": 89,
        "ack": 23,
        "generic": true
    },
    "jobInfo": {
        "data": 35,
        "subscribe": 34,
        "unsubscribe": 37,
        "errSubExist": 18,
        "errNoSub": 19,
        "ack": 36,
        "generic": true
    },
    "vin": {
        "data": 52,
        "subscribe": 51,
        "unsubscribe": 54,
        "errSubExist": 6,
        "errNoSub": 7,
        "ack": 53,
        "generic": true
    },
    "lastTightening": {
        "data": 61,
        "subscribe": 60,
        "errSubExist": 9,
        "errNoSub": 10,
        "unsubscribe": 63,
        "ack": 62,
        "generic": true
    },
    "alarm": {
        "data": 71,
        "subscribe": 70,
        "unsubscribe": 73,
        "errSubExist": 11,
        "errNoSub": 12,
        "ack": 72,
        "generic": true
    },
    "alarmStatus":{
        "data": 76,
        "ack": 77,
        "outList": true
    },
    "alarmAcknowledged":{
        "data": 74,
        "ack": 75,
        "outList": true
    },
    "multiSpindleStatus": {
        "data": 91,
        "subscribe": 90,
        "unsubscribe": 93,
        "errSubExist": 31,
        "errNoSub": 32,
        "ack": 92,
        "generic": true
    },
    "multiSpindleResult": {
        "data": 101,
        "subscribe": 100,
        "unsubscribe": 103,
        "errSubExist": 33,
        "errNoSub": 34,
        "ack": 102,
        "generic": true
    },    
    "lastPowerMACSTighteningResultStationData": {
        "data": 106,
        "subscribe": 105,
        "unsubscribe": 109,
        "ack": 108,
        "generic": true
    },
    "jobLineControl": {
        "data": 121,
        "subscribe": 120,
        "unsubscribe": 126,
        "errSubExist": 40,
        "errNoSub": 41,
        "ack": 125,
        "generic": true
    },
    "multipleIdentifierResultParts": {
        "data": 152,
        "subscribe": 151,
        "unsubscribe": 154,
        "errSubExist": 43,
        "errNoSub": 44,
        "ack": 153,
        "generic": true
    },
    "statusExternallyMonitoredInputs": {
        "data": 211,
        "subscribe": 210,
        "unsubscribe": 213,
        "errSubExist": 50,
        "errNoSub": 51,
        "ack": 212,
        "generic": true
    },
    "relayFunction": {
        "data": 217,
        "subscribe": 216,
        "unsubscribe": 219,
        "errSubExist": 84,
        "errNoSub": 85,
        "ack": 218,
        "generic": true
    },
    "digitalInputFunction": {
        "data": 221,
        "subscribe": 220,
        "unsubscribe": 223,
        "errSubExist": 88,
        "errNoSub": 89,
        "ack": 222,
        "generic": true
    },
    "userData": {
        "data": 242,
        "subscribe": 241,
        "unsubscribe": 244,
        "ack": 243,
        "generic": true
    },
    "selectorSocketInfo": {
        "data": 251,
        "subscribe": 250,
        "unsubscribe": 253,
        "errSubExist": 86,
        "errNoSub": 87,
        "ack": 252,
        "generic": true
    },
    "toolTagID": {
        "data": 262,
        "subscribe": 261,
        "unsubscribe": 264,
        "errSubExist": 55,
        "errNoSub": 56,
        "ack": 263,
        "generic": true
    },
    "automaticManualMode": {
        "data": 401,
        "subscribe": 400,
        "unsubscribe": 403,
        "errSubExist": 82,
        "errNoSub": 83,
        "ack": 402,
        "generic": true
    },
    "openProtocolCommandsDisabled": {
        "data": 421,
        "subscribe": 420,
        "unsubscribe": 423,
        "errSubExist": 93,
        "errNoSub": 94,
        "ack": 422,
        "generic": true
    },
    "motorTuningResultData": {
        "data": 501,
        "subscribe": 500,
        "unsubscribe": 503,
        "ack": 502,
        "generic": true
    },
    "traceData": {
        "data": 900,
        "subscribe": 900,
        "unsubscribe": 9,
        "ack": 900,
        "generic": true
    },
    "plotData": {
        "data": 901,
        "subscribe": 901,
        "unsubscribe": 9,
        "ack": 901,
        "generic": true
    }
});
