npmpants Readme
===

How to install:

    cd npmpants/
    npm install
    node server.js
    # done.


Troubleshooting
===

```Error: Cannot find module './config'```

Write a ./config.js with your github credentials. Or copy it from the server,
which is easiest. The idea is that we don't want that information to be public.

sample `config.js`:

```js
exports = {
  ghClientId: ""
, ghSecret: ""
, ghAuthUrl: "https://github.com/login/oauth/authorize"
, ghTokenUrl: "https://github.com/login/oauth/access_token"
}
```
