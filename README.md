Warnings
===
- npmpants is not yet launched. It is not 100% working.
- does not yet support node v0.6.0
- the crawler takes a lot of trust to run.
- the autocomplete search box does not auto-update with newly published modules
- and other things that I have yet to transfer to this README.

npmpants Installation
===

1) clone, then run

    git clone git@github.com:DTrejo/npmpants.git
    cd npmpants/
    npm install
    node server.js

    # crawler setup
    pushd crawler ; npm install ; popd

    # slave setup
    pushd slave ; npm install ; popd

2) Also, put the correct information into `config.js`

Write a ./config.js with your github credentials. Or copy it from the server,
which is easiest. The idea is that we don't want that information to be
public. If you're doing work on the open source project, contact <http://github.com/dtrejo> for this information :)

Sample `config.js` can be seen in `./config.js.example`.

Troubleshooting
===

**`Error: Cannot find module './config'`**:

Make sure you did step 2 of the install.


**`ECONNREFUSED, Connection refused`** when you first do `node server.js`:

Make sure you did step 2 of the install.


**How to fix cradle not working on .5 node b/c of require.paths**:

    NODE_PATH="path/to/cradle:${NODE_PATH}"

Coding style
===
- comma last
- tabs
- this may change soon to be in sync with npm's coding style. This isn't decided
  yet, however.
