#!/bin/bash
# This is a Bash script for automating the process of version bumping, building, packaging, and uploading assets to a
# specific release for a JavaScript/Node.js project using lerna and npm.
# it must be run from the root of the gen3-frontend-framework repository
# it also requires a github token with write access to release tags, This token mus tbe stored
# in a file named .token

# Exit immediately if a command exits with a non-zero status
set -e

# Read the GitHub token from the .token file
if [ -f .token ]; then
  token=$(cat .token)
  echo "GitHub token loaded from .token file."
else
  echo ".token file not found. Please create a .token file with your GitHub token."
  exit 1
fi

# Function to get the release ID from GitHub API
get_release_id() {
  local repo=$1
  local tag=$2
  local release_id=$(curl -s -H "Authorization: token $token" \
    "https://api.github.com/repos/$repo/releases/tags/$tag" | jq -r '.id')
  echo $release_id
}

upload_asset() {
  local file_path=$1
  local file_name=$(basename $file_path)
  local repo=$2
  local release_id=$3
  local upload_url="https://uploads.github.com/repos/$repo/releases/$release_id/assets?name=$file_name"

  echo "Uploading $file_name to release ID $release_id..."
  curl -s --data-binary @"$file_path" -H "Authorization: token $token" \
    -H "Content-Type: application/octet-stream" $upload_url
}

# Get the release ID for the specified tag
repo="uc-cdis/gen3-frontend-framework"
tag="v0.10.0-alpha"
release_id=$(get_release_id $repo $tag)
if [ "$release_id" == "null" ]; then
  echo "Release tag $tag not found in repository $repo."
  exit 1
else
  echo "Release ID for tag $tag: $release_id"
fi

# Run lerna version bump and capture the new version number
echo "Running lerna version bump..."
lerna version patch

npm run build:clean

# Get the version from the packages/core/package.json file
new_version=$(jq -r '.version' packages/core/package.json)
echo "Version from packages/core/package.json: $new_version"

# Define an array of packages to pack
packages=(
  "packages/core"
  "packages/frontend"
  "packages/tools"
)

# Loop through the packages and run npm pack
for package in "${packages[@]}"
do
  echo "Packing $package..."
  cd $package
  npm pack
  tarball=$(npm pack)
  cd - > /dev/null
  # Upload the tarball to the release assets
  upload_asset "$package/$tarball" $repo $release_id
done

printf "\n"
echo "Version bump, packing, and upload completed successfully."
