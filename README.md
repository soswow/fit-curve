JavaScript implementation of Philip J. Schneider's "Algorithm for Automatically Fitting Digitized Curves" from the book "Graphics Gems".
Converted from Python implementation.

Fit one or more cubic Bezier curves to a polyline.

This is a JS implementation of Philip J. Schneider's C code. The original C code is available on http://graphicsgems.org/ as well as in https://github.com/erich666/GraphicsGems

## Install

```
npm install --save fit-curve
```

```
bower install --save fit-curve
```

## Usage

```javascript
var fitCurve = require('fit-curve');
var points = [[0, 0], [10, 10], [10, 0], [20, 0]];
var error = 50; // The smaller the number - the much closer spline should be

var bezierCurves = fitCurve(points, error);
// bezierCurves[0] === [[0, 0], [20.27317402, 20.27317402], [-1.24665147, 0], [20, 0]]
// where each element is [x, y] and elements are [first-point, control-point-1, control-point-2, second-point]
```

You can play around with that in this [demo](http://soswow.github.io/fit-curve/demo).

![demo](https://github.com/soswow/fit-curves/raw/master/demo-screenshot.png "Demo")

## Changelog

### 0.1.6

- Bug fix #13. Use compiled (ES2015) version as main entry point.

## Development

`npm install` - builds transpiled and minified versions into `/lib`

`npm test` - runs tests
