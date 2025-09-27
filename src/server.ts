import { app } from './app.js'
import { env } from './env'

app
  .listen({
    // Config para o Render
    // host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
    // host: '0.0.0.0', // IMPORTANTE: escutar em 0.0.0.0, não localhost
    port: env.PORT,
  })
  .then(() => {
    console.log(`HTTP Server Running in port ${env.PORT}!`)
  })
