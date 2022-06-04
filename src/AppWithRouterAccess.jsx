import "./App.css";

import { Route, useHistory } from "react-router-dom";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security, LoginCallback } from "@okta/okta-react";

import Home from "./Home";

const oktaAuth = new OktaAuth({
  issuer: "https://dev-85415482.okta.com/oauth2/default", // my config
  clientId: "0oa5a1ugbrCam7fwC5d7",                       // my config
  redirectUri: window.location.origin + "/login/callback",
});

function AppWithRouterAccess() {
  const history = useHistory();

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri || "/", window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Route path="/" component={Home} />
      <Route path="/login/callback" component={LoginCallback} />
    </Security>
  );
}

export default AppWithRouterAccess;