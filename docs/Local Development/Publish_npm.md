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

Make sure you open a PR to merge the branch into `develop`. However
note that the npm packages are already published.
