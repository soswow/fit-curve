""" CoffeeScript implementation of
    Algorithm for Automatically Fitting Digitized Curves
    by Philip J. Schneider
    "Graphics Gems", Academic Press, 1990
"""
math = require('mathjs')
lodash = require('lodash')
bezier = require('./bazier')

zeros = math.zeros
multiply = math.multiply
subtract = math.subtract
add = math.add
chain = math.chain
dot = math.dot

last = lodash.last
zip = lodash.zip

# Fit one (ore more) Bezier curves to a set of points
fitCurve = (points, maxError) ->
    leftTangent = normalize(subtract(points[1], points[0]))
    rightTangent = normalize(subtract(points[points.length - 2], last(points)))
    fitCubic(points, leftTangent, rightTangent, maxError)


fitCubic = (points, leftTangent, rightTangent, error) ->
    # Use heuristic if region only has two points in it
    if points.length is 2
        dist = math.norm(subtract(points[0], points[1])) / 3.0
        bezCurve = [
            points[0],
            add(points[0], multiply(leftTangent, dist)),
            add(points[1], multiply(rightTangent, dist)),
            points[1]
        ]
        return [bezCurve]

    # Parameterize points, and attempt to fit curve
    u = chordLengthParameterize(points)
    bezCurve = generateBezier(points, u, leftTangent, rightTangent)
    # Find max deviation of points to fitted curve
    [maxError, splitPoint] = computeMaxError(points, bezCurve, u)
    if maxError < error
        return [bezCurve]

    # If error not too large, try some reparameterization and iteration
    if maxError < error**2
        for i in [0...20]
            uPrime = reparameterize(bezCurve, points, u)
            bezCurve = generateBezier(points, uPrime, leftTangent, rightTangent)
            [maxError, splitPoint] = computeMaxError(points, bezCurve, uPrime)
            if maxError < error
                return [bezCurve]
            u = uPrime

    # Fitting failed -- split at max error point and fit recursively
    beziers = []
    centerTangent = normalize subtract points[splitPoint - 1], points[splitPoint + 1]
    beziers = beziers.concat fitCubic points[...splitPoint + 1], leftTangent, centerTangent, error
    beziers = beziers.concat fitCubic points[splitPoint...], multiply(centerTangent, -1), rightTangent, error

    return beziers


generateBezier = (points, parameters, leftTangent, rightTangent) ->
    bezCurve = [points[0], null, null, last(points)]

    # compute the A's
    A = zeros(parameters.length, 2, 2).valueOf()

    for u, i in parameters
        A[i][0] = multiply(leftTangent, 3 * (1 - u)**2 * u)
        A[i][1] = multiply(rightTangent, 3 * (1 - u) * u**2)

    # Create the C and X matrices
    C = zeros(2, 2).valueOf()
    X = zeros(2).valueOf()

    for [point, u], i  in zip(points, parameters)
        C[0][0] += dot(A[i][0], A[i][0])
        C[0][1] += dot(A[i][0], A[i][1])
        C[1][0] += dot(A[i][0], A[i][1])
        C[1][1] += dot(A[i][1], A[i][1])

        tmp = subtract(point, bezier.q([points[0], points[0], last(points), last(points)], u))

        X[0] += dot(A[i][0], tmp)
        X[1] += dot(A[i][1], tmp)

    # Compute the determinants of C and X
    det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1]
    det_C0_X = C[0][0] * X[1] - C[1][0] * X[0]
    det_X_C1 = X[0] * C[1][1] - X[1] * C[0][1]

    # Finally, derive alpha values
    alpha_l = if det_C0_C1 is 0 then 0 else det_X_C1 / det_C0_C1
    alpha_r = if det_C0_C1 is 0 then 0 else det_C0_X / det_C0_C1

    # If alpha negative, use the Wu/Barsky heuristic (see text) */
    # (if alpha is 0, you get coincident control points that lead to
    # divide by zero in any subsequent NewtonRaphsonRootFind() call. */
    segLength = math.norm(subtract(points[0], last(points)))
    epsilon = 1.0e-6 * segLength
    if alpha_l < epsilon or alpha_r < epsilon
        # fall back on standard (probably inaccurate) formula, and subdivide further if needed.
        bezCurve[1] = add(bezCurve[0], multiply(leftTangent, segLength / 3.0))
        bezCurve[2] = add(bezCurve[3], multiply(rightTangent, segLength / 3.0))
    else
        # First and last control points of the Bezier curve are
        # positioned exactly at the first and last data points
        # Control points 1 and 2 are positioned an alpha distance out
        # on the tangent vectors, left and right, respectively
        bezCurve[1] = add(bezCurve[0], multiply(leftTangent, alpha_l))
        bezCurve[2] = add(bezCurve[3], multiply(rightTangent, alpha_r))

    return bezCurve


reparameterize = (bezier, points, parameters) ->
    (newtonRaphsonRootFind(bezier, point, u) for [point, u] in zip(points, parameters))


newtonRaphsonRootFind = (bez, point, u) ->
    """
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
    """
    d = subtract(bezier.q(bez, u), point)
    qprime = bezier.qprime(bez, u)
    numerator = math.sum(multiply(d, qprime))
    denominator = math.sum(add(math.dotPow(qprime, 2), multiply(d, bezier.qprimeprime(bez, u))))

    if denominator is 0
        u
    else
        u - numerator / denominator


chordLengthParameterize = (points) ->
    u = [0]
    for i in [1...points.length]
        u.push(u[i - 1] + math.norm(subtract(points[i], points[i - 1])))

    for i in [0...u.length]
        u[i] = u[i] / last(u)

    return u


computeMaxError = (points, bez, parameters) ->
    maxDist = 0
    splitPoint = points.length / 2
    for [point, u], i in zip(points, parameters)
        dist = math.norm(subtract(bezier.q(bez, u), point))**2
        if dist > maxDist
            maxDist = dist
            splitPoint = i

    [maxDist, splitPoint]

normalize = (v) -> math.divide(v, math.norm(v))

module.exports = fitCurve
