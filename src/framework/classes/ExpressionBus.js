// @flow

import type { QueryBus } from "../interfaces/QueryBus";

/**
 * Expression can be both query, command or an entire script to be executed.
 * Thus expressions themselves cannot be put on query bus, but instead query
 * bus can be used to execute queries produced by expressions.
 */
export default class ExpressionBus {
  queryBus: QueryBus;

  constructor(queryBus: QueryBus) {
    this.queryBus = queryBus;
  }
}
