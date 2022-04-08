import {PasswordLessAuth} from '@alineacms/auth.passwordless/PasswordLessAuth.js'
import {JsonLoader, Server} from '@alineacms/backend'
import {GithubData} from '@alineacms/backend/data/GithubData.js'
import {RedisDrafts} from '@alineacms/backend/drafts/RedisDrafts.js'
import {JWTPreviews} from '@alineacms/backend/util/JWTPreviews.js'
import dotenv from 'dotenv'
import findConfig from 'find-config'
import Redis from 'ioredis'
import {createTransport} from 'nodemailer'
import {createStore} from './.alinea'
import {config} from './.alinea/config'

dotenv.config({path: findConfig('.env')!})

const drafts = new RedisDrafts({
  client: new Redis(process.env.REDIS_DSN)
})

const isProduction = process.env.NODE_ENV === 'production'
const dashboardUrl = isProduction
  ? 'https://alinea.sh/admin'
  : 'http://localhost:3000/admin'

const data = new GithubData({
  config,
  loader: JsonLoader,
  rootDir: 'packages/website',
  githubAuthToken: process.env.GITHUB_TOKEN!,
  owner: 'alineacms',
  repo: 'alinea',
  branch: 'main',
  author: {
    name: 'Ben',
    email: 'ben@codeurs.be'
  }
})

const auth = new PasswordLessAuth({
  dashboardUrl,
  subject: 'Login',
  from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
  transporter: createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  }),
  jwtSecret: process.env.JWT_SECRET!,
  async isUser(email: string) {
    return email.endsWith('@codeurs.be')
  }
})

export const backend = new Server({
  dashboardUrl,
  auth,
  config,
  createStore,
  drafts: drafts,
  target: data,
  media: data,
  previews: new JWTPreviews(process.env.JWT_SECRET!)
})