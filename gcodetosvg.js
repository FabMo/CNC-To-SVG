/*jslint todo: true, browser: true, continue: true, white: true*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

"use strict";

var fs = require("fs");
var gcodetogeometry = require("gcodetogeometry");

/*
 * The colors for displaying G0, G1, G2 and G3 commands, each field is a string
 * of an hexadecimal color (ex: "#ff00ff"). If one field is undefined, the
 * corresponding G-Code command is not displayed.
 *
 * @typedef {object} Colors
 * @property {string} [colors.G0] - The colors for displaying G0 commands.
 * @property {string} [colors.G1] - The colors for displaying G1 commands.
 * @property {string} [colors.G2G3] - The colors for displaying G2 and G3
 *   commands.
 */

/**
 * Generates the SVG header.
 * @param {string} title - The SVG title.
 * @param {number} width - The SVG width (in pixels).
 * @param {number} height - The SVG height (in pixels).
 * @return {string} The SVG header.
 */
function header(title, width, height) {
    var h = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
    h += '<svg xmlns="http://www.w3.org/2000/svg" ';
    h += 'width="' + width + 'px" height="' + height + 'px">\n';
    h += '  <title>' + title + '</title>\n';
    return h;
}

/**
 * Generates the SVG footer.
 * @return {string} The SVG footer.
 */
function footer() {
    return "</svg>";
}

/**
 * Calculate the scale for drawing the path. It is useful for having the path
 * using the whole drawing space.
 *
 * @param {number} gcodeWidth - The width of the G-Code generated path.
 * @param {number} gcodeHeight - The height of the G-Code generated path.
 * @param {number} svgWidth - The SVG width.
 * @param {number} svgHeight - The SVG height.
 * @return {number} The scale.
 */
function calculateScale(gcodeWidth, gcodeHeight, svgWidth, svgHeight) {
    return Math.min(svgWidth / gcodeWidth, svgHeight / gcodeHeight);
}

/**
 * Generates an SVG file representing the path made by the G-Code commands.
 *
 * @param {string} gcodeCommands - The G-Code commands.
 * @param {Colors} colors - The colors for displaying the path according to the
 * command.
 * @param {string} title - The SVG title.
 * @param {number} width - The SVG width (in pixels).
 * @param {number} height - The SVG height (in pixels).
 * @param {number} [lineThickness=2] - The SVG line thickness (in pixels).
 * @return {string} An empty string if there is an error, else the SVG.
 */
function createSVG(gcodeCommands, colors, title, width, height, lineThickness) {
    width = Math.abs(width);
    height = Math.abs(height);
    lineThickness = Math.abs(lineThickness);

    if(gcodeCommands === "") {
        return "";
    }

    var gcode = gcodetogeometry.parse(gcodeCommands);
    var gcodeWidth = gcode.size.max.x - gcode.size.min.x;
    var gcodeHeight = gcode.size.max.y - gcode.size.min.y;
    if(gcodeWidth === 0 || gcodeHeight === 0) {
        return "";
    }

    var scale = calculateScale(gcodeWidth, gcodeHeight, width, height);

    return header(title, width, height) + footer();
}

exports.createSVG = createSVG;
