#!/bin/sh

if [[ ! -d /data/uploads ]]
  then
    mkdir /data/uploads
fi

ln -s /data/uploads public/uploads

set -ex
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
pnpm start
