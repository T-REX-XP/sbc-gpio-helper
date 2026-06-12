import { execSync } from 'node:child_process'

process.env.GITHUB_ACTIONS = 'true'
process.env.GITHUB_REPOSITORY =
  process.env.GITHUB_REPOSITORY ?? 'your-org/gpio_visualizer'

console.log(`Building for GitHub Pages (repository: ${process.env.GITHUB_REPOSITORY})`)

execSync('npm run build', { stdio: 'inherit', env: process.env })
