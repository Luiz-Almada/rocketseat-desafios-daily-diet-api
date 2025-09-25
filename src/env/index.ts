import { config } from 'dotenv'
import { z } from 'zod'



// Diferenciar o ambiente de teste do ambiente de desenvolvimento
// Assim, quando estivermos rodando os testes, as variáveis de ambiente
// serão carregadas do arquivo .env.test
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// Carregar variáveis de ambiente do arquivo .env
// O quiet: true evita que o dotenv lance um warning se o arquivo .env não existir
//config({ quiet: true, override: true })

// Bibliotecas de validação Joi, Yup, Zod
// O Zod leva vantagem por ter uma integração melhor com o TS

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  // Necessário para o deploy na Render
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

// export const env = envSchema.parse(process.env)

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('⚠️  Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
