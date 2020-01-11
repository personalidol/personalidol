import { ElementSize } from "./ElementSize";

export interface HTMLElementSize extends ElementSize<"px"> {
  getHTMLElement(): HTMLElement;
}
