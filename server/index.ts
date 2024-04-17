import express from 'express'
import compression from 'compression'
import { renderPage } from 'vike/server'
import { telefunc, config, provideTelefuncContext } from 'telefunc'
import { root } from './root.js'
import Cookies from 'universal-cookie';
const isProduction = process.env.NODE_ENV === 'production'

require('dotenv').config()

const port = process.env.PORT || 3000

startServer()

config.disableNamingConvention = true

async function startServer() {
  const app = express()
  enableCompression(app)
  await viteIntegration(app)
  installAuthMiddleware(app)
  installTelefunc(app)
  installVikeMiddleware(app)
  start(app)
}

function start(app) {
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}

function installAuthMiddleware(app) {
  app.get('*', async (req, res, next) => {
    const cookie = new Cookies(req?.headers?.cookie, { path: '/' });
    const technique = String(cookie.get('test') ?? "");
    req.calculation = technique;
    next();
  })
}

function installTelefunc(app) {
  app.use(express.text()) // Parse & make HTTP request body available at `req.body`
  app.all('/_telefunc', async (req, res) => {
    const context = {
      calculation: req?.calculation,
    }
    console.log('========= middleware 1')
    const httpResponse = await telefunc({ url: req.originalUrl, method: req.method, body: req.body, context })
    console.log('============ middleware 2')
    const { body, statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType).send(body)
  })
}

function installVikeMiddleware(app) {
  // Vike middleware. It should always be our last middleware (because it's a
  // catch-all middleware superseding any middleware placed after it).
  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      calculation: req?.calculation,
    }
    const context = {
      calculation: req?.calculation,
    }
    provideTelefuncContext(context)
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    } else {
      // Uncomment to not use HTTP streams (useData will stop working)
      //const { body, statusCode, headers, earlyHints } = httpResponse
      //if (res.writeEarlyHints) res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })
      //headers.forEach(([name, value]) => res.setHeader(name, value))
      //res.status(statusCode)
      //res.send(body)

      // For HTTP streams use httpResponse.pipe() instead, see https://vike.dev/stream
      const { statusCode, headers } = httpResponse
      res.status(statusCode);
      headers.forEach(([name, value]) => res.setHeader(name, value))
      httpResponse.pipe(res);
    }
  })
}

function enableCompression(app) {
  app.use(compression())
}

async function viteIntegration(app) {
  // Vite integration
  if (isProduction) {
    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    const sirv = (await import('sirv')).default
    app.use(sirv(`${root}/dist/client`))
  } else {
    // We instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our production server.)
    const vite = await import('vite')
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true }
      })
    ).middlewares
    app.use(viteDevMiddleware)
  }
}
