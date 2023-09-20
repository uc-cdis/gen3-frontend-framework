# getSchema

getSchema is a function that returns a JSON schema for a given resource path.

To use it make sure your using the correct version of node, currently >= 18.15.0.

node --version

Then run the following command:
```
    node packages/tools/src/dictionary/doc/getSchema.js --url <resource path> --out <output file>
```
where -url is a URL to a commons submission service (e.g. https://commons.ucsc-cgp-dev.org/api/v0/submission)
and -out is the output file to write the schema to.

If --url is not specified, the default is http://localhost:5000/v0/submission/ unless the
environment variable ```GEN3_SUBMISSION_URL``` is set.
