npmpants Installation
===

1) clone, then run

    cd npmpants/
    npm install
    node server.js

2) Add this to your `~/.profile` or `~/.bashrc`:

    export COUCH_HOST="my.couchdbhost.com"

3) Also, put the correct information into `config.js`

Write a ./config.js with your github credentials. Or copy it from the server,
which is easiest. The idea is that we don't want that information to be
public.

Sample `config.js`:

    exports = {
      ghClientId: ""
    , ghSecret: ""
    , ghAuthUrl: "https://github.com/login/oauth/authorize"
    , ghTokenUrl: "https://github.com/login/oauth/access_token"
    , couchHost: process.env["COUCH_HOST"] || "localhost"
    , couchPort: 5984,
    , couchUser: "",
    , couchPass: ""
    }

Troubleshooting
===

**`Error: Cannot find module './config'`**:

Make sure you did step 3 of the install.


**`ECONNREFUSED, Connection refused`** when you first do `node server.js`:

Make sure you did step 2 of the install.


**How to fix cradle not working on .5 node b/c of require.paths**:

    NODE_PATH="path/to/cradle:${NODE_PATH}"

