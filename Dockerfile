# syntax=docker/dockerfile:1
# base node image
FROM node:lts-alpine as base

# Install openssl for Prisma
RUN --mount=type=cache,id=apk,target=/var/cache/apk apk upgrade && apk add openssl libc6-compat sqlite xz
RUN corepack enable && corepack prepare pnpm@7.32.2 --activate

ENV NODE_ENV production
ENV CI 1
ARG PNPM=/root/.local/share/pnpm/store

# Setup production node_modules 
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --link package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=$PNPM pnpm install

COPY --link prisma ./
RUN pnpm exec prisma generate

# Build the app
FROM production-deps as build

RUN --mount=type=cache,id=pnpm,target=$PNPM pnpm install --production=false

COPY --link . .
RUN pnpm build

# build the cenph-reminder rust worker service
FROM rust:alpine as rust-builder

RUN --mount=type=cache,id=apk,target=/var/cache/apk apk upgrade && apk add openssl-dev musl-dev

RUN mkdir /app
WORKDIR /app
COPY --link cenph-reminder .
RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=rust-build,target=target \
    RUSTFLAGS="-Ctarget-feature=-crt-static" \
    cargo install --path .

# Finally, build the production image with minimal footprint
FROM base

RUN mkdir /app
WORKDIR /app

COPY --link --from=production-deps /app/node_modules /app/node_modules
COPY --link --from=build /app/build /app/build
COPY --link --from=build /app/public /app/public
COPY --link . .

COPY  --from=rust-builder /usr/local/cargo/bin/cenph-reminder ./cenph-reminder

CMD "./start_with_migrations.sh"
