Warnings
===
- npmpants is not yet launched. It is not 100% working.
- not all tests are correctly reported in the web UI (need to wipe DB & retest)
- does not yet support node v0.6.0
- the crawler takes a lot of trust to run.
- the autocomplete search box does not auto-update with newly published modules
- the templating system isn't all there yet. May make sense to switch to plate.
- github login & subscriptions to packages breaking is not yet written
- and other things that I have yet to transfer to this README.

What you can do to help :)
===
- if you're lost on what to help with, email <http://github.com/DTrejo>
- send programmatic pull request to all repos that do not have a scripts hash
  with a test hash and a command inside it to all module authors.
- link to handy package-related links, e.g. nipster
  (http://eirikb.github.com/nipster/), and alldocs page for node. also add a
  fork ribbon at the top (need to make a container div now)
- do some testing on windows / support it.
- prettier design/layout for the site
- pull request to npm so that npat results are sent to us. (will need to plan
  how that looks & work semi-closely with isaac on this)
- remote databases that are tested against. add some ENV property saying that we
  are testing their module? /cc dscape when this is done?
- Things with make files or node-waf default to yellow / basically anything
  using generic handler gets a yellow. Timeouts are failures, sorry!
- better reporting of failures and exact test output to the UI, so people can
  see what went wrong

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

Running all the components!
===

The **crawler**, which downloads package listings from search.npmjs.org, tests
each package if possible, and uploads the results to our own couchdb.

    ./crawler.js # add some options

The **webserver**:

    node server.js

More info on the webserver:

  - displays test results to users
  - subscribes to the just-published packages feed from search.npmjs.org
    - tells slave/server.js to test that package
    - tells to homepage to show off this recently published module
  - subscribes to the just-tested feed from our own couchDB
    - tells to homepage to show off this recently tested module

The **slave server**, which takes get requests and dispatches tests to be run:

    slave/server.js

The **slave test runner** has it's own tests, to make sure your changes don't
screw everything up:

    ./slave/test/self-test.js

Coding style
===
- comma last
- tabs
- this may change soon to be in sync with npm's coding style. This isn't decided
  yet, however.
