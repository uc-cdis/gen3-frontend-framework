# Development and Testing a Commons App without publishing new  Gen3.2  NPMs

The use of npm package for development and testing results in some
overhead when developing features for a data commons application.

One way to avoid this overhead is to link the local copy of the
@gen3/core and @gen3/frontend package into the local copy of the
data commons.

While `npm link` is commonly recommended, there are some caveats.
A number of the Gen3.2 packages dependencies are not published to
NPM.  This means that the `npm link` command result in "missing package"
errors in the NextJS application.

An improvement to the `npm link` approach is to use `yalc` to
publish the local copy of the Gen3.2 packages to a local NPM registry.

The `yalc` tutorial is here:
https://github.com/wclr/yalc

In the case of Gen3.2, the `yalc` command is:

### Setting up the local copy of the Gen3.2 packages
Run `yalc publish` in both the @gen3/core and @gen3/frontend directories:
```bash
cd packages/core
yalc publish
cd ../frontend
yalc publish
```

you should add `.valc` and `yalc.lock` to the `.gitignore` file to the
data commons repository.

then in the datacommons application (e.g. cadc-datacommons):
```bash
 yalc add @gen3/frontend @gen3/core
```
This will then use the local copy of the Gen3.2 frontend and core packages
in the datacommons application, without the overhead of publishing new
Gen3.2 NPMs.

### Updating changes to core or frontend packages
```bash
cd packages/core or ../frontend
npm run build:clean
yalc publish --push
```
which will update the local copy of the Gen3.2 packages and any linked applications.

### Removing the local copy of the Gen3.2 packages

When you want to revert back to using the published npm packages. remove
the link with `yalc remove @gen3/frontend @gen3/core`

### Un-publishing the local copy of the Gen3.2 packages
You will need to un-publish the local copy of the Gen3.2 packages with
`yalc installations clean @gen3/frontend @gen3/core`
