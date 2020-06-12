declare module "fit-curve" {
  type Point<Arr extends number[]> = Arr;
  type Vector<Arr extends number[]> = Arr;
  type Curve<Arr extends number[]> = [
    Point<Arr>,
    Point<Arr>,
    Point<Arr>,
    Point<Arr>
  ];

  function fitCurve<Arr extends number[] = [number, number]>(
    points: Point<Arr>[],
    tolerance: number
  ): Curve<Arr>[];
  export default fitCurve;

  export function fitCubic<Arr extends number[] = [number, number]>(
    points: Point<Arr>[],
    leftTangent: Vector<Arr>,
    rightTangent: Vector<Arr>,
    tolerance: number
  ): Curve<Arr>[];

  export function createTangent<
    Arr extends number[] = [number, number]
  >(pointA: Point<Arr>, pointB: Point<Arr>): Vector<Arr>;
}
