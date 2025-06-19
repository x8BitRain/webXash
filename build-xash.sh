#!/bin/bash

# Change to the webxash3d-fwgs directory and build containers
cd webxash3d-fwgs &&
docker compose -f hlsdk.docker-compose.yml up -d &&
docker compose -f cs16-client.docker-compose.yml up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Create output directories if they don't exist
[ ! -d "../public/hl/" ] && mkdir -p ../public/hl/
[ ! -d "../public/cs/" ] && mkdir -p ../public/cs/

# Get container names/IDs and verify they exist
HLSDK_CONTAINER=$(docker compose -f hlsdk.docker-compose.yml ps -q | head -n1)
CS16_CONTAINER=$(docker compose -f cs16-client.docker-compose.yml ps -q | head -n1)

# Check if containers were found
if [ -z "$HLSDK_CONTAINER" ]; then
    echo "Error: HLSDK container not found or not running"
    exit 1
fi

if [ -z "$CS16_CONTAINER" ]; then
    echo "Error: CS16 container not found or not running"
    exit 1
fi

echo "HLSDK Container ID: $HLSDK_CONTAINER"
echo "CS16 Container ID: $CS16_CONTAINER"

echo "Extracting files from HLSDK container..."
# Copy files from hlsdk container to public/hl/
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/client.wasm ../public/hl/client.wasm
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/server.wasm ../public/hl/server.wasm
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/menu ../public/hl/menu
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/index.wasm ../public/hl/index.wasm
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/filesystem_stdio ../public/hl/filesystem_stdio
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/ref_gles3compat.so ../public/hl/ref_gles3compat.so
docker cp "$HLSDK_CONTAINER":/usr/share/nginx/html/ref_soft.so ../public/hl/ref_soft.so

echo "Extracting files from CS16 container..."
# Copy files from cs16-client container to public/cs/
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/client.wasm ../public/cs/client.wasm
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/server.wasm ../public/cs/server.wasm
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/menu ../public/cs/menu
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/index.wasm ../public/cs/index.wasm
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/filesystem_stdio ../public/cs/filesystem_stdio
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/ref_gles3compat.so ../public/cs/ref_gles3compat.so
docker cp "$CS16_CONTAINER":/usr/share/nginx/html/ref_soft.so ../public/cs/ref_soft.so

echo "Files extracted successfully!"
echo "HLSDK files are in: $(pwd)/../public/hl/"
echo "CS16 files are in: $(pwd)/../public/cs/"

# Optional: Stop the containers after extraction
echo "Stopping containers..."
docker compose -f hlsdk.docker-compose.yml down
docker compose -f cs16-client.docker-compose.yml down

echo "Build and extraction complete!"
