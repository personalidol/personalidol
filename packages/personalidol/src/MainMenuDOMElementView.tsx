import { h } from "preact";

import { DOMElementView } from "@personalidol/dom-renderer/src/DOMElementView";
import { must } from "@personalidol/framework/src/must";
import { ReplaceableStyleSheet } from "@personalidol/dom-renderer/src/ReplaceableStyleSheet";

import type { TickTimerState } from "@personalidol/framework/src/TickTimerState.type";

const _css = `
  :host {
    all: initial;
  }

  *, * * {
    box-sizing: border-box;
  }

  .main-menu,
  .main-menu:before {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .main-menu {
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    display: grid;
    font-size: 1.6rem;
    justify-content: center;
    height: 100%;
    pointer-events: auto;
  }

  .main-menu__content {
    align-items: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    overflow-y: auto;
    padding: 1.6rem;
    position: relative;
  }

  h1,
  h2,
  nav {
    position: relative;
  }

  h1,
  h2 {
    line-height: 1;
    margin: 0;
    text-align: center;
  }

  h1 {
    font-family: "Almendra", sans-serif;
    font-size: 3.2rem;
    font-weight: normal;
    font-variant: small-caps;
    margin: 0;
  }

  h2,
  nav button {
    font-family: "Mukta", sans-serif;
  }

  h2 {
    font-size: 1.4rem;
    font-variant: small-caps;
    font-weight: 500;
    letter-spacing: 0.05  ch;
    text-transform: lowercase;
    word-spacing: 0.6ch;
  }

  nav {
    align-self: flex-start;
    display: grid;
    padding-top: 3.2rem;
    width: 100%;
  }

  button {
    background-color: transparent;
    border: 1px solid transparent;
    font-family: "Mukta", sans-serif;
    font-size: 1.4rem;
    font-variant: small-caps;
    font-weight: 300;
    text-align: center;
    text-transform: lowercase;
    width: 100%;
  }

  button:disabled {
    color: rgba(255, 255, 255, 0.4);
  }

  button:enabled {
    color: white;
  }

  button:enabled:hover {
    border-color: white;
  }

  button:focus {
    outline: none;
  }
`;

export class MainMenuDOMElementView extends DOMElementView {
  constructor() {
    super();

    this.onButtonNewGameClick = this.onButtonNewGameClick.bind(this);

    this.nameable.name = "MainMenuDOMElementView";
    this.styleSheet = ReplaceableStyleSheet(this.shadow, _css);
  }

  beforeRender(delta: number, elapsedTime: number, tickTimerState: TickTimerState) {
    if (this.propsLastUpdate < this.viewLastUpdate) {
      return;
    }

    this.needsRender = true;
    this.viewLastUpdate = tickTimerState.currentTick;
  }

  onButtonNewGameClick(evt: MouseEvent) {
    evt.preventDefault();

    must(this.uiMessagePort).postMessage({
      navigateToMap: "map-gates",
    });
  }

  render() {
    return (
      <div class="main-menu">
        <div class="main-menu__content">
          <h1>Personal Idol</h1>
          <h2>You shall not be judged</h2>
          <nav>
            <button disabled>Continue</button>
            <button onClick={this.onButtonNewGameClick}>
              New Game
            </button>
            <button disabled>Load Game</button>
            <button disabled>Options</button>
            <button disabled>Credits</button>
          </nav>
        </div>
      </div>
    );
  }
}