import { readFileSync, writeFileSync } from 'fs'
import { load } from 'js-yaml'
import dotenv from 'dotenv'

dotenv.config()

const configDir = `./configs/${process.env.VITE_SITE_ID}`
const configFile = `${configDir}/config.yaml`

// Read the config file
const config = load(readFileSync(configFile, 'utf8'))

// Generate the robots.txt content based on the config
let content = `User-agent: *\n`
if (config.robots?.disallow) {
  content += config.robots.disallow.map(path => `Disallow: ${path}`).join('\n')
}
if (config.robots?.sitemap) {
  content += `\nSitemap: ${config.robots.sitemap}`
}

// Write the content to public/robots.txt
writeFileSync('./public/robots.txt', content)
