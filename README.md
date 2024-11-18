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
  
### Result Calculation Overview

The Voting Machine uses the STV algorithm combined with the Droop quota. The code for the algorithm is [here](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/src/frontend/utils/stvAlgorithm.ts?plain=1).

The steps to calculate the result are as follows:

1. **Voting Process**
- **Voters rank candidates** by preference, marking them as `1` (first preference), `2` (second preference), `3` (third preference), etc.
- A voter can rank as many or as few candidates as they wish.

2. **Counting the Votes: Setting the Quota**
- A **quota** (the minimum number of votes a candidate needs to be elected) is determined using the **Droop quota formula**:

  $\text{Quota} = \left(\frac{\text{Total Valid Votes}}{\text{Seats + 1}}\right) + 1$

  - **Total Valid Votes**: Total number of valid ballots cast.
  - **Seats**: Number of seats to be filled.
  - The result is rounded down to the nearest whole number.

3. **First Count: Determining Initial Winners**
- Each ballot is counted for the voter's **first preference**.
- Any candidate who reaches or exceeds the quota is **elected**.

4. **Transferring Surplus Votes**
- If a candidate receives more votes than the quota, the **surplus** is transferred to the remaining candidates.
- To ensure fairness, **surplus votes** are transferred at a reduced value (known as the **transfer value**):

  $\text{Transfer Value} = \frac{\text{Surplus Votes}}{\text{Total Votes Received by the Candidate}}$

- This means only a fraction of each vote is passed on to the next preferred candidate.

5. **Elimination Process**
- If no candidate reaches the quota after all surpluses are transferred, the candidate with the **fewest votes** is eliminated.
- The eliminated candidate’s votes are redistributed to the next preferred candidate on each ballot.
- This process of **elimination and redistribution** continues until all seats are filled.

5.1. **Multiple candidates with fewest votes**
- It is possible that multiple candidates have the minimum amount of votes in this case the candidate to be dropped is chosen by a draw.
- The code for the randomization is [here](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/src/frontend/utils/stvAlgorithm.ts?plain=1#L75-L93).
- In short the election id or UUID (Universal Unique Identifier) is used to seed a random number generator. Since the UUID is itself random, this ensures the result of the draw is random, but stays the same everytime the code is run. Using the random number generator the list of candidates with fewest votes is shuffled and the first in that list after shuffling is the candidate to be dropped.

6. **Repeating the Process**
- The counting process is repeated:
  - Elect candidates when they meet the quota.
  - Transfer surpluses if there are any.
  - Eliminate the lowest-ranked candidates if needed.
- The algorithm stops when all seats are filled.

## Database Schema
![Database schema](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/docs/images/database-schema.png?raw=true)
