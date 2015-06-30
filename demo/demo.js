var paper;
var rawLines = [];
var rawLinesData = [];
var fittedCurves = [];
var fittedCurvesData = [];
var error = 50;
var showBezierDots = false;
var showBezierControlPoints = false;
var bezierDots = [];
var bezierControlPoints = [];
var bezierControlPointLines = [];

window.onload = function () {
    paper = Raphael('container', 800, 400);

    function lineDataToPathString(lineData) {
        var str = "";
        lineData.map(function (xy, i) {
            if (i == 0) {
                str += "M ";
            } else {
                str += "L ";
            }
            str += xy[0] + " " + xy[1] + " ";
        });
        return str;
    }

    function fittedCurveDataToPathString(fittedLineData) {
        var str = "";
        fittedLineData.map(function (bezier, i) {
            if (i == 0) {
                str += "M " + bezier[0][0] + " " + bezier[0][1];
            }
            str += "C " + bezier[1][0] + " " + bezier[1][1] + ", " +
                bezier[2][0] + " " + bezier[2][1] + ", " +
                bezier[3][0] + " " + bezier[3][1] + " ";
        });

        return str;
    }

    function cleanBezierHelpGraphics(){
        bezierDots
            .concat(bezierControlPoints)
            .concat(bezierControlPointLines)
            .forEach(function(el){
                el.remove();
            });
        bezierDots = [];
        bezierControlPoints = [];
        bezierControlPointLines = [];
    }

    function updateLines(updateAllCurves) {
        rawLinesData.forEach(function (lineData, i) {
            if (rawLines.length <= i) {
                var path = paper.path('');
                path.attr({
                    stroke: 'lightgray'
                });
                rawLines.push(path);
            }
            rawLines[i].attr("path", lineDataToPathString(lineData));

            var isLastItem = i === rawLinesData.length - 1;
            if (updateAllCurves || isLastItem) {
                if (fittedCurves.length <= i) {
                    path = paper.path('');
                    path.attr({
                        stroke: 'red'
                    });
                    fittedCurves.push(path);
                }
                if (lineData.length > 1) {
                    fittedCurvesData[i] = fitCurve(lineData, error);
                    //console.log(lineData.length, lineData.map(function(arr){return "["+arr.join(",")+"]";}).join(","));
                    fittedCurves[i].attr("path", fittedCurveDataToPathString(fittedCurvesData[i]));
                }
            }
        });

        cleanBezierHelpGraphics();

        fittedCurvesData.forEach(function (beziers) {
            beziers.forEach(function (bezier, i) {
                var p1 = bezier[0];
                var cp1 = bezier[1];
                var cp2 = bezier[2];
                var p2 = bezier[3];
                var getDotCircle = function (p) {
                    var circle = paper.circle(p[0], p[1], 5);
                    circle.attr({
                        fill: 'rgb(200, 50, 0)',
                        'fill-opacity': 0.5,
                        stroke: null
                    });
                    return circle;
                };

                var getControlPoint = function (p) {
                    var circle = paper.circle(p[0], p[1], 2);
                    circle.attr({
                        fill: 'rgb(100, 200, 0)',
                        'fill-opacity': 0.5,
                        stroke: null
                    });
                    return circle;
                };

                var getControlLine = function (p1, p2) {
                    var pathString = "M " + p1[0] + " " + p1[1] + " ";
                    pathString += "L " + p2[0] + " " + p2[1];
                    var line = paper.path(pathString);
                    line.attr({
                        stroke: 'rgb(100, 200, 0)',
                        'stroke-opacity': 0.5
                    });
                    return line;
                };

                if (showBezierDots) {
                    if (i == 0) {
                        bezierDots.push(getDotCircle(p1));
                    }
                    bezierDots.push(getDotCircle(p2));
                }

                if (showBezierControlPoints) {
                    bezierControlPointLines.push(getControlLine(p1, cp1));
                    bezierControlPointLines.push(getControlLine(cp2, p2));
                    bezierControlPoints.push(getControlPoint(cp1));
                    bezierControlPoints.push(getControlPoint(cp2));
                }
            });
        });
    }

    var container = document.getElementsByTagName('svg').item(0);
    var clearButton = document.getElementById('clear-button');
    var errorInput = document.getElementById('errorInput');
    var errorValue = document.getElementById('errorValue');
    var showBezierDotsCheckbox = document.getElementById('showBezierDotsCheckbox');
    var showBezierControlPointsCheckbox = document.getElementById('showBezierControlPointsCheckbox');

    error = parseInt(errorInput.value);

    var isMouseDown = false;
    container.addEventListener('mousedown', function () {
        rawLinesData.push([]);
        isMouseDown = true;
    });
    container.addEventListener('mouseup', function () {
        isMouseDown = false;
    });
    container.addEventListener('mousemove', function (event) {
        var x = event.offsetX;
        var y = event.offsetY;
        if (isMouseDown) {
            rawLinesData[rawLinesData.length - 1].push([x, y]);
            updateLines();
        }
    });

    errorInput.addEventListener('input', function () {
        error = parseInt(this.value);
        errorValue.innerText = error;
        updateLines(true);
    });

    clearButton.addEventListener('click', function () {
        rawLinesData = [];
        rawLines.concat(fittedCurves).forEach(function (rawLine) {
            rawLine.remove();
        });
        rawLines = [];
        fittedCurvesData = [];
        fittedCurves = [];

        cleanBezierHelpGraphics();
    });

    showBezierDotsCheckbox.addEventListener('click', function () {
        showBezierDots = this.checked;
        updateLines();
    });

    showBezierControlPointsCheckbox.addEventListener('click', function () {
        showBezierControlPoints = this.checked;
        updateLines();
    });
};


