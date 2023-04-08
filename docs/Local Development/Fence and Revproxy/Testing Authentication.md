## Local Development with Gen3 frontend framework

### Fence

Clone fence from `git@github.com:uc-cdis/fence.git`
You need python 3.9 or higher to run fence. You can use pyenv to install python 3.9.
```
pyenv install 3.9.0
pyenv local 3.9.0
```
or you can use conda to install python 3.9.
```
conda create -n fence python=3.9
conda activate fence
```
whatever you use, make sure you are in the virtual environment with python 3.9.

Install fence dependencies
you need to install poetry first.
```
pip install poetry
```
or
```
conda install -c conda-forge poetry
```
then install fence dependencies
```
```
poetry install
```

Basic fence setup

Running fence:
```
python run.py

Note if you see the following error:
```
CB_ISSUER_CHECK = _lib.X509_V_FLAG_CB_ISSUER_CHECK
AttributeError: module "lib" has no attribute "X509_V_FLAG_CB_ISSUER_CHECK"
```
you need to update `openssl` with `pip install pyopenssl --upgrade`

### postgres

Install postgresql
```
brew install postgresql
```

start it as a service
```
brew services start postgresql
```

create a user
```
createuser test
```
Allow the user to create databases
```
psql postgres
psql (14.7 (Homebrew), server 11.19)
Type "help" for help.

postgres=# ALTER USER test CREATEDB;
ALTER ROLE
postgres=# CREATE USER postgres SUPERUSER;
CREATE ROLE
postgres=# exit
```


### Install local postgres for fence database

```
# Create test database(s).
# This one is for automated tests, which clear the database after running;
# `tests/test_settings.py` should have `fence_test_tmp` in the `DB` variable.
psql -U test postgres -c 'create database fence_test_tmp'
userdatamodel-init --db fence_test_tmp
# This one is for manual testing/general local usage; Your config
# should have `fence_test` in the `DB` variable.
psql -U test postgres -c 'create database fence_test'
userdatamodel-init --db fence_test --username test --password test
```

### Install keys
in the fence source directory, if there is not a `keys` directory, create one.
```
mkdir -p keys/jwt-keys
cd keys/jwt-keys

# Generate the private key.
openssl genpkey -algorithm RSA -out jwt_private_key.pem -pkeyopt rsa_keygen_bits:2048

# Generate the public key.
openssl rsa -pubout -in jwt_private_key.pem -out jwt_public_key.pem

# Depending on the `openssl` distribution, you may find these work instead:
#
#     openssl rsa -out private_key.pem 2048
#     openssl rsa -in private_key.pem -pubout -out public_key.pem
```
at this point you should have a `jwt_private_key.pem` and a `jwt_public_key.pem` in the `keys/jwt-keys` directory.

### Configure
copy the `fence-config.yaml` from `configs/fence` to `~/.gen3/fence`. Edit the `fence-config.yaml` and add
a google client id and secret. This allows you to login with private google credentials

### run fence
From the fence source directory, run
```
python run.py
```

If everything is setup correctly, fence will start and you will see something like this
```
INFO  [werkzeug]  * Running on http://127.0.0.1:8000/ (Press CTRL+C to quit)
INFO  [werkzeug]  * Restarting with stat
[2023-04-06 12:34:31,819][gen3config.config][   INFO] Opening default configuration...
[2023-04-06 12:34:31,896][gen3config.config][   INFO] Applying configuration: /Users/craigbarnes/.gen3/fence/fence-config.yaml
[2023-04-06 12:34:31,929][gen3config.config][WARNING] Did not provide key(s) dict_keys(['DEV_LOGIN_COOKIE_NAME', 'ENABLE_PROMETHEUS_METRICS', 'WTF_CSRF_SECRET_KEY', 'ENABLE_DB_MIGRATION', 'DB_MIGRATION_POSTGRES_LOCK_KEY', 'CLIENT_ALLOWED_SCOPES', 'USER_ALLOWED_SCOPES', 'SESSION_ALLOWED_SCOPES', 'LOGIN_OPTIONS', 'DEFAULT_LOGIN_IDP', 'LOGIN_REDIRECT_WHITELIST', 'SESSION_COOKIE_DOMAIN', 'TOKEN_PROJECTS_CUTOFF', 'RENEW_ACCESS_TOKEN_BEFORE_EXPIRATION', 'GEN3_PASSPORT_EXPIRES_IN', 'GA4GH_DRS_POSTED_PASSPORT_FIELD', 'PRIVACY_POLICY_URL', 'OVERRIDE_NGINX_RATE_LIMIT', 'DBGAP_ACCESSION_WITH_CONSENT_REGEX', 'GOOGLE_BULK_UPDATES', 'ALLOWED_DATA_UPLOAD_BUCKETS', 'AZ_BLOB_CREDENTIALS', 'AZ_BLOB_CONTAINER_URL', 'ARBORIST', 'AUDIT_SERVICE', 'ENABLE_AUDIT_LOGS', 'PUSH_AUDIT_LOGS_CONFIG', 'GOOGLE_SERVICE_ACCOUNT_PREFIX', 'BILLING_PROJECT_FOR_SIGNED_URLS', 'BILLING_PROJECT_FOR_SA_CREDS', 'ENABLE_AUTOMATIC_BILLING_PERMISSION_SIGNED_URLS', 'ENABLE_AUTOMATIC_BILLING_PERMISSION_SA_CREDS', 'ALLOW_GOOGLE_LINKING', 'PROBLEM_USER_EMAIL_NOTIFICATION', 'ALLOWED_USER_SERVICE_ACCOUNT_DOMAINS', 'DREAM_CHALLENGE_TEAM', 'DREAM_CHALLENGE_GROUP', 'SYNAPSE_URI', 'SYNAPSE_JWKS_URI', 'SYNAPSE_DISCOVERY_URL', 'SYNAPSE_AUTHZ_TTL', 'MAX_ROLE_SESSION_INCREASE', 'ASSUME_ROLE_CACHE_SECONDS', 'REGISTER_USERS_ON', 'REGISTERED_USERS_GROUP', 'SERVICE_ACCOUNT_LIMIT', 'GA4GH_PASSPORTS_TO_DRS_ENABLED', 'RAS_REFRESH_EXPIRATION', 'GA4GH_VISA_ISSUER_ALLOWLIST', 'GA4GH_VISA_V1_CLAIM_REQUIRED_FIELDS', 'EXPIRED_AUTHZ_REMOVAL_JOB_FREQ_IN_SECONDS', 'GLOBAL_PARSE_VISAS_ON_LOGIN', 'USERSYNC', 'RAS_USERINFO_ENDPOINT']) in /Users/craigbarnes/.gen3/fence/fence-config.yaml. Will be set to default value(s) from /Users/craigbarnes/Projects/CTDS/gen3/fence/fence/config-default.yaml.
[2023-04-06 12:34:31,970][fence.config][   INFO] Environment variable 'DB' empty or not set: using 'DB' field from config file
WARNING:flask_cors.core:Unknown option passed to Flask-CORS: headers
WARNING:flask_cors.core:Unknown option passed to Flask-CORS: headers
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
[2023-04-06 12:34:32,436][fence.alembic][   INFO] Locking database to ensure only 1 migration runs at a time
[2023-04-06 12:34:32,442][fence.alembic][   INFO] Releasing database lock
WARNI [werkzeug]  * Debugger is active!
INFO  [werkzeug]  * Debugger PIN: 798-321-330
```

### Gen3 frontend framework

To run the gen3 frontend framework to talk to the fence service requires a few steps. One is to run the reverse proxy.
The other is to setup the gen3 frontend framework. Both of these can be done
using a docker container. The docker container is built from the `docker-compose file` in the root of the soure.

Assuming you have docker installed, you can run the following commands to build the docker container and run it.
```
docker-compose build
```
This will build the docker container. Once the container is built, you can run it with
```
docker-compose up
```
This will start the container and run the reverse proxy and the gen3 frontend framework. You can access the gen3 frontend framework at `http://localhost/landing`
