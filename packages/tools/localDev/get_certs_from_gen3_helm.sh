#!/usr/bin/env bash

KUBECTL="kubectl"
OUTPUT=${1:-"$(pwd)/certificates"}

for secret in $(${KUBECTL} get secrets --field-selector type=kubernetes.io/tls --all-namespaces -o=custom-columns='NAMESPACE:metadata.namespace','NAME:metadata.name' | tail +2 | grep gen3-certs | sed -E 's/[[:space:]]+/\//g'); do
        NAMESPACE=$(echo ${secret} | cut -d"/" -f1)
        NAME=$(echo ${secret} | cut -d"/" -f2)
        echo -n "${NAMESPACE}: ${NAME}>"

        if [ -n "$(${KUBECTL} get secret -n ${NAMESPACE} ${NAME} -o json | jq -r '.data."tls.crt"' | base64 -d)" ]; then

                DOMAIN=$(${KUBECTL} get secret -n ${NAMESPACE} ${NAME} -o json | jq -r '.data."tls.crt"' | base64 -d | openssl x509 -noout -text | grep "Subject: CN = " | sed -E 's/[[:space:]]+Subject: CN = ([^ ]*)/\1/g')
                echo -n " ${DOMAIN}"

                mkdir -p "${OUTPUT}/${DOMAIN}"

                ${KUBECTL} get secret -n ${NAMESPACE} ${NAME} -o json | jq -r '.data."tls.key"' | base64 -d > "${OUTPUT}/${DOMAIN}/privkey.pem"
                ${KUBECTL} get secret -n ${NAMESPACE} ${NAME} -o json | jq -r '.data."tls.crt"' | base64 -d > "${OUTPUT}/${DOMAIN}/fullchain.pem"

                echo " DONE"
        else
                echo " FAILED"
        fi
done
