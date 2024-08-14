# Guild of Physics' Voting Machine

## Setup

0. Have node and npm installed
1. Clone the repository
2. Install dependencies with ```npm install```
3. Setup a Postgres database and add the environment variables to .env
4. Start the project with ```npm run dev```

## Docker

There is a separate Docker config for development and production. Both configurations start a containerized Postgres database. For both configs you should also define your environment variables in .env according to .env.example

Development docker setup can be setupped with ```docker-compose -f .\docker-compose.yml up```.

Production docker setup can be setupped with ```docker-compose -f .\docker-compose.prod.yml up```.
