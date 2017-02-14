/*jslint todo: true, browser: true, continue: true, white: true*/
var cnctosvg = require("./cnctosvg.js");

// Settings parameters
var colors = { G1 : '#000000', G2G3 : "#000000" };
var width = 250;
var height = 200;
var code = "(Illerminaty)\n";
code += "G1 Z-0.333 F66.6\n";
code += "G1 X2\n";
code += "G1 X1 Y1.73205\n";
code += "G1 X0 Y0\n";
code += "G1 Z1\n";
code += "G0 X0.4 Y0.57735\n";
code += "G1 Z-0.333 F66.6\n";
code += "G3 X1.6 R0.8 F91.1\n";
code += "G3 X0.4 R0.8\n";
code += "G1 Z1\n";

var svg = cnctosvg.createSVG(code, colors, "Illerminaty", 300, 300);
console.log(svg);
