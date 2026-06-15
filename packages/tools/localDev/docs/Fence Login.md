# Set up fence to login with a user account with credientials scope

login into the fence pod.

```bash
fence-create client-create \
  --client nextjs-local \
  --urls http://localhost:3000/api/auth/callback \
  --scopes openid user credentials \
  --username <your-username>
```

or to update an existing client:

```bash
fence-create client-modify \
  --client nextjs-local \
  --allowed-scopes openid user data credentials
```

note the client key and secret.

in `.env.development.local`

```bash
FENCE_CLIENT_ID=<client-key> 
FENCE_CLIENT_SECRET=<client-secret> 
FENCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

add 'credentials' to the scopes in the fence pod configuration:

```
USER_ALLOWED_SCOPES:
...
...
credentials
```
