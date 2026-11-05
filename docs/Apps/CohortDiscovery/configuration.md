# Cohort Discovery Configuration

To configure cohort discovery, there are a number of configurations for both the frontend and Gen3 services (guppy and requestor)
as well as resources and user permissions.

## Required services
* guppy
* requestor
* Gen3 frontend framework
* zenDesk

## Resource Definition (user.yaml)
CohortDiscovery allows users to create cohorts for submission via requestor. This requires defining the
resources that the user is requesting access for. For example if a user builds a cohort with several filters that
creates a cohort of 102 cases. The resources the user is requesting access to will be the studies the cohort
s cases are members of. While this will result in granting access to more cases than the user requested, setting up a
resource for each case is not possible.

## Requestor

The user must be allowed to submit requestor requests.

## Cohort Discovery Configuration

A configuration file is shown below:

```json
{
  "name": "CohortDiscovery",
  "remoteSupportService": {
    "service": "zenDesk",
    "configuration": {
      "zendeskSubdomainName": "gen3support",
      "custom_fields": [
        {
          "id": 32585806184851, // ID for Gen3 Platform
          "value": "test" // must match zendesk value
        }
      ]
    }
  },
  "emptySelection": {
    "image": "cohort_none.png",
    "imageAlt": "three circled portraits connected by lines",
    "title": "Build Your Cohort",
    "subHead": "Select the criteria on the left to include an item."
  },
  "leftNav": {
    "build": {
      "image": "/images/apps/cohort_none.png",
      "imageAlt": "",
      "title": "Build Cohorts"
    },
    "saved": {
      "image": "/images/apps/cohort_saved.png",
      "imageAlt": "",
      "title": "Saved Cohorts"
    },
    "request": {
      "image": "/images/apps/cohort_requests.png",
      "imageAlt": "",
      "title": "Request"
    }
  },
  "dataIndexes": [
    {
      "dataConfig": {
        "dataType": "metadata",
        "nodeCountTitle": "Subjects"
      },
      "tabTitle": "Studies",
      "resourcePath" : "/studies",
      "resourceField" : "gen3_discovery.study_id",
      "tabs": [
        {
          "title": "Studies",
          "fields": [
            "gen3_discovery.is_synthetic",
            "gen3_discovery.subject_cancer_type",
            "gen3_discovery.subject_primary_disease",
            "gen3_discovery.subject_metastasis",
            "gen3_discovery.subject_cancer_grade",
            "gen3_discovery.subject_gender",
            "gen3_discovery.subject_race",
            "gen3_discovery.subject_ethnicity"
          ],
          "fieldsConfig" : {
            "gen3_discovery.is_synthetic": {
              "field": "gen3_discovery.is_synthetic",
              "dataField": "gen3_discovery.is_synthetic",
              "index": "metadata",
              "label": "Synthetic"
            },
            "gen3_discovery.subject_cancer_type": {
              "field": "gen3_discovery.subject_cancer_type",
              "dataField": "gen3_discovery.subject_cancer_type",
              "index": "metadata",
              "label": "Cancer Type"
            },
            "gen3_discovery.subject_primary_disease": {
              "field": "gen3_discovery.subject_primary_disease",
              "dataField": "gen3_discovery.subject_primary_disease",
              "index": "metadata",
              "label": "Primary Disease"
            },
            "gen3_discovery.subject_metastasis": {
              "field": "gen3_discovery.subject_metastasis",
              "dataField": "gen3_discovery.subject_metastasis",
              "index": "metadata",
              "label": "Metastasis"
            },
            "gen3_discovery.subject_cancer_grade": {
              "field": "gen3_discovery.subject_cancer_grade",
              "dataField": "gen3_discovery.subject_cancer_grade",
              "index": "metadata",
              "label": "Cancer Grade"
            },
            "gen3_discovery.subject_gender": {
              "field": "gen3_discovery.subject_gender",
              "dataField": "gen3_discovery.subject_gender",
              "index": "metadata",
              "label": "Biological Sex"
            },
            "gen3_discovery.subject_race": {
              "field": "gen3_discovery.subject_race",
              "dataField": "gen3_discovery.subject_race",
              "index": "metadata",
              "label": "Race"
            },
            "gen3_discovery.subject_ethnicity": {
              "field": "gen3_discovery.subject_ethnicity",
              "dataField": "gen3_discovery.subject_ethnicity",
              "index": "metadata",
              "label": "Ethnicity"
            }
          }
        }
      ]
    }
  ]
}


```

### UI configuration
The first section allows you to configure the Title and the tab icons and tooltips. The ```dataIndexes``` array defines
the data index config for each data index (see guppy). The filters can be organized into tabs. The ```fieldsConfig``` allows
you to define the field and labels for each one. Currently, all fields are required, but this will change to allow
specifying only the fields that need to be changed.

### Requested resource confiuration
The config the resource to request requires defining the resource path as defined in the `user.yaml` file for the commons
and the field that holds the id for that resource. In the example below the resource is `studies` and the id of the resource
field is the study id which is `gen3_discovery.study_id`
```json
      "resourcePath" : "/studies",
      "resourceField" : "gen3_discovery.study_id",
```

### Request ticket service configuration
The `remoteService` configuration defines where the user's request for access is sent. Currently, we only support zendDesk
so the only field to set is `zendeskSubdomainName` which should be the zendDesk subdomain for your commons.
custom_fields passes any custom fields and their values this is currently used to define the platform

```json
  "remoteSupportService": {
    "service": "zenDesk",
    "configuration" : {
      "zendeskSubdomainName": "gen3support",
      "custom_fields": [
        {
          "id": 32585806184851, // ID for Gen3 Platform
          "value": "test" // must match zendesk value
        }
      ]
    }
  },
```

## Rounding

Eventually, CohortDiscovery will send a request to the Gen3 Analysis service to be rounded. In the interim, request are
handled by the frontend. Cohort discovery works by rounding values < GEN3_COHORT_DISCOVERY_LIMIT to GEN3_COHORT_DISCOVERY_LIMIT.
This number defaults to 100 and can be set in the common's .env.developent and .env.production files:

```bash
NEXT_PUBLIC_GEN3_COHORT_DISCOVERY_LIMIT=1000
```
This will change once the Gen3 Analysis service is available.
