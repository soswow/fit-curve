/*
    Simplified versions of what we need from math.js
    Optimized for our input, which is only numbers and 1x2 arrays (i.e. [x, y] coordinates).
*/
class maths {
    //zeros = logAndRun(math.zeros);
    static zeros_Xx2x2(x) {
        var zs = [];
        while(x--) { zs.push([0,0]); }
        return zs
    }

    //multiply = logAndRun(math.multiply);
    static mulItems(items, multiplier) {
        //return items.map(x => x*multiplier);
        return [items[0]*multiplier, items[1]*multiplier];
    }
    static mulMatrix(m1, m2) {
        //https://en.wikipedia.org/wiki/Matrix_multiplication#Matrix_product_.28two_matrices.29
        //Simplified to only handle 1-dimensional matrices (i.e. arrays) of equal length:
        //  return m1.reduce((sum,x1,i) => sum + (x1*m2[i]),
        //                   0);
        return (m1[0]*m2[0]) + (m1[1]*m2[1]);
    }

    //Only used to subract to points (or at least arrays):
    //  subtract = logAndRun(math.subtract);
    static subtract(arr1, arr2) {
        //return arr1.map((x1, i) => x1 - arr2[i]);
        return [arr1[0]-arr2[0], arr1[1]-arr2[1]];
    }

    //add = logAndRun(math.add);
    static addArrays(arr1, arr2) {
        //return arr1.map((x1, i) => x1 + arr2[i]);
        return [arr1[0]+arr2[0], arr1[1]+arr2[1]];
    }
    static addItems(items, addition) {
        //return items.map(x => x+addition);
        return [items[0]+addition, items[1]+addition];
    }

    //var sum = logAndRun(math.sum);
    static sum(items) {
        return items.reduce((sum,x) => sum + x);
    }

    //chain = math.chain;

    //Only used on two arrays. The dot product is equal to the matrix product in this case:
    //  dot = logAndRun(math.dot);
    static dot(m1, m2) {
        return maths.mulMatrix(m1, m2);
    }

    //https://en.wikipedia.org/wiki/Norm_(mathematics)#Euclidean_norm
    //  var norm = logAndRun(math.norm);
    static vectorLen(v) {
        var a = v[0], b = v[1];
        return Math.sqrt(a*a + b*b);
    }

    //math.divide = logAndRun(math.divide);
    static divItems(items, divisor) {
        //return items.map(x => x/divisor);
        return [items[0]/divisor, items[1]/divisor];
    }

    //var dotPow = logAndRun(math.dotPow);
    static squareItems(items) {
        //return items.map(x => x*x);
        var a = items[0], b = items[1];
        return [a*a, b*b];
    }

    static normalize(v) {
        return this.divItems(v, this.vectorLen(v));
    }

    //Math.pow = logAndRun(Math.pow);
}


class bezier {
    //Evaluates cubic bezier at t, return point
    static q(ctrlPoly, t) {
        var tx = 1.0 - t;
        var pA = maths.mulItems( ctrlPoly[0],      tx * tx * tx ),
            pB = maths.mulItems( ctrlPoly[1],  3 * tx * tx *  t ),
            pC = maths.mulItems( ctrlPoly[2],  3 * tx *  t *  t ),
            pD = maths.mulItems( ctrlPoly[3],       t *  t *  t );
        return maths.addArrays(maths.addArrays(pA, pB), maths.addArrays(pC, pD));
    }

    //Evaluates cubic bezier first derivative at t, return point
    static qprime(ctrlPoly, t) {
        var tx = 1.0 - t;
        var pA = maths.mulItems( maths.subtract(ctrlPoly[1], ctrlPoly[0]),  3 * tx * tx ),
            pB = maths.mulItems( maths.subtract(ctrlPoly[2], ctrlPoly[1]),  6 * tx *  t ),
            pC = maths.mulItems( maths.subtract(ctrlPoly[3], ctrlPoly[2]),  3 *  t *  t );
        return maths.addArrays(maths.addArrays(pA, pB), pC);
    }

    //Evaluates cubic bezier second derivative at t, return point
    static qprimeprime(ctrlPoly, t) {
        return maths.addArrays(maths.mulItems( maths.addArrays(maths.subtract(ctrlPoly[2], maths.mulItems(ctrlPoly[1], 2)), ctrlPoly[0]),  6 * (1.0 - t) ), 
                               maths.mulItems( maths.addArrays(maths.subtract(ctrlPoly[3], maths.mulItems(ctrlPoly[2], 2)), ctrlPoly[1]),  6 *        t  ));
    }
}


/**
 * Fit one or more Bezier curves to a set of points.
 *
 * @param {Array<Array<Number>>} points - Array of digitized points, e.g. [[5,5],[5,50],[110,140],[210,160],[320,110]]
 * @param {Number} maxError - Tolerance, squared error between points and fitted curve
 * @returns {Array<Array<Array<Number>>>} Array of Bezier curves, where each element is [first-point, control-point-1, control-point-2, second-point] and points are [x, y]
 */
function fitCurve(points, maxError) {
    var len = points.length,
        leftTangent =  maths.normalize(maths.subtract(points[1], points[0])),
        rightTangent = maths.normalize(maths.subtract(points[len - 2], points[len - 1]));
    return fitCubic(points, leftTangent, rightTangent, maxError);
}

/**
 * Fit a Bezier curve to a (sub)set of digitized points.
 * Your code should not call this function directly. Use {@link fitCurve} instead.
 *
 * @param {Array<Array<Number>>} points - Array of digitized points, e.g. [[5,5],[5,50],[110,140],[210,160],[320,110]]
 * @param {Array<Number>} leftTangent - Unit tangent vector at start point
 * @param {Array<Number>} rightTangent - Unit tangent vector at end point
 * @param {Number} error - Tolerance, squared error between points and fitted curve
 * @returns {Array<Array<Array<Number>>>} Array of Bezier curves, where each element is [first-point, control-point-1, control-point-2, second-point] and points are [x, y]
 */
function fitCubic(points, leftTangent, rightTangent, error) {
    const MaxIterations = 20;   //Max times to try iterating (to find an acceptable curve)
    
    var bezCurve,       //Control points of fitted Bezier curve
        u,              //Parameter values for point
        uPrime,         //Improved parameter values
        maxError,       //Maximum fitting error
        splitPoint,     //Point to split point set at if we need more than one curve
        centerTangent,  //Unit tangent vector at splitPoint
        beziers,        //Array of fitted Bezier curves if we need more than one curve
        dist, i;
    
    //console.log('fitCubic, ', points.length);
    
    //Use heuristic if region only has two points in it
    if (points.length === 2) {
        dist = maths.vectorLen(maths.subtract(points[0], points[1])) / 3.0;
        bezCurve = [
            points[0], 
            maths.addArrays(points[0], maths.mulItems(leftTangent,  dist)), 
            maths.addArrays(points[1], maths.mulItems(rightTangent, dist)), 
            points[1]
        ];
        return [bezCurve];
    }
    
    //Parameterize points, and attempt to fit curve
    u = chordLengthParameterize(points);
    bezCurve = generateBezier(points, u, leftTangent, rightTangent);
    
    //Find max deviation of points to fitted curve
    [maxError, splitPoint] = computeMaxError(points, bezCurve, u);
    if (maxError < error) {
        //console.log('cme ~', maxError, points[splitPoint]);
        return [bezCurve];
    }
    //If error not too large, try some reparameterization and iteration
    if (maxError < (error*error)) {
        for (i = 0; i < MaxIterations; i++) {
            uPrime = reparameterize(bezCurve, points, u);
            bezCurve = generateBezier(points, uPrime, leftTangent, rightTangent);
            [maxError, splitPoint] = computeMaxError(points, bezCurve, uPrime);
            if (maxError < error) {
                //console.log('cme '+i, maxError, points[splitPoint]);
                return [bezCurve];
            }
            u = uPrime;
        }
    }
    
    //Fitting failed -- split at max error point and fit recursively
    //console.log('splitting');
    beziers = [];
    centerTangent = maths.normalize(maths.subtract(points[splitPoint - 1], points[splitPoint + 1]));
    beziers = beziers.concat(fitCubic(points.slice(0, splitPoint + 1), leftTangent, centerTangent, error));
    beziers = beziers.concat(fitCubic(points.slice(splitPoint), maths.mulItems(centerTangent, -1), rightTangent, error));
    return beziers;
};

/**
 * Use least-squares method to find Bezier control points for region.
 *
 * @param {Array<Array<Number>>} points - Array of digitized points
 * @param {Array<Number>} parameters - Parameter values for region
 * @param {Array<Number>} leftTangent - Unit tangent vector at start point
 * @param {Array<Number>} rightTangent - Unit tangent vector at end point
 * @returns {Array<Array<Number>>} Approximated Bezier curve: [first-point, control-point-1, control-point-2, second-point] where points are [x, y]
 */
function generateBezier(points, parameters, leftTangent, rightTangent) {
    var bezCurve,                       //Bezier curve ctl pts
        A, a,                           //Precomputed rhs for eqn
        C, X,                           //Matrices C & X
        det_C0_C1, det_C0_X, det_X_C1,  //Determinants of matrices
        alpha_l, alpha_r,               //Alpha values, left and right
        
        epsilon, segLength, 
        i, len, tmp, u, ux,
        firstPoint = points[0],
        lastPoint = points[points.length-1];

    bezCurve = [firstPoint, null, null, lastPoint];
    //console.log('gb', parameters.length);
    
    //Compute the A's
    A = maths.zeros_Xx2x2(parameters.length);
    for (i = 0, len = parameters.length; i < len; i++) {
        u = parameters[i];
        ux = 1 - u;
        a = A[i];
        
        a[0] = maths.mulItems(leftTangent,  3 * u  * (ux*ux));
        a[1] = maths.mulItems(rightTangent, 3 * ux * (u*u));
    }
    
    //Create the C and X matrices
    C = [[0,0], [0,0]];
    X = [0,0];
    for (i = 0, len = points.length; i < len; i++) {
        u = parameters[i];
        a = A[i];
    
        C[0][0] += maths.dot(a[0], a[0]);
        C[0][1] += maths.dot(a[0], a[1]);
        C[1][0] += maths.dot(a[0], a[1]);
        C[1][1] += maths.dot(a[1], a[1]);
        
        tmp = maths.subtract(points[i], bezier.q([firstPoint, firstPoint, lastPoint, lastPoint], u));
        
        X[0] += maths.dot(a[0], tmp);
        X[1] += maths.dot(a[1], tmp);
    }
    
    //Compute the determinants of C and X
    det_C0_C1 = (C[0][0] * C[1][1]) - (C[1][0] * C[0][1]);
    det_C0_X  = (C[0][0] * X[1]   ) - (C[1][0] * X[0]   );
    det_X_C1  = (X[0]    * C[1][1]) - (X[1]    * C[0][1]);
    
    //Finally, derive alpha values
    alpha_l = det_C0_C1 === 0 ? 0 : det_X_C1 / det_C0_C1;
    alpha_r = det_C0_C1 === 0 ? 0 : det_C0_X / det_C0_C1;
    
    //If alpha negative, use the Wu/Barsky heuristic (see text).
    //If alpha is 0, you get coincident control points that lead to
    //divide by zero in any subsequent NewtonRaphsonRootFind() call.
    segLength = maths.vectorLen(maths.subtract(firstPoint, lastPoint));
    epsilon = 1.0e-6 * segLength;
    if (alpha_l < epsilon || alpha_r < epsilon) {
        //Fall back on standard (probably inaccurate) formula, and subdivide further if needed.
        bezCurve[1] = maths.addArrays(firstPoint, maths.mulItems(leftTangent,  segLength / 3.0));
        bezCurve[2] = maths.addArrays(lastPoint,  maths.mulItems(rightTangent, segLength / 3.0));
    } else {
        //First and last control points of the Bezier curve are
        //positioned exactly at the first and last data points
        //Control points 1 and 2 are positioned an alpha distance out
        //on the tangent vectors, left and right, respectively
        bezCurve[1] = maths.addArrays(firstPoint, maths.mulItems(leftTangent,  alpha_l));
        bezCurve[2] = maths.addArrays(lastPoint,  maths.mulItems(rightTangent, alpha_r));
    }
    
    return bezCurve;
};

/**
 * Given set of points and their parameterization, try to find a better parameterization.
 *
 * @param {Array<Array<Number>>} bezier - Current fitted curve
 * @param {Array<Array<Number>>} points - Array of digitized points
 * @param {Array<Number>} parameters - Current parameter values
 * @returns {Array<Number>} New parameter values
 */
function reparameterize(bezier, points, parameters) {
    /*
    var j, len, point, results, u;
    results = [];
    for (j = 0, len = points.length; j < len; j++) {
        point = points[j], u = parameters[j];
        
        results.push(newtonRaphsonRootFind(bezier, point, u));
    }
    return results;
    //*/
    return parameters.map((p, i) => newtonRaphsonRootFind(bezier, points[i], p));
};

/**
 * Use Newton-Raphson iteration to find better root.
 *
 * @param {Array<Array<Number>>} bez - Current fitted curve
 * @param {Array<Number>} point - Digitized point
 * @param {Number} u - Parameter value for "P"
 * @returns {Number} New u
 */
function newtonRaphsonRootFind(bez, point, u) {
    /*
        Newton's root finding algorithm calculates f(x)=0 by reiterating
        x_n+1 = x_n - f(x_n)/f'(x_n)
        We are trying to find curve parameter u for some point p that minimizes
        the distance from that point to the curve. Distance point to curve is d=q(u)-p.
        At minimum distance the point is perpendicular to the curve.
        We are solving
        f = q(u)-p * q'(u) = 0
        with
        f' = q'(u) * q'(u) + q(u)-p * q''(u)
        gives
        u_n+1 = u_n - |q(u_n)-p * q'(u_n)| / |q'(u_n)**2 + q(u_n)-p * q''(u_n)|
    */
    
    var d = maths.subtract(bezier.q(bez, u), point),
        qprime = bezier.qprime(bez, u),
        numerator = /*sum(*/maths.mulMatrix(d, qprime)/*)*/,
        denominator = maths.sum(maths.addItems( maths.squareItems(qprime), maths.mulMatrix(d, bezier.qprimeprime(bez, u)) ));

    if (denominator === 0) {
        return u;
    } else {
        return u - (numerator/denominator);
    }
};

/**
 * Assign parameter values to digitized points using relative distances between points.
 *
 * @param {Array<Array<Number>>} points - Array of digitized points
 * @returns {Array<Number>} Parameter values
 */
function chordLengthParameterize(points) {
    var u = [], currU, prevU, prevP;

    points.forEach((p, i) => {
        currU = i ? prevU + maths.vectorLen(maths.subtract(p, prevP))
                  : 0;
        u.push(currU);
        
        prevU = currU;
        prevP = p;
    })
    u = u.map(x => x/prevU);
    
    return u;
};

/**
 * Find the maximum squared distance of digitized points to fitted curve.
 *
 * @param {Array<Array<Number>>} points - Array of digitized points
 * @param {Array<Array<Number>>} bez - Fitted curve
 * @param {Array<Number>} parameters - Parameterization of points
 * @returns {Array<Number>} Maximum error (squared) and point of max error
 */
function computeMaxError(points, bez, parameters) {
    var dist,       //Current error
        maxDist,    //Maximum error
        splitPoint, //Point of maximum error
        v,          //Vector from point to curve
        i, count, point, u;
    
    maxDist = 0;
    splitPoint = points.length / 2;

    for (i = 0, count = points.length; i < count; i++) {
        point = points[i];
        u = parameters[i];
        
        //len = maths.vectorLen(maths.subtract(bezier.q(bez, u), point));
        //dist = len * len;
        v = maths.subtract(bezier.q(bez, u), point);
        dist = v[0]*v[0] + v[1]*v[1];
        
        if (dist > maxDist) {
            maxDist = dist;
            splitPoint = i;
        }
    }
    
    return [maxDist, splitPoint];
};
