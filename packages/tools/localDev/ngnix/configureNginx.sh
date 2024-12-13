#!/usr/bin/env bash

# Default locations for SSL certificates
DEFAULT_CERT_DIR="$HOME/ssl_certs"
DEFAULT_NGINX_CONF="/opt/homebrew/etc/nginx/nginx.conf"
TEMPLATE_FILE="revproxy_nginx.conf.template"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if nginx is running
check_nginx_status() {
    if ps aux | grep "nginx" | grep -v grep >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Create SSL certificate directory if it doesn't exist
setup_ssl_directory() {
    local cert_dir=$1
    if [ ! -d "$cert_dir" ]; then
        print_message "$YELLOW" "Creating SSL certificate directory: $cert_dir"
        mkdir -p "$cert_dir"
        if [ $? -eq 0 ]; then
            print_message "$GREEN" "SSL directory created successfully"
        else
            print_message "$RED" "Failed to create SSL directory"
            exit 1
        fi
    fi
}

# Validate SSL certificates
validate_ssl_files() {
    local cert_path=$1
    local key_path=$2

    if [ ! -f "$cert_path" ]; then
        print_message "$RED" "Certificate file not found: $cert_path"
        return 1
    fi

    if [ ! -f "$key_path" ]; then
        print_message "$RED" "Key file not found: $key_path"
        return 1
    fi

    # Basic OpenSSL validation
    openssl x509 -in "$cert_path" -noout -text >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_message "$RED" "Invalid certificate file: $cert_path"
        return 1
    fi

    openssl rsa -in "$key_path" -check >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_message "$RED" "Invalid key file: $key_path"
        return 1
    fi

    return 0
}

# Generate nginx configuration
generate_nginx_config() {
    local domain=$1
    local cert_path=$2
    local key_path=$3
    local output_file=$4

    print_message "$YELLOW" "Generating NGINX configuration..."

    # Create a temporary file with certificates path replaced
    local temp_template="/tmp/nginx_temp_template.conf"
    sed "s|<absolute path to>/cert.pem|${cert_path}|g; s|<absolute path to>>/key.pem|${key_path}|g" \
        "$TEMPLATE_FILE" > "$temp_template"

    # Generate final configuration with domain substitution
    GEN3_REMOTE_API=$domain envsubst "\$GEN3_REMOTE_API" < "$temp_template" > "$output_file"

    rm "$temp_template"

    if [ $? -eq 0 ]; then
        print_message "$GREEN" "Configuration generated successfully at $output_file"
        return 0
    else
        print_message "$RED" "Failed to generate configuration"
        return 1
    fi
}

# Manage nginx process
manage_nginx() {
    if check_nginx_status; then
        print_message "$YELLOW" "Reloading NGINX configuration..."
        nginx -s reload
        if [ $? -eq 0 ]; then
            print_message "$GREEN" "NGINX configuration reloaded successfully"
        else
            print_message "$RED" "Failed to reload NGINX configuration"
            exit 1
        fi
    else
        print_message "$YELLOW" "Starting NGINX..."
        nginx
        if [ $? -eq 0 ]; then
            print_message "$GREEN" "NGINX started successfully"
        else
            print_message "$RED" "Failed to start NGINX"
            exit 1
        fi
    fi
}

# Display usage information
usage() {
    echo "Usage: $0 [-d domain] [-c cert_path] [-k key_path] [-o output_conf]"
    echo "Options:"
    echo "  -d domain        Domain name of the commons (required)"
    echo "  -c cert_path     Path to SSL certificate (default: $DEFAULT_CERT_DIR/cert.pem)"
    echo "  -k key_path      Path to SSL key (default: $DEFAULT_CERT_DIR/key.pem)"
    echo "  -o output_conf   Output configuration file (default: $DEFAULT_NGINX_CONF)"
    echo "  -h              Display this help message"
    exit 1
}

# Main script
main() {
    local domain=""
    local cert_path="$DEFAULT_CERT_DIR/cert.pem"
    local key_path="$DEFAULT_CERT_DIR/key.pem"
    local output_conf="$DEFAULT_NGINX_CONF"

    # Parse command line arguments
    while getopts "d:c:k:o:h" opt; do
        case $opt in
            d) domain="$OPTARG" ;;
            c) cert_path="$OPTARG" ;;
            k) key_path="$OPTARG" ;;
            o) output_conf="$OPTARG" ;;
            h) usage ;;
            \?) usage ;;
        esac
    done

    # Check required parameters
    if [ -z "$domain" ]; then
        print_message "$RED" "Error: Domain name is required"
        usage
    fi

    # Setup SSL directory and validate certificates
    setup_ssl_directory "$(dirname "$cert_path")"

    if ! validate_ssl_files "$cert_path" "$key_path"; then
        print_message "$RED" "SSL certificate validation failed"
        exit 1
    fi

    # Generate and test configuration
    if ! generate_nginx_config "$domain" "$cert_path" "$key_path" "$output_conf"; then
        exit 1
    fi

    # Test nginx configuration
    print_message "$YELLOW" "Testing NGINX configuration..."
    nginx -t
    if [ $? -ne 0 ]; then
        print_message "$RED" "NGINX configuration test failed"
        exit 1
    fi

    # Manage nginx process
    manage_nginx
}

# Execute main function
main "$@"
