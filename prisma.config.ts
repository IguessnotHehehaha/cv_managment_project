import { config } from 'dotenv'
config({ path: '.env.local' })

import { defineConfig } from 'prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    experimental: {
        externalTables: true,
    },
    tables: {
        external: ['auth.users'],
    },
    migrations: {
        path: 'prisma/migrations',
        initShadowDb: `
      create schema if not exists auth;
      create table if not exists auth.users (
        id uuid primary key,
        raw_user_meta_data jsonb
      );
    `,
    },
})