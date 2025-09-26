# Publish new @gen3 npm packages

To publish a new set of npm with an updated version number you can
use lerna which is configured for the project.

Create a new branch (from the `develop` branch):
```bash
git checkout -b chore/release_XX.XX.XX
```
where XX.XX.XX is the new version number. You can see the current
version number in the lerna.json files.

push it to github, as lerna will not publish if the branch is not on the origin:
```bash
git push --set-upstream origin chore/release_XX.XX.XX
```

make sure the package code is built by running:
```bash
npm run build:pkg
```

Then run
```bash
lerna publish patch
```

This will update the version number (in this case: the patch version number) publish the new version to npm,
it will also create a new tag on github. You need to have your
npm credentials set up and ready as it will prompt you for them.

you will see something like:
```bash
(node:71508) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
lerna notice cli v8.2.3
lerna info current version 0.11.42
lerna info Looking for changed packages since v0.10.82

Changes:
 - @gen3/core: 0.11.42 => 0.11.43
 - @gen3/frontend: 0.11.42 => 0.11.43
 - @gen3/samplecommons: 0.11.42 => 0.11.43 (private)
 - @gen3/storybook: 0.11.42 => 0.11.43 (private)
 - @gen3/toolsff: 0.11.42 => 0.11.43
```

Make sure you open a PR to merge the branch into `develop`. However
note that the npm packages are already published.
