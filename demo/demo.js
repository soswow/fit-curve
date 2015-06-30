var paper;
var rawLines = [];
var rawLinesData = [];
var fittedCurves = [];
var fittedCurvesData = [];
var error = 50;

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

    }

    var container = document.getElementsByTagName('svg').item(0);
    var errorInput = document.getElementById('errorInput');
    error = parseInt(errorInput.value);
    var errorValue = document.getElementById('errorValue');

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
    errorInput.addEventListener('input', function(){
        error = parseInt(this.value);
        errorValue.innerText = error;
        updateLines(true);
    });


    document.getElementById('clear-button').addEventListener('click', function () {
        rawLinesData = [];
        rawLines.concat(fittedCurves).forEach(function (rawLine) {
            rawLine.remove();
        });
        rawLines = [];
        fittedCurvesData = [];
        fittedCurves = [];
    });
};


