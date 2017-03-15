CNC to SVG
==========

Generate SVG data from CNC language commands. The SVG displays the path the bit
will take if the code is executed.

So far, **only G-Code is considered**. OpenSBP will be implemented later.

This node module uses the [Gcode-To-Geometry
application](https://github.com/ShopBotTools/G-Code-To-Geometry). The supported
G-Code commands and behaviour are listed there.

This module is under Apachage Licence Version 2.0, see the file ``LICENSE`` and
``NOTICE``. See the license of used library.

To install the module, go in your project and do.

    npm install cnctosvg

Usage
-----

You can check the module version number through ``VERSION``.

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

You can save the SVG data in a file (``path.svg`` for example).

Example
-------

Example usage can be found in ``tests.js`` file. This file generate SVG data
from a G-Code sample. To see the result.

    node tests.js

If you want to save the result in an SVG file.

    node tests.js > result.svg

## License

For this module.

```
   Copyright 2017 Alex Canales

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

For the dependencies, check out there repositories.
