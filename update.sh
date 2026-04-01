#!/bin/bash
set -e

echo "Pulling latest changes..."
git pull

echo "Rebuilding and restarting containers..."
sudo docker compose down
sudo docker compose up --build -d

echo "Done! Pet Shop is running at http://$(hostname -I | awk '{print $1}'):8080"
