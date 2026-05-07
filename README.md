# AssetTrack
Asset tracking system with role-based access control.

## Local Development

1) Start the database: `docker-compose up -d`
	- PostgreSQL runs on localhost:5432.
	- pgAdmin is available at http://localhost:8081 (Login: admin@assettrack.com / admin).
2) Generate JWT RSA keys: `./backend/scripts/generate-rsa-keys.sh`
	- This writes `private_pkcs8.pem` and `public.pem` into `backend/src/main/resources` (ignored by git).
3) Optional email alerts: set `MAILTRAP_USERNAME` and `MAILTRAP_PASSWORD` if you want emails sent.
4) Run the backend: `cd backend && mvn spring-boot:run`
5) Run the frontend: `cd frontend && npm install && npm run dev`

If you want to store keys elsewhere, set `RSA_PRIVATE_KEY_LOCATION` and `RSA_PUBLIC_KEY_LOCATION` (for example, `file:/absolute/path/private_pkcs8.pem`).

## Mailtrap (Email Testing)

1) Create an inbox in Mailtrap and grab the SMTP credentials.
2) Export these environment variables before starting the backend:
	- `MAILTRAP_HOST` (default: `sandbox.smtp.mailtrap.io`)
	- `MAILTRAP_PORT` (default: `2525`)
	- `MAILTRAP_USERNAME`
	- `MAILTRAP_PASSWORD`
	- Optional: `MAIL_FROM` (default: `no-reply@assettrack.local`)
	- Optional: `ALERTS_RECIPIENT_EMAIL` (defaults to `admin@assettrack.com`)
3) Email alerts are sent by the low-stock scheduled job in `AlertService`.
	- To test quickly, create low-stock items and set `ALERTS_RECIPIENT_EMAIL` to a test address.

## Token Helper

Use the helper script to get a JWT for Swagger:

```bash
./backend/scripts/get-token.sh
```

It will login or auto-register (default email `dev@assettrack.local`, password `ChangeMe123`).

Common options:

```bash
./backend/scripts/get-token.sh --email user@company.com --password "MyPass123"
ASSETTRACK_EMAIL=user@company.com ASSETTRACK_PASSWORD=MyPass123 ./backend/scripts/get-token.sh
./backend/scripts/get-token.sh --print-header
```

Swagger UI: `http://localhost:8080/swagger-ui/index.html` → Authorize → paste the token (or the `Authorization: Bearer ...` header).
