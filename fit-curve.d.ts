declare module "fit-curve" {
  /** A point in space represented as an array of numbers, 2D by default, but can be any dimension. */
  type Point<Arr extends number[]> = Arr;
  /** A vector represented as an array of numbers, 2D by default, but can be any dimension. */
  type Vector<Arr extends number[]> = Arr;
  /** A Bezier curve represented by an array of points with elements [first-point, control-point-1, control-point-2, second-point] */
  type Curve<Arr extends number[]> = [
    Point<Arr>,
    Point<Arr>,
    Point<Arr>,
    Point<Arr>
  ];

  /**
   * Fit one or more Bezier curves to a set of points.
   *
   * @param points - Array of digitized points, e.g. [[5,5],[5,50],[110,140],[210,160],[320,110]]
   * @param maxError - Tolerance, squared error between points and fitted curve
   * @returns Array of Bezier curves, where each element is [first-point, control-point-1, control-point-2, second-point] and points are [x, y]
   */
  function fitCurve<Arr extends number[] = [number, number]>(
    points: Point<Arr>[],
    maxError: number
  ): Curve<Arr>[];
  export default fitCurve;

  /**
   * Fit a Bezier curve to a (sub)set of digitized points.
   * Typically, your code should not call this function directly. Use {@link fitCurve} instead.
   *
   * @param points - Array of digitized points, e.g. [[5,5],[5,50],[110,140],[210,160],[320,110]]
   * @param leftTangent - Unit tangent vector at start point
   * @param rightTangent - Unit tangent vector at end point
   * @param error - Tolerance, squared error between points and fitted curve
   * @returns Array of Bezier curves, where each element is [first-point, control-point-1, control-point-2, second-point] and points are [x, y]
   */
  export function fitCubic<Arr extends number[] = [number, number]>(
    points: Point<Arr>[],
    leftTangent: Vector<Arr>,
    rightTangent: Vector<Arr>,
    maxError: number
  ): Curve<Arr>[];

  /**
   * Creates a vector of length 1 which shows the direction from B to A
   */
  export function createTangent<Arr extends number[] = [number, number]>(
    pointA: Point<Arr>,
    pointB: Point<Arr>
  ): Vector<Arr>;
}
