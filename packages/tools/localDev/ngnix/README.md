# NGIX Config for remote commons

While you can set a remote commons in the ```.env.development file```, for example:
```bash
GEN3_COMMONS_NAME=gen3
NEXT_PUBLIC_GEN3_API=https://gen3.datacommons.io
```
You will encounter CORS errors. There are ways to resolve this but one is to run a reverse proxy.
For this we will need install ngnix and then configure it. Depending on the system there are many
ways to set it up.

Once it in installed, you will need to setup a SSL certificate or use an existing one.

make a copy of ```revproxy_nginx.conf.template``` and add the absolute path to the certificate and key in
this section:
```
        ...
        # SSL configuration
        ## Set the SSL certificate here
        ssl_certificate     <absolute path to>/cert.pem;
        ssl_certificate_key <absolute path to>>/key.pem;
        ...
```

you will to either find the default location of the ngnix configuration or pass the generated
config file on the command line.

### Use the default nginx config location

One way to find the ngnix config file is to run:
```bash
nginx -t
```
which will return something like:
```bash
nginx: the configuration file /opt/homebrew/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /opt/homebrew/etc/nginx/nginx.conf test is successful
```

set ```GEN3_REMOTE_API``` in the below command to the domain name for the common you want
to access with the Gen3.2 frontend. For this case it's *gen3.datacommons.io* and are
writing to the default nginx config file location:

NOTE: this will overwrite the current ngnix config file, make sure it backed up if you want to
restore it later.

```base
GEN3_REMOTE_API=gen3.datacommons.io envsubst "\$GEN3_REMOTE_API" < revproxy_nginx.conf.template > /opt/homebrew/etc/nginx/nginx.conf
```

to use this with ngnix test it first using:
```bash
nginx -t
```
and if it's okay you can start nginx with:
```bash
ngnix
```

### Use custom configuration file location


```base
GEN3_REMOTE_API=gen3.datacommons.io envsubst "\$GEN3_REMOTE_API" < revproxy_nginx.conf.template > my_nginx.conf
```

To confirm this configuration is valid, you will need to pass the absolute path to my_ngnix.conf:
```bash
nginx -t -c /.../gen3/gen3-frontend-framework/packages/tools/localDev/ngnix/my_nginx.conf
```

If the config is ok: run nginx using the config with:
```bash
nginx -c /.../gen3/gen3-frontend-framework/packages/tools/localDev/ngnix/my_nginx.conf
```


## Test it
Test if it is running correctly using:
```bash
curl -k  https://localhost:3010/_status
{ "message": "Feelin good!", "csrf": "6d0b82e320a1a5fab105b0c152300.0002024-05-23T16:44:36+00:00" }
```
and compare with http://gen3.data.commons/io/_status where gen3.datacommons.io is replaced with the
commons pass to ``GEN3_REMOTE_API```.