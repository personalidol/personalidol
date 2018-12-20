// @flow

import type { Expressible } from "../interfaces/Expressible";
import type { Expression } from "../interfaces/Expression";

export default class DialogueMessage implements Expressible<any> {
  expression(): ?Expression<any> {
    return null;
  }
}
