
(function initApp() {
    'use strict';
    
    var 

        CHECK_BATTERY_INTERVAL = 10000,
        BATTERY_FEATURE = 'http://tizen.org/feature/battery',
        SYSINFO_BATTERY_KEY = 'BATTERY',
        batteryData = {};
    
    function checkBatteryCapability() {
        try {
            return tizen.systeminfo.getCapability(BATTERY_FEATURE);
        } catch(e) {
            console.error('Exception', e.message);
            return false;
        }
    }

    function compareBatteryData(data) {
        var changed = false;
        $("#battery-info").empty();
        Object.keys(data).forEach(function compare(key) {
        	
        	$("#battery-info").append(key + ": " + data[key] + "<br>");

        });
    }

    
    function onGetBatteryInfoError(e) {
        console.warn('battery information is temporarily unavailable.', e);
    }
    
    
    function getBatteryInfo() {
        try {
            tizen.systeminfo.getPropertyValue(SYSINFO_BATTERY_KEY, compareBatteryData,
            		onGetBatteryInfoError);
        } catch (e) {
            console.error('Exception', e.message);
        }
    }



    /**
     * Initializes application.
     */
    function init() {
    	
        if (checkBatteryCapability()) {
        	getBatteryInfo();
            window.setInterval(getBatteryInfo, CHECK_BATTERY_INTERVAL);
        } else {
            try{
                tizen.application.getCurrentApplication().exit();
            } catch(e) {
                console.error('Exception', e.message);
            }
        }
    }

    init();

})();
