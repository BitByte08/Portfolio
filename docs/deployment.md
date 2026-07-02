# Deployment

This repo is split into two deploy targets:

- Frontend: Cloudflare Workers via OpenNext, deployed from Cloudflare's Git integration or manual deploy flow.
- Backend: Docker container on an Oracle VM, fronted by Cloudflare Tunnel.

## Frontend

Deploy the frontend directly in Cloudflare Workers.

- Connect the GitHub repo to the Workers project, or use Cloudflare's deploy flow.
- Set `PORTFOLIO_BACKEND_URL` in the Workers environment so the app can reach the Oracle VM backend tunnel hostname.
- The frontend no longer has a GitHub Actions deploy job in this repo.

## Backend

GitHub Actions builds and pushes the backend image to GHCR, then SSHes into the Oracle VM and runs:

```bash
BACKEND_IMAGE_TAG=<sha> docker compose -f deploy/oracle/docker-compose.yml pull backend
BACKEND_IMAGE_TAG=<sha> docker compose -f deploy/oracle/docker-compose.yml up -d --remove-orphans
```

The Oracle VM uses `deploy/oracle/docker-compose.yml` plus `deploy/oracle/.env`.

GitHub Actions expects these Oracle secrets:

- `ORACLE_SSH_HOST`
- `ORACLE_SSH_USER`
- `ORACLE_SSH_KEY`
- `ORACLE_SSH_PASSPHRASE` optional, if the private key is encrypted
- `ORACLE_DEPLOY_PATH` optional, defaults to `/opt/portfolio`

## Oracle VM setup

1. Install Docker and Docker Compose.
2. Clone this repository onto the VM.
3. Copy `deploy/oracle/.env.example` to `deploy/oracle/.env`.
4. Fill in:
   - `PORTFOLIO_WEB_ORIGIN`
   - `CF_ACCESS_TEAM_DOMAIN`
   - `CF_ACCESS_AUDIENCE`
   - `CF_ACCESS_ALLOWED_EMAILS`
   - `CLOUDFLARE_TUNNEL_TOKEN`
   - `BACKEND_IMAGE_REPOSITORY`
   - `BACKEND_IMAGE_TAG` if you want to pin to something other than `latest`
5. Start the stack:

```bash
cd /opt/portfolio/deploy/oracle
docker compose up -d
```

## Cloudflare Tunnel token

Create the tunnel in Cloudflare Zero Trust, then copy the token from the connector setup screen into `CLOUDFLARE_TUNNEL_TOKEN`.
That token lives only on the Oracle VM `.env` file and is not committed to git.
