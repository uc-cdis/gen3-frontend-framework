# Setup development hostname

You will need to setup a hostname other than the default ```localhost```. A few Gen3 services use 
fence's BASE_URL value and if t is localhost, any container (i.e. gen3 service) will resolve 
```localhost``` to itself. Therefore a different name should be used. If you are using google as 
a login option, it require a valid domain name. For this documentation we are using:
```gen3dev.local.io```

You will need to add this to your /etc/hosts file:

```bash
sudo vi or nano  /etc/hosts
```

add the line:
```aiignore
127.0.0.1	gen3dev.local.io
```

after saving you should be able to ping this hostname:
```bash
ping gen3dev.local/io
```