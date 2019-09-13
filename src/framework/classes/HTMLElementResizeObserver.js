// @flow

import debounce from "lodash/debounce";
import ResizeObserver from "resize-observer-polyfill";

import ElementSize from "../classes/ElementSize";

import type { HTMLElementResizeObserver as HTMLElementResizeObserverInterface } from "../interfaces/HTMLElementResizeObserver";
import type { Resizeable } from "../interfaces/Resizeable";

export default class HTMLElementResizeObserver implements HTMLElementResizeObserverInterface {
  +notifiable: Set<Resizeable<"px">>;
  +element: HTMLElement;
  +nativeResizeObserver: ResizeObserver;

  constructor(element: HTMLElement) {
    const notifiable = new Set<Resizeable<"px">>();

    this.element = element;
    this.notifiable = notifiable;
    this.nativeResizeObserver = new ResizeObserver(
      debounce(function(mutationList) {
        let mutation;

        for (mutation of mutationList) {
          const contentRect = mutation.contentRect;
          const elementSize = new ElementSize<"px">(contentRect.width, contentRect.height);
          let callback;

          for (callback of notifiable.values()) {
            callback.resize(elementSize);
          }
        }
      }, 300)
    );
  }

  disconnect(): void {
    this.nativeResizeObserver.disconnect();
  }

  notify(resizeable: Resizeable<"px">): void {
    this.notifiable.add(resizeable);
  }

  observe(): void {
    this.nativeResizeObserver.observe(this.element);
  }
}
