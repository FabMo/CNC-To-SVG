CNC to SVG
==========

Generate SVG data from CNC language commands. The SVG displays the path the bit
will take if the code is executed.

So far, **only G-Code is considered**. OpenSBP will be implemented later.

This app uses the [Gcode-To-Geometry
application](https://github.com/ShopBotTools/G-Code-To-Geometry). The supported
G-Code commands and behaviour are listed there.

This app is under Apachage Licence Version 2.0, see the file ``LICENSE`` and
``NOTICE``. See the license of used library.

Usage
-----

A type ``Colors`` is defined.

```javascript
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
```

For generating SVG data, you only have to use ``createSVG`` function.

```javascript
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
function createSVG(gcodeCommands, colors, title, width, height, lineThickness)
```

You can save the SVG data in a file (``path.svg`` for example). Example usage
can be found in ``tests.js`` file.
