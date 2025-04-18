import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).default('5001'),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(16),
});
export type Env = z.infer<typeof EnvSchema>;
