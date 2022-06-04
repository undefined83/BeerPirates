import { useOktaAuth } from "@okta/okta-react";
import { useState } from "react";

function Home() {
  const { oktaAuth, authState } = useOktaAuth();

  const [image, setImage] = useState();
  const [display, setDisplay] = useState();

  const acceptImage = (e) => {
    setImage(e.target.files[0]);
  };

  const login = async () => oktaAuth.signInWithRedirect();
  const logout = async () => oktaAuth.signOut("/");

  const createBadge = async () => {
    var data = new FormData();
    data.append("file", image);

    // Ideally the Azure Function should call the `/userprofile` endpoint to get  
    // the user name instead of relying on the client to send it since the client
    // could manipulate the data
    data.append("firstLetter", authState.idToken.claims.name[0]);

    const resp = await fetch("api/CreateBadge", {
      method: "POST",
      headers: {
        "okta-authorization": "Bearer " + authState.accessToken.accessToken,
      },
      body: data,
    });

    const blob = await resp.blob();
    setDisplay(URL.createObjectURL(blob));
  };

  return (
    <div className="App">
      <main role="main" className="inner cover container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light ">
          <ul className="nav navbar-nav ml-auto navbar-right ms-auto">
            <li>
              {authState?.isAuthenticated && (
                <button className="btn btn-outline-secondary my-2 my-sm-0" onClick={logout}>
                  Logout
                </button>
              )}

              {!authState?.isAuthenticated && (
                <button className="btn btn-outline-secondary" onClick={login}>
                  Login
                </button>
              )}
            </li>
          </ul>
        </nav>

        <h1 className="cover-heading">Create your Intergalactic Mining Federation badge</h1>

        {!authState?.isAuthenticated && (
          <div>
            <p className="lead">In order to use this application you must be logged into your Okta account</p>
            <p className="lead">
              <button className="btn btn-primary" onClick={login}>
                Login
              </button>
            </p>
          </div>
        )}
        {authState?.isAuthenticated && (
          <div>
            <p className="lead">To Create your badge, upload your image below</p>
            <input onChange={acceptImage} name="image" type="file" />
            <button className="btn btn-primary" onClick={createBadge}>
              Upload
            </button>
            <br />
            {display && <img className="pt-4" alt="your IMF badge" src={display}></img>}
          </div>
        )}

        <footer
          className="bg-light text-center fixed-bottom"
          style={{
            width: "100%",
            padding: "0 15px",
          }}
        >
          <p>
            A Small demo using <a href="https://developer.okta.com/">Okta</a> to Secure an{" "}
            <a href="https://azure.microsoft.com/en-us/services/app-service/static/">Azure Static Web App </a> with a serverless{" "}
            <a href="https://azure.microsoft.com/en-us/services/functions/">Function</a>
          </p>
          <p>
            By <a href="https://github.com/nickolasfisher">Nik Fisher</a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default Home;