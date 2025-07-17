
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-ble-peripheral.blePeripheral",
          "file": "plugins/cordova-plugin-ble-peripheral/www/blePeripheral.js",
          "pluginId": "cordova-plugin-ble-peripheral",
        "clobbers": [
          "blePeripheral"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-ble-peripheral": "1.0.0"
    };
    // BOTTOM OF METADATA
    });
