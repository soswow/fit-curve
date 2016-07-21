// ==ClosureCompiler==
// @output_file_name fit-curve.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/**
 *  @preserve  JavaScript implementation of
 *  Algorithm for Automatically Fitting Digitized Curves
 *  by Philip J. Schneider
 *  "Graphics Gems", Academic Press, 1990
 *  
 *  The MIT License (MIT)
 *
 *  https://github.com/soswow/fit-curves
 */

//UMD pattern from
//https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, 
        // only CommonJS-like environments that support module.exports, like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.fitCurve = factory();
    }

//'this' can be:
//	- window or self ("global scope", browser or web worker - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
//	- module.exports (Node.js module - http://stackoverflow.com/questions/22770299/meaning-of-this-in-node-js-modules-and-functions)
})(this, function () {


    /*
        Insert fit-curve.core.js here.
            * Transpile first if necessary, for examle here:
              https://babeljs.io/repl/ (Presets: es2015, es2015-loose, stage-2)
        
        Then minify with Google's Closure Compiler (settings included at the top of this file):
        https://closure-compiler.appspot.com/home
    */

    
    return fitCurve;
});
