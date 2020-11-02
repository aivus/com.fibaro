'use strict';

const { ZwaveDevice } = require('homey-meshdriver');

// TODO: Make the MultiChannel node 2 (optional bluetooth temperature sensor) report the temperature, currently not possible since the device doesn't report the MultiChannel node unless you change a setting.
// TODO: set battery type in driver.compose.json
class RadiatorThermostat extends ZwaveDevice {

  async onMeshInit() {

    if (await !this.hasCapability('alarm_generic')) await this.addCapability('alarm_generic');

    this.enableDebug();

    this.registerCapability('measure_battery', 'BATTERY', {
      getOpts: {
        pollInterval: 'poll_interval_battery',
        pollMultiplication: 1000,
      },
    });
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {
        	getOpts: {
        		pollInterval: 'poll_interval_measure_temperature',
        pollMultiplication: 1000,
      },
      reportParser: report => {
        if (report['Sensor Type'] !== 'Temperature (version 1)') return null;
        return report['Sensor Value (Parsed)'];
      },
      reportParserOverride: true,
    });
    this.registerCapability('target_temperature', 'THERMOSTAT_SETPOINT', {
      getOpts: {
        pollInterval: 'poll_interval_target_temperature',
        pollMultiplication: 1000,
      },
    });

    this.registerCapability('alarm_generic', 'CONFIGURATION', {
      getOpts: {
        getOnStart: true,
        getOnOnline: true,
      },
      get: 'CONFIGURATION_GET',
      getParser: () => ({
        'Parameter Number': 3
      }),
      report: 'CONFIGURATION_REPORT',
      reportParser: report => {
        const rawValue = report['Configuration Value'].readUInt32BE(0);
        this.log(rawValue);
        return !!(rawValue & 1);
      },
      reportParserOverride: true,
    });

    // const config = await this.configurationGet({index: 3});
    //
    // this.log('config', config);
  }

}

module.exports = RadiatorThermostat;
