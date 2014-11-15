#!/bin/bash

echo "Pulling image from DockerHub"
docker pull dockerHubRepo:latest

echo "Starting a mongo container"
docker run --restart=always -d --name db mongo:latest

echo "Creating application container"
echo "Linking to mongo container"
echo "Running application script"
docker run --restart=always -i -t -p 80:9000 --link db:dbLink dockerHubRepo:latest sh prod/src/app.sh

echo "Deployed!"
# echo "http://Cloud-service-name:80"