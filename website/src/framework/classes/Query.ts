import type CancelToken from "src/framework/interfaces/CancelToken";
import type { default as IQuery } from "src/framework/interfaces/Query";

export default abstract class Query<T> implements IQuery<T> {
  abstract execute(cancelToken: CancelToken): Promise<T>;

  abstract isEqual(other: IQuery<T>): boolean;

  getQueryType(): string {
    return this.constructor.name;
  }
}