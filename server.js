import { createWriteStream } from 'node:fs'
import concurrently from 'concurrently'
import yargs from 'yargs'

const argv = yargs(process.argv.slice(2)).parse()
const volume = typeof argv.volume === 'number' ? argv.volume : 0
const tolerant = argv.tolerant || false

const geometries = [
  '50%x50%+0+0',
  '50%x50%-0+0',
  '50%x50%+0-0',
  '50%x50%-0-0',
]

const genCmd = (() => {
  let counter = -1
  return (ipAddr, name = 'anonymous', { channel = 0, port = 554, user = 'user', pass = 'pass' } = {}) => ({
    command: [
      'mpv',
      `--border=no`,
      `--volume=${volume}`,
      `--geometry=${geometries[counter += 1] || '50%x50%'}`,
      `rtsp://${user}:${pass}@${ipAddr}:${port}/live/ch${channel}`,
    ].join(' '),
    name,
  })
})()

const conc = await concurrently([
  genCmd('192.168.10.82', 'kelder'),
  genCmd('192.168.10.89', 'park'),
], {
  killOthers: tolerant ? [] : ['success', 'failure'],
  prefixColors: 'auto',
  raw: true,
  // outputStream: createWriteStream('/dev/null'), // Not needed with { raw: true }
})

try {
  await conc.result
} catch (errors) {
  for (const { command: { command, name }, index, killed, exitCode, timings: { durationSeconds } } of errors) {
    console.table({ command, name, index, killed, exitCode, durationSeconds })
  }
}

