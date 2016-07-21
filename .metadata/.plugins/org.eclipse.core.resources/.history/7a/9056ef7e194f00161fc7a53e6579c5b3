/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global screen, setTimeout, window, document, tizen*/

(function initApp() {
    'use strict';

    /**
     * Arrows rotation angle for 0 signal strength (in radians).
     *
     * @const {number}
     */
    var 

        /**
         * Refresh Wi-Fi status interval (milliseconds)
         *
         * @const {number}
         */
        CHECK_WIFI_INTERVAL = 10000,

        /**
         * Wi-Fi network feature.
         *
         * @const {string}
         */
        WIFI_FEATURE = 'http://tizen.org/feature/network.wifi',

        /**
         * SystemInfo key for Wi-Fi Networks.
         *
         * @const {string}
         */
        SYSINFO_WIFI_KEY = 'WIFI_NETWORK',


        /**
         * Stores data from Tizen API.
         *
         * @type {object}
         */
        wifiData = {};





    /**
     * Returns capability for Wi-Fi Network.
     *
     * @returns {boolean}
     */
    function checkCapacity() {
        try {
            return tizen.systeminfo.getCapability(WIFI_FEATURE);
        } catch(e) {
            console.error('Exception', e.message);
            return false;
        }
    }

    /**
     * Compares provided data object with stored data object.
     * Calls GUI update if object data differs.
     *
     * @param {SystemInfoWifiNetwork} data
     */
    function compareData(data) {
        var changed = false;
        $(".connection-status").empty();
        Object.keys(data).forEach(function compare(key) {
        	
        	$(".connection-status").append(key + ": " + data[key] + "<br>");

        });


    }

    /**
     * Error callback for getting Wi-Fi information.
     *
     * @param {Error} e Error object.
     */
    function onGetWifiInfoError(e) {
        console.warn('Wi-Fi information is temporarily unavailable.', e);
    }

    /**
     * Gets information about currently connected Wi-Fi network
     * and passes the data to comparing function.
     */
    function getWifiInfo() {
        try {
            tizen.systeminfo.getPropertyValue(SYSINFO_WIFI_KEY, compareData,
                    onGetWifiInfoError);
        } catch (e) {
            console.error('Exception', e.message);
        }
    }



    /**
     * Initializes application.
     */
    function init() {


        if (checkCapacity()) {
            getWifiInfo();
            window.setInterval(getWifiInfo, CHECK_WIFI_INTERVAL);
        } else {
            window.alert('This device doesn\'t support Wi-Fi networks.');
            try{
                tizen.application.getCurrentApplication().exit();
            } catch(e) {
                console.error('Exception', e.message);
            }
        }
    }

    init();

})();
