# TODOs and Notes


### HEAL's requestor flow:


##### first request:
https://preprod.healdata.org/requestor/request/user?&resource_id=HDP00258&status=DRAFT
response:
```json
[]
```
##### second request:
https://preprod.healdata.org/requestor/request

POST payload:

```json
{
  "username": "craigrbarnes@uchicago.edu",
  "resource_id": "HDP00258",
  "resource_paths": [
    "/study/9898044",
    "/mds_gateway",
    "/cedar"
  ],
  "role_ids": [
    "study_registrant",
    "mds_user",
    "cedar_user"
  ]
}
```

response:

```json
{
  "updated_time": "2025-05-23T17:04:25.950892",
  "resource_display_name": null,
  "resource_id": "HDP00258",
  "created_time": "2025-05-23T17:04:25.950885",
  "username": "craigrbarnes@uchicago.edu",
  "policy_id": "study.9898044_mds_gateway_cedar_study_registrant_mds_user_cedar_user",
  "status": "DRAFT",
  "request_id": "6e280c31-61aa-4234-a418-2a45810293f3",
  "revoke": false
}
```

##### zendesk request:
https://heal-support.zendesk.com/api/v2/requests
POST payload:

```json
{
  "request": {
    "subject": "Data dictionary submission access request for 1U24AR076730-01 Back Pain Consortium (BACPAC) Research Program Data Integration, Algorithm Development and Operations Management Center",
    "comment": {
      "body": "Request ID: 6e280c31-61aa-4234-a418-2a45810293f3\nGrant Number: 1U24AR076730-01\nStudy Name: Back Pain Consortium (BACPAC) Research Program Data Integration, Algorithm Development and Operations Management Center\nEnvironment: https://preprod.healdata.org/\nFirst Name: Craig\nLast Name: Barnes Ignore this request\nE-mail Address: craigrbarnes@uchicago.edu\nAffiliated Institution: University of Chicago\nRole on Project: Other\nCustom Role: Testing requestor - Ignore this request"
    },
    "requester": {
      "name": "Craig Barnes Ignore this request",
      "email": "craigrbarnes@uchicago.edu"
    }
  }
}
```

response

```json
{
  "request": {
    "url": "https://heal-support.zendesk.com/api/v2/requests/1138.json",
    "id": 1138,
    "status": "new",
    "priority": "normal",
    "type": null,
    "subject": "Data dictionary submission access request for 1U24AR076730-01 Back Pain Consortium (BACPAC) Research Program Data Integration, Algorithm Development and Operations Management Center",
    "description": "Request ID: 6e280c31-61aa-4234-a418-2a45810293f3\nGrant Number: 1U24AR076730-01\nStudy Name: Back Pain Consortium (BACPAC) Research Program Data Integration, Algorithm Development and Operations Management Center\nEnvironment: https://preprod.healdata.org/\nFirst Name: Craig\nLast Name: Barnes Ignore this request\nE-mail Address: craigrbarnes@uchicago.edu\nAffiliated Institution: University of Chicago\nRole on Project: Other\nCustom Role: Testing requestor - Ignore this request",
    "organization_id": 32584230117395,
    "via": {
      "channel": "api",
      "source": {
        "from": {},
        "to": {},
        "rel": null
      }
    },
    "custom_fields": [
      {
        "id": 32585135309331,
        "value": null
      }
    ],
    "requester_id": 41512504707603,
    "collaborator_ids": [],
    "email_cc_ids": [],
    "is_public": true,
    "due_at": null,
    "can_be_solved_by_me": false,
    "created_at": "2025-05-23T17:04:27Z",
    "updated_at": "2025-05-23T17:04:27Z",
    "recipient": null,
    "followup_source_id": null,
    "assignee_id": null,
    "ticket_form_id": 32635732363155,
    "custom_status_id": 29117451747475,
    "fields": [
      {
        "id": 32585135309331,
        "value": null
      }
    ]
  }
}
```
