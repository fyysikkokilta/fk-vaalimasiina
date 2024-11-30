#!/bin/bash
git pull
docker compose -f docker-compose.prod.yaml up --build -d
