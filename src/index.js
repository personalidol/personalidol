// @flow

import "core-js/es6/map";
import "core-js/es6/set";
import "core-js/es6/promise";
import "core-js/es6/object";

import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom";

import Main from "./components/Main";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  release: process.env.REACT_APP_RELEASE
});

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.render(<Main />, rootElement);
}
