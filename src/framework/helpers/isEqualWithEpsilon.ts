import inRange from "lodash/inRange";

export default function isEqualWithEpsilon(n1: number, n2: number, epsilon: number): boolean {
  if (n1 === n2) {
    return true;
  }

  return (n1 >= n2 - epsilon && n1 <= n2 + epsilon) || (n2 >= n1 - epsilon && n2 <= n1 + epsilon);
}
