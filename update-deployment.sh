#!/bin/bash
git pull
docker compose -f docker-compose.prod.yml up --build -d
