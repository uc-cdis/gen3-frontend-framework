# Get the CA certificate location
CAROOT=$(mkcert -CAROOT)
echo $CAROOT

# Create a Kubernetes secret with the CA
kubectl create secret generic mkcert-ca --from-file=ca.crt="$CAROOT/rootCA.pem"
