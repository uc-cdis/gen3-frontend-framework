import type { Meta, StoryObj } from '@storybook/nextjs';

import CompactDictionaryPanel from './CompactDictionaryPanel';
import { SchemaNode } from '@/lib/ragContext';

const nodes : SchemaNode[] = [
  {
    "id": "auditEvent",
    "title": "Audit Event",
    "description": "Harmonized identity and compliance audit records from API audit trails such as CloudTrail, GCP Audit Log, Azure Activity Log, and S3 access logs.",
    "category": "data_observations",
    "properties": {
      "timestamp": {
        "type": "string",
        "description": "The UTC RFC3339 time the event occurred."
      },
      "userId": {
        "type": "string",
        "description": "The identity of the user or system account that performed the action."
      },
      "srcIp": {
        "type": "string",
        "description": "The IP address from which the action was performed."
      },
      "httpUserAgent": {
        "type": "string",
        "description": "The user agent string of the caller."
      },
      "actionName": {
        "type": "string",
        "description": "The API call or operation performed (e.g. PutObject, AssumeRole, CreateInstance)."
      },
      "resource": {
        "type": "string",
        "description": "The resource or ARN the action was performed against."
      },
      "result": {
        "type": "string",
        "description": "The outcome of the API call or operation.",
        "enum": [
          "success",
          "failure",
          "denied",
          "error",
          "unknown"
        ]
      },
      "isReadOnly": {
        "type": "boolean",
        "description": "Whether the action was a read-only operation."
      },
      "cloudRegion": {
        "type": "string",
        "description": "The cloud region or zone where this event occurred."
      },
      "eventType": {
        "type": "string",
        "description": "The category of audit event.",
        "enum": [
          "api_call",
          "console_signin",
          "service_event",
          "other"
        ]
      },
      "requestParameters": {
        "type": "string",
        "description": "Serialised parameters of the API call or operation."
      },
      "responseElements": {
        "type": "string",
        "description": "Key elements returned in the response to the API call."
      },
      "cloudAccountId": {
        "type": "string",
        "description": "The cloud account or subscription where this event was observed."
      },
      "eventSource": {
        "type": "string",
        "description": "The audit log source that generated this event.",
        "enum": [
          "aws_cloudtrail",
          "s3_audit",
          "gcp_audit_log",
          "azure_activity_log",
          "other"
        ]
      }
    },
    "required": ["userId"],
    "links": [
      {
        "name": "subjects",
        "target_type": "subject",
        "multiplicity": "many_to_one"
      }
    ]
  },
  {
    "id": "program",
    "title": "Program",
    "description": "A top-level organizational unit for the SOC, representing a security mission, business unit, or operational scope.",
    "category": "administrative",
    "properties": {
      "name": {
        "type": "string",
        "description": "Full name/title of the program."
      }
    },
    "required": [],
    "links": []
  },
  {
    "id": "project",
    "title": "Project",
    "description": "A monitored environment, cloud account, subscription, or on-prem enclave within the SOC.",
    "category": "administrative",
    "properties": {
      "code": {
        "type": "string",
        "description": "Unique identifier for the project."
      },
      "name": {
        "type": "string",
        "description": "Display name/brief description for the project."
      },
      "cloudAccountId": {
        "type": "string",
        "description": "The cloud account or subscription identifier (AWS account ID, GCP project ID, Azure subscription ID, or on-prem site ID)."
      },
      "cloudProvider": {
        "type": "string",
        "description": "The infrastructure provider for this project.",
        "enum": [
          "aws",
          "gcp",
          "azure",
          "on_prem",
          "hybrid"
        ]
      }
    },
    "required": [],
    "links": [
      {
        "name": "programs",
        "target_type": "program",
        "multiplicity": "many_to_one"
      }
    ]
  },
  {
    "id": "securityEvent",
    "title": "Security Event",
    "description": "Harmonized threat detection events from security services such as WAF, GuardDuty, GCP SCC, and Azure Sentinel.",
    "category": "data_observations",
    "properties": {
      "timestamp": {
        "type": "string",
        "description": "The UTC RFC3339 time the event occurred."
      },
      "action": {
        "type": "string",
        "description": "The terminating action applied to the request.",
        "enum": [
          "allow",
          "block",
          "CAPTCHA",
          "challenge",
          "count",
          "other"
        ]
      },
      "severity": {
        "type": "string",
        "description": "The severity rating of the detection or finding.",
        "enum": [
          "informational",
          "low",
          "medium",
          "high",
          "critical"
        ]
      },
      "findingType": {
        "type": "string",
        "description": "The detection or finding type as reported by the source (e.g. Recon:EC2/PortProbeUnprotectedPort)."
      },
      "srcIp": {
        "type": "string",
        "description": "The IP address of the client sending the request."
      },
      "userId": {
        "type": "string",
        "description": "The identity of the user or system account."
      },
      "httpRequest": {
        "type": "string",
        "description": "The URI or resource path requested."
      },
      "httpVerb": {
        "type": "string",
        "description": "The HTTP method in the request."
      },
      "httpStatusCode": {
        "type": "integer",
        "description": "The response code sent to the client."
      },
      "httpUserAgent": {
        "type": "string",
        "description": "The user agent string."
      },
      "userCountryName": {
        "type": "string",
        "description": "The geographic origin of the request."
      },
      "resourceId": {
        "type": "string",
        "description": "The cloud-agnostic identifier of the affected resource."
      },
      "ruleId": {
        "type": "string",
        "description": "The identifier of the rule or detection that triggered this event."
      },
      "cloudAccountId": {
        "type": "string",
        "description": "The cloud account or subscription where this event was observed."
      },
      "eventSource": {
        "type": "string",
        "description": "The threat detection source that generated this event.",
        "enum": [
          "aws_waf",
          "aws_guardduty",
          "gcp_scc",
          "azure_sentinel",
          "other"
        ]
      }
    },
    "required": [],
    "links": [
      {
        "name": "subjects",
        "target_type": "subject",
        "multiplicity": "many_to_one"
      }
    ]
  },
]


const meta = {
  component: CompactDictionaryPanel,
} satisfies Meta<typeof CompactDictionaryPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodes,
    loading: false,
    error: "",
  },
};
