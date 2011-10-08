var fs = require('fs')
  , _ = require('underscore')
  , semver = require('semver')
  , sugar = require('sugar')

//
// take a package.json, returns the object containing information about the
// latest release, as decided by semver versioning priority.
// in summary, when given an object like the following
// { '0.2': {/* 0.2 data in here */}
//   '0.1': {/* 0.1 data in here */}
// }
//
// the value of the '0.2' key will be returned.
//
;function latestRelease(pack) {
  if (!pack || !pack.versions) return

  var versions = Object.keys(pack.versions)
    , latestVersion = versions.sort(semver.rcompare).pop()
  return pack.versions[latestVersion]
}


;function getPackages() {
  return JSON.parse(fs.readFileSync('../emailscripts/real.json', 'utf8')).rows;
}

var fcount = {
  // name of framework: number found
}
var fnames = {
  // framework: [ array of package names that use that framework ]
}

var packages = getPackages()

packages.forEach(function(doc, i) {
  // if (i > 10) return
  var p = doc.doc

  if (!p.name) return
  var latest = latestRelease(p);
  if (!latest) return
  // console.log(p.name)

  if (p.name && latest.scripts && latest.scripts.test) {
    var frame =
      latest.scripts.test
        .split(' ')[0]
    frame =
      frame.substring(frame.lastIndexOf('/') + 1, frame.length);

    if (!frame) return

    fnames[frame] = fnames[frame] || []
    fnames[frame].push(p.name);

    fcount[frame] = fcount[frame] || 0
    fcount[frame]++;
  }
})

var popular = 
  _.sortBy(_.zip(_.keys(fcount), _.values(fcount)), function(a) {
    return -a[1]
  });

popular.forEach(function(t) {
  console.log('='.repeat(t[1]), '('+t[1]+')', t[0]);
})

for (var n in fnames) {
  console.log(n, '[', fnames[n].join(', '), ']');
}
