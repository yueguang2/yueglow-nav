# Yueglow Nav

A personal navigation site with a public directory and an authenticated admin panel.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the public site and `http://localhost:3000/admin` for admin setup/login.

The first visit to `/admin` redirects to `/admin/login`, where you create the initial administrator account.

## Docker

```bash
docker compose up -d --build
```

The app listens on `http://localhost:3000`. SQLite data is stored in `./data` and mounted into the container as `/app/data`.

```bash
docker compose down
```

Docker healthcheck uses the app homepage. To view status:

```bash
docker compose ps
```
