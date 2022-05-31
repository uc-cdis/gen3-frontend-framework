import NextAuth from 'next-auth';


export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    {
      name: 'Login from Google',
      id: 'google',
      type: 'oauth',
      authorization: 'https://healdata.org/user/login/google'
    },
    {
      id: 'gen3provider',
      name: 'Gen3 Provider',
      type: 'oauth',
      wellKnown: 'https://healdata.org/user/.well-known/openid-configuration',
      clientId : '',
      clientSecret: ''
    }
  ]
});
