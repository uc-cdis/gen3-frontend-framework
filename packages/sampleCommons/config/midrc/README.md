### Explorer config file for midrc

This is the config file for the midrc explorer. YOu can test is
by changing
```bash
GEN3_COMMONS_NAME=gen3
NEXT_PUBLIC_GEN3_API=https://localhost/
NEXT_PUBLIC_GEN3_DOMAIN=https://localhost/
```
to
```bash
GEN3_COMMONS_NAME=midrc
NEXT_PUBLIC_GEN3_API=https://midrcdata.org/
NEXT_PUBLIC_GEN3_DOMAIN=https://midrcdata.org/

```

and running on a browser that has disabled CORs. Login will not work
at the momment with a remote commons, but you can see the data.
