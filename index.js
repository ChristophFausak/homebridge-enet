"use strict";

const eNet = require('node-enet-api');

var Service, Characteristic, UUIDGen;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-eNet", "eNet", eNetPlatform); //, true);
}


function eNetPlatform(log, config, api) {
    this.log = log;
    this.config = config;
    this.gateways = Array.isArray(config.gateways) ? config.gateways : [];
    this.accessories = [];
    this.gateways = [];
    this.loadState = 2; // didFinishLaunching & discover

    var discover = new eNet.discover();

    discover.on('discover', this.newGateway});

    if (api) {
        this.api = api;

        this.api.on('didFinishLaunching', function() {
            if (--this.loadState === 0) this.setupDevices();
        }.bind(this));
    }
    else --this.loadState;

    discover.discover(function(err) {
        if (err) log.console.warn('Discovery error: ' + err);
        if (--this.loadState === 0) this.setupDevices();
    }.bind(this));
};

eNetPlatform.prototype.newGateway = function (gw) {
    ++this.loadState;
    var g = new eNet.gateway(gw);

    g.getChannelInfo(function(err, res) {
        if (!err)
        {
            if (res && Array.isArray(res.DEVICES)) {
                g.devices = res.DEVICES;
                this.gateways.push(g);
            }
            else err = JSON.stringify(res);
        }

        if (err) this.log.warn("Failed to get gateway channels, ignoring gateway. Error: " + err);
        if (--this.loadState === 0) this.setupDevices();
    }.bind(this));
};

eNetPlatform.prototype.setupDevices = function() {
    // connect cached accessories to gateways
    for (var i = 0; i < this.accessories.length; ++i) {
        var acessory = this.accessories[i];
        if (!accessories.gateway) {
            if (accessory.gateway = this.findGateway(accessory.context.gateID)) {
                accessory.reachable = true;
            }
        }
    }

    var addedDevices = false;

    if (Array.isArray(this.config.gateways)) {
        for (var i = 0; i < this.config.gateways.length; ++i) {
            var gw = this.config.gateways[i];
            if (Array.isArray(g.accessories)) {
                var g;
                if (gw.host) g = this.findGateway(gw.host);
                if (!g && gw.mac) g = this.findGateway(gw.mac);
                if (!g && gw.name) g = this.findGateway(gw.name);

                if (!g && gw.host) {
                    g = new eNet.gateway(gw);
                    g.getChannelInfo(function(err, res) {
                        if (!err)
                        {
                            if (res && Array.isArray(res.DEVICES)) {
                                g.devices = res.DEVICES;
                                this.gateways.push(g);
                            }
                            else err = JSON.stringify(res);
                        }

                        if (err) this.log.warn("Failed to get gateway channels, ignoring gateway. Error: " + err);
                        if (--this.loadState === 0) this.setupDevices();
                    }.bind(this));
                }

                if (g) {
                    for (var j = 0; j < gw.accessories; ++j) {
                        var acc = gw.accessories[j];

                        a = findAccessory(g.id, acc.channel);
                        if (a && a.context.type != acc.type) {
                            // kick this accessory out, create new one
                            a.reachable = false;
                            this.createAccessory(g.id, acc);
                        }
                    }
                }
                else this.log.warn("Cannot find gateway: " + JSON.stringify(g));
            }
        }
    }

    var keep = [], del[];
    for (var i = 0; i < this.accessories.length; ++i) {
        if (this.accessories[i].reachable) keep.push(this.accessories[i]);
        else del.push(this.accessories[i]);
    }

    this.accessories = keep;
    if (del.length) this.api.unregisterPlatformAccessories("homebridge-eNet", "eNet", del);
}

eNetPlatform.prototype.findGateway = function(id) {
    for (var i = 0; i < this.gateways.length; ++i) {
        var gw = this.gateways[i];
        if ((gw.mac === id) || (gw.name === id) || (gw.host === id)) return gw;
    }
}

eNetPlatform.prototype.findAccessory = function(gateID, channel) {
    for (var i = 0; i < this.accessories.length; ++i) {
        var a = this.accessories[i];
        if ((a.context.gateID === gateID) && (a.context === channel)) return a;
    }
}

SamplePlatform.prototype.configureAccessory = function(accessory) {
    if (this.setupAccessory(accessory)) {
        this.accessories.push(accessory);
    }
}

eNetPlatform.prototype.createAccessory = function(gateID, conf) {
    this.log.info("createShutterAccessory");
    var uuid;

    if (!conf.name || (typeof conf.channel !== 'number')) {
        thhis.log.warn("Cannot add accessory, invalid config: " JSON.stringify(conf));
        return;
    }

    uuid = UUIDGen.generate(conf.name);

    var accessory = new Accessory(conf.name, uuid);

    if (conf.type === "Shutter") {
        accessory.addService(Service.WindowCovering, "Jalousie")
    }
    else if (conf.type === "Light") {
        accessory.addService(Service.Lightbulb, "Light")
    }
    else if (conf.type === "Switch") {
        accessory.addService(Service.Switch, "Power")
    }
    else {
        thhis.log.warn("Cannot add accessory, invalid config: " JSON.stringify(conf));
        return;
    }

    accessory.context.gateID = gateID;
    accessory.context.type = conf.type;
    accessory.context.channel = conf.channel;

    if (this.setupAccessory(accessory)) {
        this.accessories.push(accessory);
        this.api.registerPlatformAccessories("homebridge-samplePlatform", "SamplePlatform", [accessory]);
    }
}

function eNetPlatform.prototype.setupAccessory(accessory) {
    var service;

    accessory.log = this.log;

    if (service = accessory.getService(Service.Lightbulb)) {
        service
          .getCharacteristic(Characteristic.On)
//          .on('get', getCurrentPosition.bind(accessory))
          .on('set', setOn.bind(accessory));
    }
    else if (service = accessory.getService(Service.Switch) {
        service
          .getCharacteristic(Characteristic.On)
//          .on('get', getCurrentPosition.bind(accessory))
          .on('set', setOn.bind(accessory));
    }
    else if (service = accessory.getService(Service.WindowCovering)) {
        this.position = 0;
        this.targetPosition = 0;
        this.positionState = Characteristic.PositionState.STOPPED;

        service
          .getCharacteristic(Characteristic.CurrentPosition)
          .on('get', getCurrentPosition.bind(accessory))
          .on('set', setCurrentPosition.bind(accessory));

        service
          .getCharacteristic(Characteristic.TargetPosition)
          .on('get', getTargetPosition.bind(accessory))
          .on('set', setTargetPosition.bind(accessory));

        service
          .getCharacteristic(Characteristic.PositionState)
          .on('get', getPositionState.bind(accessory))
          .on('set', setPositionState.bind(accessory)),
          .value = this.positionState;

    }
    else return false;

    accessory.on('identify', function(paired, callback) {
        this.log.info("Identify: " + JSON.stringify(this.context));
        callback();
    }.bind(accessory));


    if (accessory.gateway = this.findGateway(accessory.context.gateID)) {
        accessory.reachable = true;
    }
    else accessory.reachable = false;

    return true;
}

////////////////////////////////////////////////////////////////////////////////
//
//  Accessory notifications
//

function getCurrentPosition(callback) {
  callback(null, this.position);
}

function setCurrentPosition(position, callback) {
  this.position = position;
  callback(null);
}

function getTargetPosition(callback) {
  callback(null, this.position);
}

function setTargetPosition(position, callback) {
  if (!this.gateway) {
    this.log.warn("eNet device not ready.");
    callback(new Error("eNet device not ready."));
    return;
  }

  this.position = position;

  callback(null);
}

function getPositionState(callback) {
  callback(null, this.positionState);
}

// Characteristic.PositionState.DECREASING = 0;
// Characteristic.PositionState.INCREASING = 1;
// Characteristic.PositionState.STOPPED = 2;
function setPositionState(position, callback) {
  this.positionState = position;
  callback(null);
}

function setOn(position, callback) {
  if (!this.gateway) {
    this.log.warn("eNet device not ready.");
    callback(new Error("eNet device not ready."));
    return;
  }

  this.gateway.setValue(this.context.channel, position, false, callback);

// todo
  callback(null);
}
