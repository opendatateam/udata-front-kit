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

const cypressCommand =
  `cypress ${cypressMode} --e2e ${cypressArgs.join(' ')}`.trim()

const command = 'npx'
const commandArgs = [
  'start-server-and-test',
  `vite ${viteMode} --port 4173`,
  'http://localhost:4173',
  cypressCommand
]

spawn(command, commandArgs, { stdio: 'inherit' }).on('exit', process.exit)
