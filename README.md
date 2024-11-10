# Guild of Physics' Voting Machine

## Setup

0. Have node and npm installed
1. Clone the repository
2. Install dependencies with `npm install`
3. Setup a Postgres database and add the environment variables to .env
4. Start the project with `npm run dev`

## Docker

There is a separate Docker config for development and production. Both configurations start a containerized Postgres database. For both configs you should also define your environment variables in .env according to .env.example

Development docker setup can be setupped with `docker-compose -f .\docker-compose.yml up`.

Production docker setup can be setupped with `docker-compose -f .\docker-compose.prod.yml up`.

## Voting System Overview

The voting process operates as follows:

1. **Check-in**  
   - A member attends the meeting and checks in with the secretary.
   - The member is then marked as present for the meeting.

2. **Voting Setup**  
   - When the voting session begins, a list of regular members' emails is input into the system.

3. **Distributing Voting Links**  
   - Upon starting the voting process, each regular member receives an email containing a unique voting link.

4. **Casting Votes**  
   - Members use their unique link to vote for their candidates in order of preference.
   - Once a vote is submitted, the system records the member's identity and vote, but only temporarily.
   - The system stores voting data and voter identity separately in distinct tables to ensure anonymity. After the vote is processed, there is no way to trace back who voted for whom.

5. **Ballot Confirmation**  
   - After registering their vote, each member receives a unique ballot ID.

6. **Displaying Results**  
   - Once all members have voted, the voting can be closed and results are shown.
  
7. **Auditing**  
   - Before the election is closed, members can verify that their vote has been correctly registered using the ballot ID in an auditing view.
  
8. **Closing**
   - When the results have been gone through and the auditing has been made, the election can be closed.
   - After this a new election can be created.

## Database Schema
![Database schema](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/docs/images/database-schema.png?raw=true)
