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
 * Converts a coordinate point to an image point. Used to scale the image and
 * avoid being upside down.
 *
 * @param {Point} point - The point.
 * @param {object} size - The G-Code path size.
 * @param {number} scale - The scaling ratio.
 * @return {Point} The converted coordinate.
 */
function pointToSVGPoint(point, size, scale) {
    // TODO: use scale
    return {
        x : point.x - size.min.x,
        y : size.max.y - point.y
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
    var i = 1;
    for(i = 1; i < lines.length - 1; i++) {
        point = pointToSVGPoint(lines[i].start, gcodeSize, scale);
        data += " L" + point.x + "," + point.y;
    }
    point = pointToSVGPoint(lines[lines.length-1].start, gcodeSize, scale);
    data += " L" + point.x + "," + point.y;
    return data;
}

/**
 * Generates the SVG path data for a path only composed by curved lines. In
 * general, this path should correspond to a G2 and G3 consecutive set of
 * commands.
 *
 * @param {[objects]} beziers - The Bézier lines composing the path.
 * @param {object} gcodeSize - The G-Code size.
 * @param {number} scale - The scaling ratio.
 * @return {string} The SVG path or an empty string if the color is undefined.
 */
function curvedPathData(beziers, gcodeSize, scale) {
    return "";
}

/**
 * Generates the SVG path. If the color is undefined, no path is generated.
 *
 * @param {[objects]} lines - The lines composing the path.
 * @param {Colors} colors - The colors for displaying the path according to the
 * command.
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
    lineThickness = (lineThickness !== undefined) ? Math.abs(lineThickness) : 2;

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
