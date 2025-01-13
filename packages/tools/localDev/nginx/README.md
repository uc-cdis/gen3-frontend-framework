# Install NGINX
```bash
brew install nginx
```


# NGINX Config for remote commons

While you can set a remote commons in the ```.env.development file```, for example:
```bash
GEN3_COMMONS_NAME=gen3
NEXT_PUBLIC_GEN3_API=https://gen3.datacommons.io
```
You will encounter CORS errors. There are ways to resolve this, but one is to run a reverse proxy.
For this, we will need to install ngnix and then configure it. Depending on the system, there are many
ways to set it up.

Once it is installed, you will need to set up a SSL certificate or use an existing one.
> You can use https://github.com/jsha/minica to set up a SSL certificate
> Make sure to generate as RSA key pair using 
> minica -domains localhost -ca-alg rsa
> and make sure add minica.pem to your trusted certificates
> on mac this is done by double clicking on it in file browser, in keychain select it and goto get info under trusted select trust

## Shell Script Setup

Place your certificates in $HOME/ssl_certs as ```cert.pem``` and ```key.pem```.
Now you can run a shell script to update the config and reload nginx:

```bash
./configureNginx.sh -d <domain name of commons>
```

NOTE: do *NOT* add http:// or https:// to the passed domain name, it just need to be the name of the commong.
For example:
Do NOT:
```bash
./configureNginx.sh -d https://gen3.datacommons.io
```
Instead:
```bash
./configureNginx.sh -d gen3.datacommons.io
```

This script will update and test the configuration. If no issues are found it will
start or restart nginx. You can also specify the path the to cert and key using  ```-c cert_path -k key_path```.
```./configureNginx.sh -h``` will display help and all of the options.

## Manual setup

make a copy of ```revproxy_nginx.conf.template``` name it ```revproxy_nginx.conf``` and add the absolute path to the certificate and key in
this section:
```
        ...
        # SSL configuration
        ## Set the SSL certificate here
        ssl_certificate     <absolute path to>/cert.pem;
        ssl_certificate_key <absolute path to>>/key.pem;
        ...
```

you will either find the default location of the ngnix configuration or pass the generated
config file on the command line.

## 1. Use default location

One way to find the ngnix config file is to run:
```bash
nginx -t
```
which will return something like:
```bash
nginx: the configuration file /opt/homebrew/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /opt/homebrew/etc/nginx/nginx.conf test is successful
```

NOTE: This file will be overwrite in the next step; make sure it is backed up if you want to restore it later.

Set ```GEN3_REMOTE_API``` in the below command to the domain name for the common you want
to access with the Gen3.2 frontend. For this case, it's *gen3.datacommons.io* and are
writing to the default nginx config file location:

NOTE: This will overwrite the current ngnix config file; make sure it is backed up if you want to
restore it later.

```base
GEN3_REMOTE_API=gen3.datacommons.io envsubst "\$GEN3_REMOTE_API" < revproxy_nginx.conf > /opt/homebrew/etc/nginx/nginx.conf
```

to use this with ngnix test it first using the following:
```bash
nginx -t
```
and if it's okay, you can start nginx with:
```bash
nginx
```

## 2. pass the generated config
Note there is a bash script to do most of the steps below, See [Shell Script](#shell-script)

```base
GEN3_REMOTE_API=gen3.datacommons.io envsubst "\$GEN3_REMOTE_API" < revproxy_nginx.conf > my_nginx.conf
```

To confirm this configuration is valid, you must pass the absolute path to my_ngnix.conf:
```bash
nginx -t -c /.../gen3/gen3-frontend-framework/packages/tools/localDev/ngnix/my_nginx.conf
```

If the config is error free, run nginx using the config with:
```bash
nginx -c /.../gen3/gen3-frontend-framework/packages/tools/localDev/ngnix/my_nginx.conf
```

## Other commands:
stop nginx:
```bash
nginx -s stop
```
reload nginx config (if you made changes for example):
```bash
nginx -s reload
```


## Test it
Test if it is running correctly using:
```bash
curl -k  https://localhost:3010/_status 
```
Should get a response like
```bash
{ "message": "Feelin good!", "csrf": "6d0b82e320a1a5fab105b0c152300.0002024-05-23T16:44:36+00:00" }
```
and compare with https://gen3.datacommons.io/_status where gen3.datacommons.io is replaced with the
commons pass to ``GEN3_REMOTE_API```.
