fitCurves
=========

CoffeeScript/JavaScript implementation of Philip J. Schneider's "Algorithm for Automatically Fitting Digitized Curves" from the book "Graphics Gems".
Converted from Python implementation. 

Fit one or more cubic Bezier curves to a polyline.

This is a CS/JS implementation of Philip J. Schneider's C code. The original C code is available on http://graphicsgems.org/ as well as in https://github.com/erich666/GraphicsGems

This implementation uses [mathjs](https://github.com/josdejong/mathjs)

Usage:

```javascript
var fitCurve = require('fitCurve');
var points = [[0, 0], [10, 10], [10, 0], [20, 0]];
var error = 50;

var bezierCurves = fitCurve(points, error);
// bezierCurves[0] === [[0, 0], [20.27317402, 20.27317402], [-1.24665147, 0], [20, 0]]
```
