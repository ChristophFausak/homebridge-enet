"use strict";

const eNet = require('node-enet-api');

var Service, Characteristic, Accessory, UUIDGen;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.platformAccessory;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-eNet", "eNetPlatform", eNetPlatform); //, true);
}


function eNetPlatform(log, config, api) {
    this.log = log;
    this.config = config;
    this.gateways = Array.isArray(config.gateways) ? config.gateways : [];
    this.accessories = [];
    this.gateways = [];
    this.loadState = 2; // didFinishLaunching & discover

    var discover = new eNet.discover();

    discover.on('discover', function(gw) {this.newGateway(gw)}.bind(this));

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
    if (Array.isArray(this.config.gateways)) {
        for (var i = 0; i < this.config.gateways.length; ++i) {
            var gw = this.config.gateways[i];
            if (Array.isArray(gw.accessories)) {
                var g;
                if (gw.host) g = this.findGateway(gw.host);
                if (!g && gw.mac) g = this.findGateway(gw.mac);
                if (!g && gw.name) g = this.findGateway(gw.name);

                if (!g && gw.host) {
                    g = new eNet.gateway(gw);
                    ++this.loadState;

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

                    return;
                }

                if (g) {
                    for (var j = 0; j < gw.accessories.length; ++j) {
                        var acc = gw.accessories[j];

                        var a = this.findAccessory(g.id, acc.channel);
                        if (a) {
                            if (a.context.type != acc.type) {
                                // kick this accessory out, create new one
                                a.reachable = false;
                            }
                            else if (!a.reachable) {
                                a.gateway = g;
                                a.reachable = true;
                            }
                        }
                        else {
                            this.createAccessory(g, acc);
                        }
                    }
                }
                else this.log.warn("Cannot find gateway: " + JSON.stringify(gw));
            }
            else this.log.warn("Gateway has no accessories: " + JSON.stringify(gw));
        }
    }
    else this.log.warn("No gateways defined: " + JSOM.stringify(this.config));

    var keep = [], del = [];
    for (var i = 0; i < this.accessories.length; ++i) {
        var acc = this.accessories[i];
        if (acc.reachable) keep.push(acc);
        else {
            this.log.info("Deleting old accessory: " + JSON.stringify(acc.context));
            del.push(acc);
        }
    }

    this.accessories = keep;
    if (del.length) this.api.unregisterPlatformAccessories("homebridge-eNet", "eNetPlatform", del);

    this.log.info("Platform initialization finishd: " + this.accessories.length + " accessories available.");
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
        if ((a.context.gateID === gateID) && (a.context.channel === channel)) return a;
    }
}

eNetPlatform.prototype.configureAccessory = function(accessory) {
    this.log.info("Configure accessory: " + JSON.stringify(accessory.context));
    if (this.setupAccessory(accessory)) {
        accessory.reachable = false;
        this.accessories.push(accessory);
    }
}

eNetPlatform.prototype.createAccessory = function(gate, conf) {
    var uuid;

    if (!conf.name || (typeof conf.channel !== 'number')) {
        this.log.warn("Cannot add accessory, invalid config: " + JSON.stringify(conf));
        return;
    }

    this.log.info("Creating accessory: " + JSON.stringify(conf));

    uuid = UUIDGen.generate(JSON.stringify(conf));

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
        this.log.warn("Cannot add accessory, invalid config: " + JSON.stringify(conf));
        return;
    }

    accessory.context.gateID = gate.id;
    accessory.context.type = conf.type;
    accessory.context.channel = conf.channel;

    if (this.setupAccessory(accessory)) {
        accessory.reachable = true;
        accessory.gateway = gate;
        this.accessories.push(accessory);
        this.api.registerPlatformAccessories("homebridge-eNet", "eNetPlatform", [accessory]);
    }
}

eNetPlatform.prototype.setupAccessory = function(accessory) {
    var service;

    accessory.log = this.log;

    if (service = accessory.getService(Service.Lightbulb)) {
        service
          .getCharacteristic(Characteristic.On)
//          .on('get', getCurrentPosition.bind(accessory))
          .on('set', setOn.bind(accessory));
    }
    else if (service = accessory.getService(Service.Switch)) {
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
          .on('set', setPositionState.bind(accessory))
          .value = this.positionState;

    }
    else
    {
        this.log.warn("Cannot configure accessory, no service found. " + JSON.stringify(accessory.context));
        return false;
    }

    accessory.on('identify', function(paired, callback) {
        this.log.info("Identify: " + JSON.stringify(this.context));
        callback();
    }.bind(accessory));

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

  this.log.info("Setting " + this.name + " to " + position === true ? "on" : "off");
  this.gateway.setValue(this.context.channel, position, false, function(err, res) {
      if (err) {
          this.log.warn("Error setting " + this.name + " to " + position === true ? "on" : "off" + ": " + err);
          callback(err);
      }
      else {
          this.log.info("Succeeded setting " + this.name + " to " + position === true ? "on" : "off" + ": " + JSON.stringify(res));
          callback(null);
      }
  });
}
