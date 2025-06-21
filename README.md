# Guild of Physics' Voting Machine

## Setup

0. Have node and pnpm installed
1. Clone the repository
2. Install dependencies with `pnpm install`
3. Copy `.env.example` to `.env` and configure your environment variables
4. Setup a PostgreSQL database and update the `DATABASE_URL` in your `.env` file
5. Setup the database by running migrations using `pnpm db:migrate`
6. Start the project with `pnpm dev`

## Environment Variables

This project uses `@t3-oss/env-nextjs` for environment variable validation. All environment variables are validated at runtime to ensure they are properly configured.

### Required Environment Variables

#### Database

- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database`
  - Examples:
    - Local: `postgresql://postgres:password@localhost:5432/vaalimasiina`
    - Railway: `postgresql://user:pass@containers-us-west-1.railway.app:5432/railway`
    - Supabase: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

#### Application

- `BASE_URL`: Base URL of the application
  - Development: `http://localhost:3000`
  - Production: `https://vaalit.fyysikkokilta.fi`

#### Authentication

- `ADMIN_USERNAME`: Admin username for authentication
- `ADMIN_PASSWORD`: Admin password for authentication (use a strong password!)
- `JWT_SECRET`: Secret key for JWT tokens (generate a random string!)

#### Email

- `MAIL_FROM`: Email address for sending emails
  - Example: `Vaalimasiina <vaalit@fyysikkokilta.fi>`

### Optional Environment Variables

#### Email Configuration (for production)

- `MAILGUN_API_KEY`: Mailgun API key for sending emails
- `MAILGUN_DOMAIN`: Mailgun domain for sending emails
- `MAILGUN_HOST`: Mailgun server (default: `https://api.eu.mailgun.net`)

#### S3-Compatible Storage (optional - for election result persistence)

- `S3_ACCESS_KEY_ID`: S3-compatible storage access key ID (optional)
- `S3_SECRET_ACCESS_KEY`: S3-compatible storage secret access key (optional)
- `S3_BUCKET_NAME`: S3-compatible storage bucket name for storing election results (optional)
- `S3_ENDPOINT`: S3-compatible storage endpoint URL (varies by provider, optional)
- `S3_REGION`: S3-compatible storage region (varies by provider, default: `auto`)

#### Branding

- `BRANDING_EMAIL_SUBJECT_PREFIX`: Email subject prefix (default: `Vaalimasiina`)
- `BRANDING_MAIL_FOOTER_TEXT`: Email footer text (default: `Rakkaudella Fysistit`)
- `BRANDING_MAIL_FOOTER_LINK`: Email footer link (default: `https://fyysikkokilta.fi`)

#### Development & Debugging

- `PORT`: Server port (default: `3000`)
- `ANALYZE`: Enable bundle analysis (default: `false`)
- `SKIP_ENV_VALIDATION`: Skip environment validation during build (default: `false`)

### Client-Side Environment Variables

These variables are exposed to the browser and can be customized for branding:

- `NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT`: Header title (default: `Vaalimasiina`)
- `NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT`: Short header title (default: `Vaalimasiina`)
- `NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT`: Footer home text (default: `fyysikkokilta.fi`)
- `NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK`: Footer home link (default: `https://fyysikkokilta.fi`)

### Environment Validation

The application will validate all environment variables on startup. If any required variables are missing or invalid, the application will fail to start with a clear error message.

For development, you can set `SKIP_ENV_VALIDATION=true` to bypass validation during build.

### Quick Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Update the required variables in `.env`:
   - Set your `DATABASE_URL`
   - Change `ADMIN_USERNAME` and `ADMIN_PASSWORD`
   - Generate a random `JWT_SECRET`
   - Update `BASE_URL` for your environment

## Migrations

Migrations can be run with command `pnpm db:migrate`. The `DATABASE_URL` environment variable must be set.

A new migration can be created using `pnpm db:generate-migration`.

Other Drizzle features can be accessed using `pnpx drizzle-kit [command]`.

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

The Voting Machine uses the STV algorithm combined with the Droop quota. The code for the algorithm is [here](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/src/algorithm/stvAlgorithm.ts?plain=1).

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
- The eliminated candidate's votes are redistributed to the next preferred candidate on each ballot.
- This process of **elimination and redistribution** continues until all seats are filled.

  5.1. **Multiple candidates with fewest votes**

- It is possible that multiple candidates have the minimum amount of votes in this case the candidate to be dropped is chosen by a draw.
- The code for the randomization is [here](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/src/algorithm/stvAlgorithm.ts?plain=1#L185-L201).
- In short the election id or UUID (Universal Unique Identifier) is used to seed a random number generator. Since the UUID is itself random, this ensures the result of the draw is random, but stays the same everytime the code is run. Using the random number generator the list of candidates with fewest votes is shuffled and the first in that list after shuffling is the candidate to be dropped.

6. **Repeating the Process**

- The counting process is repeated:
  - Elect candidates when they meet the quota.
  - Transfer surpluses if there are any.
  - Eliminate the lowest-ranked candidates if needed.
- The algorithm stops when all seats are filled.

## Database Schema

![Database schema](https://github.com/fyysikkokilta/fk-vaalimasiina/blob/master/docs/images/database-schema.png?raw=true)
