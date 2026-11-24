import Router from 'next/router';

// Redirects to the login page, then back to this study's details page after logging in
const handleRedirectFromDiscoveryDetailsToLoginClick = (uid: string): void => {
  void Router.push(`/Login?redirect=/Discovery/${encodeURI(uid)}`);
};

export default handleRedirectFromDiscoveryDetailsToLoginClick;
