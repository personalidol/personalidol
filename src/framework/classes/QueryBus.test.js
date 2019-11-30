// @flow

import CancelToken from "./CancelToken";
import ForcedTick from "./ForcedTick";
import LoggerBreadcrumbs from "./LoggerBreadcrumbs";
import QueryBus from "./QueryBus";

import type { CancelToken as CancelTokenInterface } from "../interfaces/CancelToken";
import type { Query } from "../interfaces/Query";

type Total = {
  executed: number,
};

class Foo implements Query<number> {
  +id: number;
  +reference: number;
  +total: Total;

  constructor(total: Total, reference: number, id: number) {
    this.id = id;
    this.reference = reference;
    this.total = total;
  }

  async execute(cancelToken: CancelTokenInterface): Promise<number> {
    this.total.executed += 1;

    return this.reference;
  }

  isEqual(other: Foo) {
    return this.reference === other.reference;
  }
}

test("executes similar queries only once", async function() {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const queryBus = new QueryBus(loggerBreadcrumbs);
  const total: Total = {
    executed: 0,
  };

  const promises = Promise.all([
    queryBus.enqueue(cancelToken, new Foo(total, 1, 1)),
    queryBus.enqueue(cancelToken, new Foo(total, 1, 2)),
    queryBus.enqueue(cancelToken, new Foo(total, 2, 3)),
    queryBus.enqueue(cancelToken, new Foo(total, 3, 4)),
    queryBus.enqueue(cancelToken, new Foo(total, 4, 5)),
    queryBus.enqueue(cancelToken, new Foo(total, 4, 6)),
    queryBus.enqueue(cancelToken, new Foo(total, 4, 7)),
  ]);

  await queryBus.tick(new ForcedTick(false));

  const results = await promises;

  expect(total.executed).toBe(4);
  expect(results).toEqual([1, 1, 2, 3, 4, 4, 4]);
}, 300);
