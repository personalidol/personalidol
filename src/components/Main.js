// @flow

import * as React from "react";
import classnames from "classnames";

import CancelToken from "../framework/classes/CancelToken";
import DialogueLoader from "./DialogueLoader";
import HudAside from "./HudAside";
import HudDebuggerListing from "./HudDebuggerListing";
import HudModalRouter from "./HudModalRouter";
import HudScene from "./HudScene";
import HudSettings from "./HudSettings";
import HudToolbar from "./HudToolbar";
import Person from "../framework/classes/Entity/Person";
import Preloader from "./Preloader";

import type { ClockReactiveController } from "../framework/interfaces/ClockReactiveController";
import type { Debugger } from "../framework/interfaces/Debugger";
import type { ExceptionHandler } from "../framework/interfaces/ExceptionHandler";
import type { ExpressionBus } from "../framework/interfaces/ExpressionBus";
import type { ExpressionContext } from "../framework/interfaces/ExpressionContext";
import type { LoadingManager } from "../framework/interfaces/LoadingManager";
import type { LoggerBreadcrumbs } from "../framework/interfaces/LoggerBreadcrumbs";
import type { QueryBus } from "../framework/interfaces/QueryBus";

type Props = {|
  clockReactiveController: ClockReactiveController,
  debug: Debugger,
  exceptionHandler: ExceptionHandler,
  expressionBus: ExpressionBus,
  expressionContext: ExpressionContext,
  loadingManager: LoadingManager,
  loggerBreadcrumbs: LoggerBreadcrumbs,
  queryBus: QueryBus,
|};

export default function Main(props: Props) {
  const [dialogueInitiator] = React.useState(new Person("Laelaps"));
  const [dialogueResourceReference] = React.useState("/data/dialogues/hermit-intro.yml");
  const [isDocumentHidden, setIsDocumentHidden] = React.useState<boolean>(document.hidden);
  const [isPreloaded, setIsPreloaded] = React.useState<boolean>(Preloader.isLoaded());

  const hasDialogue = false;

  React.useEffect(
    function() {
      const intervalId = setInterval(function() {
        setIsDocumentHidden(document.hidden);
      }, 100);

      return function() {
        clearInterval(intervalId);
      };
    },
    [isDocumentHidden]
  );

  React.useEffect(
    function() {
      if (isDocumentHidden) {
        return;
      }

      const breadcrumbs = props.loggerBreadcrumbs.add("useEffect(isDocumentHidden)");
      const cancelToken = new CancelToken(breadcrumbs.add("CancelToken"));

      props.clockReactiveController.interval(cancelToken);

      return function() {
        cancelToken.cancel(breadcrumbs.add("cleanup"));
      };
    },
    [isDocumentHidden, props.clockReactiveController, props.loggerBreadcrumbs]
  );

  if (!isPreloaded) {
    return <Preloader onPreloaded={setIsPreloaded} />;
  }

  return (
    <div
      className={classnames("dd__container", "dd__hud", {
        "dd__hud--debugger": props.debug.isEnabled(),
        "dd__hud--dialogue": hasDialogue,
      })}
    >
      {hasDialogue && (
        <DialogueLoader
          dialogueResourceReference={dialogueResourceReference}
          dialogueInitiator={dialogueInitiator}
          exceptionHandler={props.exceptionHandler}
          expressionBus={props.expressionBus}
          expressionContext={props.expressionContext}
          loggerBreadcrumbs={props.loggerBreadcrumbs.add("DialogueLoader")}
          queryBus={props.queryBus}
        />
      )}
      <HudAside />
      <HudDebuggerListing debug={props.debug} />
      <HudModalRouter exceptionHandler={props.exceptionHandler} loggerBreadcrumbs={props.loggerBreadcrumbs.add("HudModalRouter")} queryBus={props.queryBus} />
      <HudScene
        debug={props.debug}
        exceptionHandler={props.exceptionHandler}
        isDocumentHidden={isDocumentHidden}
        loadingManager={props.loadingManager}
        loggerBreadcrumbs={props.loggerBreadcrumbs.add("HudScene")}
        queryBus={props.queryBus}
      />
      <HudSettings />
      <HudToolbar />
    </div>
  );
}
