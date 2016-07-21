/*
 * Copyright (c) 2012 Samsung Electronics Co., Ltd. All rights reserved.
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

/*jslint devel: true*/
/*global $, Audio, window, tizen, SystemIO, document,
  navigator, clearTimeout, setTimeout, Image */
var selfCamera = null;

/**
 * SelfCamera class constructor.
 *
 * @public
 * @constructor
 */
function SelfCamera() {
    'use strict';
    return;
}

/**
 * Definition of the selfCamera class.
 */
(function strict() {
    'use strict';

  


    /**
     * Stream object handler.
     *
     * Creates stream.
     * Creates video element with stream handler.
     * Initializes timer buttons options.
     *
     * @private
     * @param {MediaStream} stream
     */
    SelfCamera.prototype.onCaptureVideoSuccess =
        function onCaptureVideoSuccess(stream) {
            var urlStream = null;

            urlStream = window.webkitURL.createObjectURL(stream);
            alert (urlStream);
            this.createVideoElement(urlStream);
       
        };

    /**
     * Creates HTML video element and adds it to DOM.
     *
     * @private
     * @param {string} src
     */
    SelfCamera.prototype.createVideoElement =
        function createVideoElement(src) {
            this.video = $('<video/>', {
                autoplay: 'autoplay',
                id: 'video',
                style: 'height:' + $(window).height()/2 + 'px',
                src: src
            }).appendTo('#camera').get(0);

        };

    /**
     * Handles video capture error event.
     *
     * @private
     * @param {Event} e Error event.
     */
    SelfCamera.prototype.onCaptureVideoError =
        function onCaptureVideoError(e) {
            console.error(e);
        };

    /**
     * Enables navigator media options to manage video stream.
     *
     * @private
     */
    SelfCamera.prototype.startPreview = function startPreview() {
        // declare what will be used by this application
        var options = {
            audio: true,
            video: true
        };

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia;
        
        
        try {
            if (typeof (navigator.getUserMedia) === 'function') {
                // ask user to grant permissions to use media objects
                navigator.getUserMedia(options,
                    this.onCaptureVideoSuccess.bind(this),
                    this.onCaptureVideoError.bind(this));
            }
        } catch (e) {
            alert('navigator.getUserMedia() error.');
            console.error('navigator.getUserMedia() error: ' + e.message);
        }
    };

    /**
     * Launches service to display taken photo.
     *
     * Returns 'false' if preview is locked or file name is invalid, 'true'
     * otherwise.
     *
     * @private
     * @returns {boolean}
     */
    SelfCamera.prototype.launchPreview = function launchPreview() {
        // if preview is locked
        if (this.previewLocked) {
            return false;
        }
        // if filename is invalid
        if (this.filename === '') {
            return false;
        }
        // try to launch service
        this.showPhotoPreview(this.filename);
        return true;
    };

   

    /**
     * Displays failure message for 3s.
     *
     * @private
     */
    SelfCamera.prototype.showFailureMessage = function showFailureMessage() {
        $('#failure').css('display', 'block');
        setTimeout(
            function hideFailureMessage() {
                $('#failure').css('display', 'none');
            },
            3000
        );
    };

  

   
    /**
     * Handles video element error.
     *
     * @private
     */
    SelfCamera.prototype.onVideoError = function onVideoError() {
        if (this.video.networkState === this.video.NETWORK_NO_SOURCE) {
            alert('Cannot connect to camera. Application will be closed.');

            try {
                tizen.application.getCurrentApplication().exit();
            } catch (error) {
                console.log(error);
            }
        }
    };

 
    /**
     * Initializes self camera application.
     *
     * @public
     */
    SelfCamera.prototype.init = function init() {
        var self = this;
        self.startPreview();

    };

}());

selfCamera = new SelfCamera();
$(document).ready(function onReady() {
    'use strict';
    selfCamera.init();
});
