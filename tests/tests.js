/*jslint todo: true, browser: true, continue: true, white: true*/
var cnctosvg = require("../cnctosvg.js");
var fs = require("fs");

// Generates an SVG from an NC file containing the G-Code.
// title is the file name without the extension ".nc"
function testFile(title, colors, width, height) {
    fs.readFile(title + ".nc", 'utf8', function (err, code) {
        if (err) {
            return console.log(err);
        }
        var svg = cnctosvg.createSVG(code, colors, title, width, height);
        fs.writeFile(title + ".svg", svg, "utf8", function(err) {
            if(err) {
                console.log("Cannot write " + title + ".svg file.");
            } else {
                console.log(title + ".svg is created.");
            }
        });
    });
}

// Settings parameters
var colors = { G1 : '#000000', G2G3 : "#000000" };
var width = 250;
var height = 200;

testFile("illerminaty", colors, width, height);
testFile("sbp-logo", colors, width, height);
testFile("line", colors, width, height);
