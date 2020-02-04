import ElementPosition from "src/framework/classes/ElementPosition";
import EventListenerSet from "src/framework/classes/EventListenerSet";
import Idempotence from "src/framework/classes/Exception/Idempotence";

import ElementPositionUnit from "src/framework/enums/ElementPositionUnit";

import HasLoggerBreadcrumbs from "src/framework/interfaces/HasLoggerBreadcrumbs";
import LoggerBreadcrumbs from "src/framework/interfaces/LoggerBreadcrumbs";
import { default as IElementPosition } from "src/framework/interfaces/ElementPosition";
import { default as IEventListenerSet } from "src/framework/interfaces/EventListenerSet";
import { default as IHTMLElementPositionObserver } from "src/framework/interfaces/HTMLElementPositionObserver";

export default class HTMLElementPositionObserver implements HasLoggerBreadcrumbs, IHTMLElementPositionObserver {
  readonly element: HTMLElement;
  readonly loggerBreadcrumbs: LoggerBreadcrumbs;
  readonly onPositionChange: IEventListenerSet<[IElementPosition<ElementPositionUnit.Px>]>;
  private _isObserving: boolean = false;
  private elementPosition: IElementPosition<ElementPositionUnit.Px> = new ElementPosition<ElementPositionUnit.Px>(ElementPositionUnit.Px, 0, 0, 0);
  private timeoutId: null | number = null;

  constructor(loggerBreadcrumbs: LoggerBreadcrumbs, element: HTMLElement) {
    this.element = element;
    this.onPositionChange = new EventListenerSet(loggerBreadcrumbs.add("EventListenerSet"));
    this.loggerBreadcrumbs = loggerBreadcrumbs;
  }

  checkElementPosition(): void {
    const boundingRect = this.getBoundingRect();
    const updatedElementPosition = new ElementPosition<ElementPositionUnit.Px>(ElementPositionUnit.Px, boundingRect.left, boundingRect.top, 0);

    if (updatedElementPosition.isEqual(this.elementPosition)) {
      return;
    }

    this.elementPosition = updatedElementPosition;
    this.onPositionChange.notify([updatedElementPosition]);
  }

  disconnect(): void {
    if (!this._isObserving) {
      throw new Idempotence(this.loggerBreadcrumbs.add("disconnect"), "HTMLElementPositionObserver is not idempotent.");
    }

    const timeoutId = this.timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    this._isObserving = false;
  }

  getBoundingRect(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  observe(): void {
    if (this._isObserving) {
      throw new Idempotence(this.loggerBreadcrumbs.add("observe"), "HTMLElementPositionObserver is not idempotent.");
    }

    const checker = () => {
      this.checkElementPosition();
      this.timeoutId = setTimeout(checker);
    };

    checker();

    this._isObserving = true;
  }
}
