# homebridge-enet

Gira/Jung eNet plugin for homebridge: https://github.com/nfarina/homebridge

# +++ UNDER DEVELOPMENT +++ UNDER DEVELOPMENT +++ UNDER DEVELOPMENT +++
## No usability yet - checkin in a few weeks for usable code
# +++ UNDER DEVELOPMENT +++ UNDER DEVELOPMENT +++ UNDER DEVELOPMENT +++

# Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g https://github.com/ChristophFausak/homebridge-enet`
3. Update your configuration file. See the sample below.

# Configuration

Configuration sample:

 ```javascript

     "platforms": [
             {
               "platform": "eNetPlatform",
               "name": "eNet",
               "gateways" : ["1.1.1.1", "myGateway.local"],
             }   
         ]
 }

 ```


`gateways` is **optional**, defines an array of hostnames or ip addresses of your eNet gateways. Default is to autodiscover gateways using broadcasts.


# License

Published under the MIT License.
