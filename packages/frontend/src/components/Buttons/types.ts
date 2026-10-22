export interface ActionButtonConfig {
  label?: string; // label for the action button
  icon?: string;
  requiresLogin?: boolean; // set to true if the action requires login
  enableRedirectToLogin?: boolean; // show the redirect to login option which will take users to the Login page and redirect back to the original page when logged in
  tooltip?: string; // tooltip text
  disabled?: boolean;
}
