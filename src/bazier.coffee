math = require('mathjs')
multiply = math.multiply
subtract = math.subtract

# evaluates cubic bezier at t, return point
q = (ctrlPoly, t) ->
    math.chain(multiply((1.0-t)**3, ctrlPoly[0]))
    .add(multiply(3*(1.0-t)**2 * t, ctrlPoly[1]))
    .add(multiply(3*(1.0-t) * t**2, ctrlPoly[2]))
    .add(multiply(t**3, ctrlPoly[3]))
    .done()

# evaluates cubic bezier first derivative at t, return point
qprime = (ctrlPoly, t) ->
    math.chain(multiply(3*(1.0-t)**2, subtract(ctrlPoly[1],ctrlPoly[0])))
        .add(multiply(6*(1.0-t) * t, subtract(ctrlPoly[2], ctrlPoly[1])))
        .add(multiply(3*t**2, subtract(ctrlPoly[3],ctrlPoly[2])))
        .done()

# evaluates cubic bezier second derivative at t, return point
qprimeprime = (ctrlPoly, t) ->
    math.chain(multiply(6*(1.0-t), add(subtract(ctrlPoly[2], 2*ctrlPoly[1]),ctrlPoly[0])))
        .add(multiply(6*(t), add(subtract(ctrlPoly[3], 2*ctrlPoly[2]),ctrlPoly[1])))
        .done()

module.exports = {
    q: q,
    qprime: qprime,
    qprimeprime: qprimeprime
}
