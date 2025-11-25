#!/usr/bin/env node

import { spawn } from 'child_process'

const args = process.argv.slice(2)
const isOpen = args.includes('--open')
const isPreview = args.includes('--preview')
const cypressMode = isOpen ? 'open' : 'run'
const viteMode = isPreview ? 'preview' : 'dev'
const cypressArgs = args.filter(
  (arg) => arg !== '--open' && arg !== '--preview'
)

const port = process.env.PORT || '4173'

const cypressCommand =
  `cypress ${cypressMode} --e2e ${cypressArgs.join(' ')}`.trim()

const command = 'npx'
const commandArgs = [
  'start-server-and-test',
  `vite ${viteMode} --mode test --port ${port} --strictPort`,
  `http://localhost:${port}`,
  cypressCommand
]

const env = {
  ...process.env,
  CYPRESS_BASE_URL: `http://localhost:${port}`
}

spawn(command, commandArgs, { stdio: 'inherit', env }).on('exit', process.exit)
