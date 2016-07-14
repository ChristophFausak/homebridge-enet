"use strict";

var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerPlatform("homebridge-eNet", "eNetPlatform", eNetPlatform);
}


function eNetPlatform(log, config){
    this.log = log;
    this.config = config;
    this.gateways = Array.isArray(config.gateways) ? config.gateways : [];
};

eNetPlatform.prototype.accessories = function(callback) {
    callback([new eNetShutterAccessory(this.log, "just a test", 16, "TestAccessory")]);
}

function eNetShutterAccessory(log, gateway, channel, name) {
	this.log = log;
    this.gateway = gateway;

    this.channel = channel;
    this.name = name;

    this.position = 0;

/*    Service.WindowCovering

      // Required Characteristics
      this.addCharacteristic(Characteristic.CurrentPosition);
      this.addCharacteristic(Characteristic.TargetPosition);
      this.addCharacteristic(Characteristic.PositionState);

      // Optional Characteristics
      this.addOptionalCharacteristic(Characteristic.HoldPosition);
      this.addOptionalCharacteristic(Characteristic.TargetHorizontalTiltAngle);
      this.addOptionalCharacteristic(Characteristic.TargetVerticalTiltAngle);
      this.addOptionalCharacteristic(Characteristic.CurrentHorizontalTiltAngle);
      this.addOptionalCharacteristic(Characteristic.CurrentVerticalTiltAngle);
      this.addOptionalCharacteristic(Characteristic.ObstructionDetected);
      this.addOptionalCharacteristic(Characteristic.Name);
*/

    this.service = new Service.WindowCovering(this.name);

    this.service
      .getCharacteristic(Characteristic.CurrentPosition)
      .on('get', this.getCurrentPosition.bind(this));

    this.service
      .getCharacteristic(Characteristic.TargetPosition)
      .on('get', this.getTargetPosition.bind(this))
      .on('set', this.setTargetPosition.bind(this));

    this.service
      .addCharacteristic(Characteristic.PositionState)
      .on('get', this.getPositionState.bind(this));
}

eNetShutterAccessory.prototype.getServices = function() {
    return [this.service];
}

eNetShutterAccessory.prototype.getCurrentPosition = function(callback) {
  if (false) {
    this.log.warn("eNet device not yet ready.");
    callback(new Error("eNet device not yet ready."));
    return;
  }

  callback(null, this.position);
}

eNetShutterAccessory.prototype.getTargetPosition = function(callback) {
  if (false) {
    this.log.warn("eNet device not yet ready.");
    callback(new Error("eNet device not yet ready."));
    return;
  }

  callback(null, this.position);
}

eNetShutterAccessory.prototype.setTargetPosition = function(position, callback) {
  if (false) {
    this.log.warn("eNet device not yet ready.");
    callback(new Error("eNet device not yet ready."));
    return;
  }

  this.position = position;

  callback(null);
}

eNetShutterAccessory.prototype.getPositionState = function(callback) {
  if (false) {
    this.log.warn("eNet device not yet ready.");
    callback(new Error("eNet device not yet ready."));
    return;
  }

  // The value property of PositionState must be one of the following:
  // Characteristic.PositionState.DECREASING = 0;
  // Characteristic.PositionState.INCREASING = 1;
  // Characteristic.PositionState.STOPPED = 2;

  callback(null, Characteristic.PositionState.STOPPED);
}
