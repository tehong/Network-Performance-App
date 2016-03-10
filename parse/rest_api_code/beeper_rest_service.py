#!/usr/bin/env python

# Created by ehong @ 03/07/2016
# Steps to populate the RestService class on "Beeper - Master Control" app
#
# (1) Delete all rows in the "RestService" class using parse.com Data Browser
#    as there is no way to delete all rows via REST or other APIs
# (2) Run this script on the command line:
#       > ./NAME_OF_THE_SCRIPT.py

# applicaiton ID and REST API Key for the Beeper - Master Control parse app
APPLICATION_ID = "B9NTwqpe0pua2VK3uKRleQvztdVXbpiQNvPyOJej"
REST_API_KEY = "gXLVNV8eiVGHFSJ6uaJws8R3bQaAzMja73qyQoNg"

# User class object IDs are used as application control

APP_OBJECT_ID_BEEPER_THUMB = "x3UG0fg7gi"
APP_OBJECT_ID_BEEPER_THUMB_SUPPORT = "5IkfYukhXr"
APP_OBJECT_ID_BEEPER_DEVELOPMENT = "R8IjAxKtWb"
APP_OBJECT_ID_BEEPER_DEMO = "I9WOoxkWHY"

#backend host name and port
HOST_PROD = "52.20.201.145:3010"
HOST_DEV = "54.165.24.76:3010"
HOST_DEMO = ""

#service protocol
PROTOCOL_HTTP = "http"
PROTOCOL_HTTPS = "https"

# entityType (UI entity Type)
ENTITY_MONTHLY_TARGET = "monthly_target"
ENTITY_NETWORK_PERF = "network_perf"
ENTITY_SITE_PERF = "site_perf"
ENTITY_SECTOR_PERF = "sector_perf"
ENTITY_SECTOR_COLOR = "sector_color"
ENTITY_SECTOR_DETAIL = "sector_detail"
ENTITY_SECTOR_LOCATION = "sector_location"

import json,httplib
connection = httplib.HTTPSConnection('api.parse.com', 443)
connection.connect()
connection.request('POST', '/1/batch', json.dumps({
# Beeper - Developement
       "requests": [
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_NETWORK_PERF,
                   "serviceUrl": "/kpis/v1/network/all/kpi/all"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_MONTHLY_TARGET,
                   "serviceUrl": "/kpis/v1/monthly/target/kpi/all"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_SITE_PERF,
                   "serviceUrl": "/kpis/v2/site/all/kpi/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_SECTOR_COLOR,
                   "serviceUrl": "/kpis/v2/sector/all/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_SECTOR_PERF,
                   "serviceUrl": "/kpis/v2/sectors/site/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_SECTOR_DETAIL,
                   "serviceUrl": "/kpis/v1/sector/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_DEVELOPMENT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_DEV,
                   "entityType": ENTITY_SECTOR_LOCATION,
                   "serviceUrl": "/kpis/v1/location/sectors/all"
                }
            },
# Beeper - Thumb Support
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_NETWORK_PERF,
                   "serviceUrl": "/kpis/v1/network/all/kpi/all"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_MONTHLY_TARGET,
                   "serviceUrl": "/kpis/v1/monthly/target/kpi/all"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SITE_PERF,
                   "serviceUrl": "/kpis/v2/site/all/kpi/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_COLOR,
                   "serviceUrl": "/kpis/v2/sector/all/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_PERF,
                   "serviceUrl": "/kpis/v2/sectors/site/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_DETAIL,
                   "serviceUrl": "/kpis/v1/sector/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB_SUPPORT
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_LOCATION,
                   "serviceUrl": "/kpis/v1/location/sectors/all"
                }
            },
# Beeper - Thumb
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_NETWORK_PERF,
                   "serviceUrl": "/kpis/v1/network/all/kpi/all"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_MONTHLY_TARGET,
                   "serviceUrl": "/kpis/v1/monthly/target/kpi/all"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SITE_PERF,
                   "serviceUrl": "/kpis/v2/site/all/kpi/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_COLOR,
                   "serviceUrl": "/kpis/v2/sector/all/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_PERF,
                   "serviceUrl": "/kpis/v2/sectors/site/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_DETAIL,
                   "serviceUrl": "/kpis/v1/sector/"
                }
            },
            {
                "method": "POST",
                "path": "/1/classes/RestService",
                "body": {
                   "application": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": APP_OBJECT_ID_BEEPER_THUMB
                   },
                   "protocol": PROTOCOL_HTTP,
                   "hostName": HOST_PROD,
                   "entityType": ENTITY_SECTOR_LOCATION,
                   "serviceUrl": "/kpis/v1/location/sectors/all"
                }
            }
        ]
     }), {
       "X-Parse-Application-Id": APPLICATION_ID,
       "X-Parse-REST-API-Key": REST_API_KEY,
       "Content-Type": "application/json"
     })
results = json.loads(connection.getresponse().read())
print results
