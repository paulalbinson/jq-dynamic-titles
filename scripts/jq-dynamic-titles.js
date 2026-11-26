/*!
 * jQuery Dynamic Titles
 * Copyright (C) 2010-2026 Paul Albinson
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory;
    } else {
        factory(jQuery, window);
    }
})(function ($, window) {
    let document = window.document;
    let hasFocus = document.hasFocus();
    let stopOnFocus = false;
    let dynTitlesInterval = null;
    let origDocuTitle = document.title;

    $.dynTitles = function (options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = null;
        }

        let settings = $.extend({}, $.dynTitles.defaults, options);

        // Normalise recognised string options without changing the message.
        ['type', 'speed', 'direction'].forEach(function (key) {
            if (typeof settings[key] === 'string') {
                settings[key] = settings[key].toLowerCase();
            }
        });

        // Accept full direction names alongside the existing shorthand.
        if (settings.direction === 'forward') {
            settings.direction = 'fwd';
        } else if (settings.direction === 'backward') {
            settings.direction = 'bwd';
        }

        let namedSpeed = settings.speed === 'fast' ||
            settings.speed === 'medium' ||
            settings.speed === 'slow';

        if (settings.type !== 'restore' && !namedSpeed && (
            typeof settings.speed !== 'number' ||
            !Number.isFinite(settings.speed) ||
            settings.speed <= 0 ||
            settings.speed > 2147483647
        )) {
            throw new TypeError(
                'Speed must be fast, medium, slow, or a positive number of milliseconds.'
            );
        }

        if (['blink', 'scroll', 'const', 'restore'].indexOf(settings.type) === -1) {
            throw new TypeError(
                'Type must be blink, scroll, const, or restore.'
            );
        }

        if (settings.type !== 'restore' && typeof settings.message !== 'string') {
            throw new TypeError('Message must be a string.');
        }

        if (settings.type === 'scroll' && settings.direction !== 'fwd' && settings.direction !== 'bwd') {
            throw new TypeError('Direction must be forward or backward, or the shorthand fwd or bwd.');
        }

        if (settings.type === 'scroll' && typeof settings.reverse !== 'boolean') {
            throw new TypeError('Reverse must be a boolean.');
        }

        if (settings.type !== 'restore' && typeof settings.onlyOnNonFocus !== 'boolean') {
            throw new TypeError('onlyOnNonFocus must be a boolean.');
        }

        stopOnFocus = settings.onlyOnNonFocus && settings.type !== 'restore';

        window.clearTimeout(dynTitlesInterval); // Stop any other usages of dynTitles that may be running

        let speedNumeric = false;
        switch (settings.speed) {
            case "fast":
                settings.speed = 200;
                break;
            case "medium":
                settings.speed = 400;
                break;
            case "slow":
                settings.speed = 1000;
                break;
            default:
                speedNumeric = true; // The speed must be numeric
                break;
        }

        switch (settings.type) {
            case "const":
                if (((settings.onlyOnNonFocus === true) && (hasFocus === false)) || (settings.onlyOnNonFocus === false)) {
                    document.title = settings.message;
                } else {
                    document.title = origDocuTitle;
                }
                break;
            case "restore":
                document.title = origDocuTitle;
                break;
            case "scroll":
                scrollTitle(settings.message, settings.position, settings.speed, settings.direction, settings.reverse, settings.onlyOnNonFocus);
                break;
            case "blink":
                // Fast/medium/slow needs to be slower than for scroll otherwise it looks too slow
                if (speedNumeric === false) {
                    settings.speed = (settings.speed * 5);
                }
                blinkTitle(settings.message, settings.position, settings.speed, false, settings.onlyOnNonFocus);
                break;
        }
        if (typeof callback === 'function') { // make sure the callback is a function
            callback.call(this); // brings the scope to the callback
        }

        return this; // Returns jQuery to allow for chainability.
    };

    $.dynTitles.defaults = {
        type: 'blink',
        message: 'New Message',
        speed: 'medium',
        direction: 'fwd',
        reverse: true,
        onlyOnNonFocus: true
    };

    $(window).on('blur.dynTitles', function () {
        hasFocus = false;
    });

    $(window).on('focus.dynTitles', function () {
        hasFocus = true;

        if (stopOnFocus) {
            window.clearTimeout(dynTitlesInterval);
            dynTitlesInterval = null;
            document.title = origDocuTitle;
            stopOnFocus = false;
        }
    });

    function blinkTitle(message, position, speed, showDefault, onlyOnNonFocus) {
        let docuTitle;
        if (((onlyOnNonFocus === true) && (hasFocus === false)) || (onlyOnNonFocus === false)) {
            if ((showDefault === true) || (showDefault === undefined)) {
                docuTitle = origDocuTitle;
                showDefault = false;
            } else {
                docuTitle = message;
                showDefault = true;
            }
            dynTitlesInterval = window.setTimeout(function () {
                blinkTitle(message, position, speed, showDefault, onlyOnNonFocus);
            }, speed);
        } else {
            // set the page title as the default title and remove the timeout
            window.clearTimeout(dynTitlesInterval);
            dynTitlesInterval = null;
            docuTitle = origDocuTitle;
        }
        document.title = docuTitle; // set the page title
    }

    function scrollTitle(message, position, speed, direction, reverse, onlyOnNonFocus) {
        // Scrolling title script inspired by HIOX INDIA / hscripts.com
        let characters;

        if (window.Intl && window.Intl.Segmenter) {
            const segmenter = new window.Intl.Segmenter(undefined, {
                granularity: 'grapheme'
            });

            characters = Array.from(
                segmenter.segment(message),
                function (part) {
                    return part.segment;
                }
            );
        } else {
            characters = Array.from(message);
        }

        let msgLen = characters.length;
        let docuTitle;
        let speedToUse = speed;
        if (position === undefined || position === null) {
            if (direction === "bwd") {
                position = msgLen + 1;
            } else {
                position = 0;
            }
        }
        if (direction === undefined || direction === null) {
            direction = "fwd";
        }

        // If page is not in focus or we chose to always run the scroller
        if (((onlyOnNonFocus === true) && (hasFocus === false)) || (onlyOnNonFocus === false)) {
            if (direction === "fwd") { // If direction is forward or hasn't been set
                if (position < msgLen) {
                    position = position + 1;
                    docuTitle = characters.slice(0, position).join('');
                } else if (reverse === true) {
                    speedToUse = 2000;
                    direction = "bwd";
                    docuTitle = message;
                } else {
                    docuTitle = origDocuTitle;
                    speedToUse = 1500;
                    position = 0;
                }
            } else {
                // Go backwards
                if (position === msgLen + 1) {
                    speedToUse = 2000;
                }

                position = position - 1;

                let startPos = (msgLen - position); // Set the start position of the substring to output
                // If the position is 0 or greater and the start position is less than the message length (i.e. we can select something)
                if ((position >= 0) && (startPos < msgLen)) {
                    docuTitle = characters.slice(startPos).join('');  // Select the new substring to use as the page title
                } else {
                    // If not, i.e scrolled back to the beginning then display the default title
                    docuTitle = origDocuTitle;
                    speedToUse = 1500; // Increase the time before moving on to see the default title for longer
                    if (reverse === true) {
                        direction = "fwd";
                    } else {
                        position = msgLen + 1;
                    }
                }
            }

            // Replace/update the timeout
            dynTitlesInterval = window.setTimeout(function () {
                scrollTitle(message, position, speed, direction, reverse, onlyOnNonFocus);
            }, speedToUse);
        } else {
            // set the page title as the default title and remove the timeout
            window.clearTimeout(dynTitlesInterval);
            dynTitlesInterval = null;
            docuTitle = origDocuTitle;
        }
        document.title = docuTitle; // set the page title
    }

    return $.dynTitles;
});
