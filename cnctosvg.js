/*jslint todo: true, browser: true, continue: true, white: true*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

"use strict";

var fs = require("fs");
var gcodetogeometry = require("gcodetogeometry");

/**
 * Version number. Every major versions add 1000, every other versions (minor
 * or patch) add 1.
 */
exports.VERSION = 1003;

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
 * 2D point.
 *
 * @typedef {object} Point
 * @property {number} x - The x coordinate.
 * @property {number} y - The y coordinate.
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
 *
 * @return {string} The SVG footer.
 */
function footer() {
    return "</svg>";
}

/**
 * Calculates the scale for drawing the path. It is useful for having the path
 * using the whole drawing space. Undefined behaviour if the parameters are not
 * positive numbers.
 *
 * @param {number} gcodeWidth - The width of the G-Code generated path.
 * @param {number} gcodeHeight - The height of the G-Code generated path.
 * @param {number} svgWidth - The SVG width.
 * @param {number} svgHeight - The SVG height.
 * @return {number} The scale or 0 if both G-Code width and height are equal
 *   to 0 or if the SVG width or height is equal to 0.
 */
function calculateScale(gcodeWidth, gcodeHeight, svgWidth, svgHeight) {
    if(
        (gcodeWidth === 0 && gcodeHeight === 0) ||
        (svgWidth === 0 || svgHeight === 0)
    ) {
        return 0;
    }
    if(gcodeWidth === 0) {
        return svgHeight / gcodeHeight;
    }
    if(gcodeHeight === 0) {
        return svgWidth / gcodeWidth;
    }
    return Math.min(svgWidth / gcodeWidth, svgHeight / gcodeHeight);
}

/**
 * Converts a coordinate point to an image point. Used to scale the image and
 * avoid being upside down.
 *
 * @param {Point} point - The point.
 * @param {object} size - The G-Code path size.
 * @param {number} scale - The scaling ratio.
 * @return {Point} The converted coordinate.
 */
function pointToSVGPoint(point, size, scale) {
    return {
        x : scale * (point.x - size.min.x),
        y : scale * (size.max.y - point.y)
    };
}

/**
 * Generates the SVG path data for a path only composed by straight lines. In
 * general, this path should correspond to a G0 or a G1 consecutive set of
 * commands.
 *
 * @param {[objects]} lines - The lines composing the path.
 * @param {object} gcodeSize - The G-Code size.
 * @param {number} scale - The scaling ratio.
 * @return {string} The SVG path or an empty string if the color is undefined.
 */
function straightPathData(lines, gcodeSize, scale) {
    if(lines.length === 0) {
        return "";
    }
    var point = pointToSVGPoint(lines[0].start, gcodeSize, scale);
    var data = "M" + point.x + "," + point.y;
    var i = 0;
    for(i = 0; i < lines.length; i++) {
        point = pointToSVGPoint(lines[i].end, gcodeSize, scale);
        data += " L" + point.x + "," + point.y;
    }
    return data;
}

/**
 * Generates the SVG path data for a path only composed by curved lines. In
 * general, this path should correspond to a G2 and G3 consecutive set of
 * commands.
 *
 * @param {[objects]} lines - The lines composing the path.
 * @param {object} gcodeSize - The G-Code size.
 * @param {number} scale - The scaling ratio.
 * @return {string} The SVG path or an empty string if the color is undefined.
 */
function curvedPathData(lines, gcodeSize, scale) {
    if(lines.length === 0) {
        return "";
    }
    var point = pointToSVGPoint(lines[0].beziers[0].p0, gcodeSize, scale);
    var data = "M" + point.x + "," + point.y;
    var i = 0;
    var j = 0;
    var line;
    for(i = 0; i < lines.length; i++) {
        line = lines[i];
        for(j = 0; j < line.beziers.length; j++) {
            point = pointToSVGPoint(line.beziers[j].p1, gcodeSize, scale);
            data += " C" + point.x + "," + point.y;
            point = pointToSVGPoint(line.beziers[j].p2, gcodeSize, scale);
            data += " " + point.x + "," + point.y;
            point = pointToSVGPoint(line.beziers[j].p3, gcodeSize, scale);
            data += " " + point.x + "," + point.y;
        }
    }
    return data;
}

/**
 * Generates the SVG path. If the color is undefined, no path is generated.
 *
 * The function optimizes the path generation: all lines should be consecutive
 * and should have the same type, else undefined behaviour will occur.
 *
 * @param {[objects]} lines - The lines composing the path.
 * @param {Colors} colors - The colors for displaying the path according to the
 *   command.
 * @param {number} lineThickness - The SVG line thickness (in pixels).
 * @param {object} gcodeSize - The G-Code size.
 * @param {number} scale - The scaling ratio.
 * @param {string} type - The G-Code command type.
 * @return {string} The SVG path or an empty string if the color is undefined.
 */
function path(lines, colors, lineThickness, gcodeSize, scale, type) {
    var data = "";
    var color = "";
    if(type === "G0" && colors.G0 !== undefined) {
        data = straightPathData(lines, gcodeSize, scale);
        color = colors.G0;
    }
    else if(type === "G1" && colors.G1 !== undefined) {
        data = straightPathData(lines, gcodeSize, scale);
        color = colors.G1;
    }
    else if((type === "G2" || type === "G3") && colors.G2G3 !== undefined) {
        data = curvedPathData(lines, gcodeSize, scale);
        color = colors.G2G3;
    }

    if(data === "") {
        return "";
    }
    return '<path style="fill:none;stroke:' + color +
        ';stroke-width:' + lineThickness + 'px;"' +
        ' d="' + data + '" />';
}

/**
 * Generates an SVG file representing the path made by the G-Code commands.
 *
 * If gcodeCommands is an empty string or if width or height is equal to 0, the
 * function returns an empty string.  If the G-Code command creates a job with
 * no 2D size (size on X or Y axis), it returns an SVG with nothing in it.
 *
 * @param {string} gcodeCommands - The G-Code commands.
 * @param {Colors} colors - The colors for displaying the path according to the
 *   command.
 * @param {string} title - The SVG title.
 * @param {number} width - The SVG width (in pixels).
 * @param {number} height - The SVG height (in pixels).
 * @param {number} [lineThickness=2] - The SVG line thickness (in pixels).
 * @return {string} An empty string if there is an error, else the SVG.
 */
function createSVG(gcodeCommands, colors, title, width, height, lineThickness) {
    width = Math.abs(width);
    height = Math.abs(height);
    lineThickness = (lineThickness !== undefined) ? Math.abs(lineThickness) : 2;

    if(gcodeCommands === "" || width === 0 || height === 0) {
        return "";
    }

    var gcode = gcodetogeometry.parse(gcodeCommands);
    var gcodeWidth = gcode.size.max.x - gcode.size.min.x;
    var gcodeHeight = gcode.size.max.y - gcode.size.min.y;
    if(gcodeWidth === 0 && gcodeHeight === 0) {
        return header(title, width, height) + footer();
    }

    var scale = calculateScale(gcodeWidth, gcodeHeight, width, height);
    var currentType = gcode.lines[0].type;
    var svgPaths = [];
    var lines = [];
    var line;
    var i;

    for(i = 0; i < gcode.lines.length; i++) {
        line = gcode.lines[i];
        if(currentType !== line.type) {
            svgPaths.push(
                path(lines, colors, lineThickness, gcode.size, scale, currentType)
            );
            lines = [];
            currentType = line.type;
        }
        lines.push(line);
    }
    if(lines.length > 0) {
        svgPaths.push(
            path(lines, colors, lineThickness, gcode.size, scale, currentType)
        );
    }

    return header(title, width, height) + svgPaths.join("\n\n") + footer();
}

exports.createSVG = createSVG;
