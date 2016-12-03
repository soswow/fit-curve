const fitCurve = require('../src/fit-curve');
const _ = require('lodash');
const expect = require('chai').expect;

const verifyMatch = (expectedResult, actualResult) => {
    expect(actualResult).to.have.length(expectedResult.length);
    expectedResult.forEach(function (expectedBezierCurve, i) {
        var actualBezierCurve = actualResult[i];
        _.zip(actualBezierCurve, expectedBezierCurve).forEach(function (pairs) {
            expect(pairs[0][0]).to.closeTo(pairs[1][0], 1.0e-6);
            expect(pairs[0][1]).to.closeTo(pairs[1][1], 1.0e-6);
        });
    });
};

describe("Fitten curve", () => {
    it("should match example #1", () => {
        const expectedResult = [
            [[0, 0], [20.27317402, 20.27317402], [-1.24665147, 0], [20, 0]]
        ];
        const actualResult = fitCurve([[0, 0], [10, 10], [10, 0], [20, 0]], 50);
        verifyMatch(expectedResult, actualResult);
    });

    it("should match example #2", () => {
        const expectedResult = [
            [[0, 0], [20.27317402, 20.27317402], [-1.24665147, 0], [20, 0]]
        ];
        const actualResult = fitCurve([[0, 0], [10, 10], [10, 0], [20, 0], [20, 0]], 50);
        verifyMatch(expectedResult, actualResult);
    });

    it("should match example #3", () => {
        const expectedResult = [
            [   [ 244, 92 ],
                [ 284.2727272958473, 105.42424243194908 ],
                [ 287.98676736182495, 85 ],
                [ 297, 85 ]
            ]
        ];
        const actualResult = fitCurve([
            [244,92],[247,93],[251,95],[254,96],[258,97],[261,97],[265,97],[267,97],
            [270,97],[273,97],[281,97],[284,95],[286,94],[289,92],[291,90],[292,88],
            [294,86],[295,85],[296,85],[297,85]], 10);
        verifyMatch(expectedResult, actualResult);
    });

    it("should match example #3", () => {
        const expectedResult = [
            [[0, 0], [3.333333333333333, 3.333333333333333], [5.285954792089683, 10], [10,  10]],
            [[ 10, 10], [13.333333333333334, 10 ], [7.6429773960448415, 2.3570226039551585 ], [10, 0]],
            [[10, 0], [12.3570226, -2.3570226], [16.66666667, 0], [20, 0]]
        ];
        const actualResult = fitCurve([[0, 0], [10, 10], [10, 0], [20, 0]], 1);
        verifyMatch(expectedResult, actualResult);
    });

    describe("when no arguments provided", () => {
        it("should throw a TypeError exception", () => {
            expect(() => fitCurve()).to.throw(TypeError, "First argument should be an array");
        })
    });

    describe("when one of the points doesn't conform expected format", () => {
        it("should throw an exception", () => {
            expect(() => fitCurve([[1, 1], [1]])).to.throw(Error,
                "Each point should be an array of two numbers");
        });
    });

    describe("when only one unique point provided", () => {
        it("should not throw an exception and return empty array", () => {
            const result = fitCurve([[1, 1], [1, 1]]);
            expect(result).to.eql([]);
        })
    });
});
