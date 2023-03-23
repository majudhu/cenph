#!/bin/sh

set -ex
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
pnpm start
