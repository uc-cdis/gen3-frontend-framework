import {
  RemoteSupportConfiguration,
  RemoteSupportRequest,
  RemoteSupportRequestAction,
} from './types';

export const ZENDESK_MAX_SUBJECT_LENGTH = 255;
export const ZENDESK_DOMAIN =
  process.env.NEXT_PUBLIC_GEN3_ZENDESK_API ||
  'https://<SUBDOMAIN_NAME>.zendesk.com';

export const createZendeskTicket: RemoteSupportRequestAction = async (
  { subject, fullName, email, contents }: RemoteSupportRequest,
  configuration: RemoteSupportConfiguration,
) => {
  const { zendeskSubdomainName, custom_fields } = configuration;
  try {
    let zendeskTicketCreationURL = `${ZENDESK_DOMAIN}/api/v2/requests`;
    if (zendeskSubdomainName) {
      zendeskTicketCreationURL = zendeskTicketCreationURL.replace(
        '<SUBDOMAIN_NAME>',
        zendeskSubdomainName,
      );
    } else {
      // This is the default Gen3 helpdesk subdomain
      zendeskTicketCreationURL = zendeskTicketCreationURL.replace(
        '<SUBDOMAIN_NAME>',
        'gen3support',
      );
    }
    let ticketSubject = subject;
    if (subject.length > ZENDESK_MAX_SUBJECT_LENGTH) {
      ticketSubject = `${subject.substring(
        0,
        ZENDESK_MAX_SUBJECT_LENGTH - 3,
      )}...`;
    }
    await fetch(zendeskTicketCreationURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          subject: ticketSubject,
          comment: {
            body: contents,
          },
          requester: {
            name: fullName,
            email,
          },
          custom_fields,
        },
      }),
    }).then((response) => {
      if (response.status !== 201) {
        throw new Error(
          `Request for create Zendesk ticket failed with status ${response.status}`,
        );
      }
      return response;
    });
  } catch (err) {
    throw new Error(`Request for create Zendesk ticket failed: ${err}`);
  }
};
