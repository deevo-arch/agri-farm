# AgriTrust — Livestock Traceability System

Farm-to-consumer milk traceability: farmers register livestock and milk batches, vets record
vaccinations/medications through a request → accept → complete workflow, withdrawal periods are
enforced automatically before milk can be collected, and every batch gets a QR code linking to a
public (no-login) traceability page for consumers.

## Tech stack

- **Backend**: Java 21, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, MySQL
- **Frontend**: React 19, Vite, React Router, Axios

## Prerequisites

Each machine needs, installed locally:

1. **Java 21** — the backend will not build on 17 or earlier (`pom.xml` pins `<java.version>21</java.version>`)
2. **Maven** — no wrapper is checked in, so Maven must be on your `PATH`
3. **Node.js + npm** — any recent LTS
4. **MySQL 8.x** — running locally on port 3306

No Docker and no manual schema/table creation are required — the backend creates the
`livestock_trace` database and every table itself on first boot (`createDatabaseIfNotExist=true`
plus Hibernate `ddl-auto: update`).

### Mac (Homebrew)

```bash
brew install openjdk@21 maven node mysql

# Homebrew installs openjdk@21 "keg-only" — link it so `java` resolves to 21
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
java -version   # should print 21.x (open a new terminal tab if not)

brew services start mysql
```

Homebrew's MySQL starts with **no root password**. The app's default config expects `root`/`root`,
so either match it:

```bash
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';"
```

...or leave your MySQL as-is and set `DB_USERNAME`/`DB_PASSWORD` env vars instead (see below).

### Windows

1. **Java 21**: install [Eclipse Temurin 21](https://adoptium.net/) (`.msi`). During install, check
   "Set JAVA_HOME" and "Add to PATH." Verify with `java -version` in a new terminal.
2. **Maven**: download the binary zip from [maven.apache.org](https://maven.apache.org/download.cgi),
   extract it, add its `bin` folder to your `PATH`. Verify with `mvn -version`.
3. **Node.js**: install the LTS `.msi` from [nodejs.org](https://nodejs.org).
4. **MySQL**: install via the [MySQL Installer](https://dev.mysql.com/downloads/installer/). **When
   prompted to set the root password, set it to `root`** to match the app's defaults with zero extra
   config. Make sure the MySQL80 service is running (Services app, or it starts automatically).

*(Chocolatey users: `choco install temurin21 maven nodejs-lts mysql` covers all four, then set the
root password separately.)*

## Getting the code running

```bash
git clone https://github.com/its-sam-in/AGRI-TRUST.git
cd AGRI-TRUST/backend
mvn spring-boot:run
```

First run takes a bit longer — Maven downloads dependencies and Hibernate creates every table
automatically. Wait for `Started LivestockTraceApplication`; the backend listens on **port 8080**.
Leave it running.

In a second terminal:

```bash
cd AGRI-TRUST/frontend
npm install
npm run dev
```

This starts the frontend on **http://localhost:5173**. A `.env` file isn't required for local dev
(`VITE_API_BASE_URL` defaults to `http://localhost:8080`), but you can `cp .env.example .env` if
you want it explicit.

Open **http://localhost:5173** — you should land on the login/register page.

### Custom DB credentials

If you didn't set MySQL's root password to `root`, set these environment variables before
`mvn spring-boot:run` (matching your own MySQL user):

- `DB_USERNAME`
- `DB_PASSWORD`

## Creating the first Admin account

Public registration (the "Create account" page) **only ever creates FARMER accounts** — that's
intentional. VET and ADMIN accounts can only be created by an existing ADMIN, which is a
chicken-and-egg problem on a brand-new database. The fix is a one-time bootstrap step, disabled by
default.

Stop the backend (Ctrl+C) and restart it **once** with these three extra environment variables:

**Mac/Linux (bash/zsh):**
```bash
cd backend
BOOTSTRAP_ADMIN_ENABLED=true \
BOOTSTRAP_ADMIN_EMAIL=admin@agritrust.local \
BOOTSTRAP_ADMIN_PASSWORD=ChangeMe123! \
mvn spring-boot:run
```

**Windows (PowerShell):**
```powershell
cd backend
$env:BOOTSTRAP_ADMIN_ENABLED="true"
$env:BOOTSTRAP_ADMIN_EMAIL="admin@agritrust.local"
$env:BOOTSTRAP_ADMIN_PASSWORD="ChangeMe123!"
mvn spring-boot:run
```

**Windows (cmd.exe):**
```cmd
cd backend
set BOOTSTRAP_ADMIN_ENABLED=true
set BOOTSTRAP_ADMIN_EMAIL=admin@agritrust.local
set BOOTSTRAP_ADMIN_PASSWORD=ChangeMe123!
mvn spring-boot:run
```

Look for the log line `Bootstrap ADMIN account created (admin@agritrust.local)`. That account now
exists permanently in your local database — you don't need to pass those variables again (the
bootstrap check no-ops once any ADMIN exists, so it's harmless to leave them set too).

Log in at `/login` with that email/password. From the **Admin Dashboard**, use "Create Vet Account"
to create additional VET or ADMIN accounts through the normal UI — no env vars needed for that.
Farmers self-register through the public "Create account" page.

## Verifying everything works

1. Log in as the admin → should land on `/admin/dashboard` showing real user counts.
2. Log in as a farmer (or register a new one) → create a farm → add livestock → "Request Vet Visit."
3. Log in as the vet (same `/login` page) → `/vet/dashboard` → accept the request → record a
   vaccination → complete the visit.
4. Back as the farmer → create a milk batch for that animal → generate a QR code.
5. Open the QR's "Open Public Traceability" link → confirms the full chain end-to-end, no login
   required.

## Common gotchas

- **`mvn spring-boot:run` fails with "release version 21 not supported"** — the default `java` on
  your system isn't 21. Check `java -version`; on Mac this usually means the symlink step above
  wasn't done, or you need a fresh terminal tab.
- **"Port 8080 was already in use"** — a previous backend instance is likely still running; find and
  stop it before retrying.
- **Can't connect to MySQL / "Communications link failure"** — MySQL isn't running, or the
  port/credentials don't match what the backend expects. Confirm with `mysql -u root -p` using the
  same password.
- **IntelliJ/Eclipse shows errors everywhere in backend code** — the project uses Lombok
  (`@Getter`, `@Builder`, etc.). Install the Lombok plugin and enable annotation processing. This
  doesn't affect `mvn` builds from the terminal, only the IDE's own inline checking.

## Running tests

```bash
cd backend
mvn clean test
```

```bash
cd frontend
npm run build
npx oxlint
```
