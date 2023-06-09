# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Fly Setup

1. [Install `flyctl`](https://fly.io/docs/getting-started/installing-flyctl/)

2. Sign up and log in to Fly

```sh
flyctl auth signup
```

3. Setup Fly. It might ask if you want to deploy, say no since you haven't built the app yet.

```sh
flyctl launch --copy-config --no-deploy
flyctl secrets set SESSION_SECRET="$(openssl rand -base64 32)" API_KEY="$(openssl rand -base64 15)" TG_CHAT_ID=""
flyctl volume create data -s 1"
```

## Development

From your terminal:

```sh
pnpm i
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

If you've followed the setup instructions already, all you need to do is run this:

```sh
flyctl deploy
```

You can run `flyctl info` to get the url and ip address of your server.

Check out the [fly docs](https://fly.io/docs/getting-started/node/) for more information.

## Prisma

1. Setup local database

```sh
pnpm exec prisma generate
```

2. Apply schema changes during development

```sh
pnpm exec prisma db push
```

3. Create migration when done

```sh
pnpm exec prisma migrate dev -n name
```

4. Apply migration on deployment

```sh
pnpm exec prisma migrate deploy
```
