import type LoggerBreadcrumbs from "src/framework/interfaces/LoggerBreadcrumbs";

export default interface ExceptionHandler {
  /**
   * Should return 'true' when exception is processed successfully.
   */
  captureException<T extends Error>(loggerBreadcrumbs: LoggerBreadcrumbs, error: T): Promise<boolean>;
}