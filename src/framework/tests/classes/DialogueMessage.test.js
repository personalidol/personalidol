// @flow

import DialogueMessage from "../../classes/DialogueMessage";
import ExpressionContext from "../../classes/ExpressionContext";

it("determines if message is an answer to something else", async () => {
  const context = new ExpressionContext();

  const m1 = new DialogueMessage(context, "foo", {
    actor: "Actor1",
    prompt: "Prompt1"
  });
  const m2 = new DialogueMessage(context, "bar", {
    actor: "Actor2",
    answer_to: "foo",
    prompt: "Prompt2"
  });
  const m3 = new DialogueMessage(context, "baz", {
    actor: "Actor2",
    prompt: "Prompt2"
  });

  expect(await m2.isAnswerTo(m1)).toBeTruthy();
  expect(await m3.isAnswerTo(m1)).toBeFalsy();
});