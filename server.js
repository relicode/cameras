import { createWriteStream } from 'node:fs'
import concurrently from 'concurrently'

const geometries = [
  '50%x50%+0+0',
  '50%x50%-0+0',
  '50%x50%+0-0',
  '50%x50%-0-0',
]

const genCmd = (() => {
  let counter = -1
  return (ipAddr, { channel = 0, port = 554, user = 'user', pass = 'pass' } = {}) => (
    `mpv '--geometry=${geometries[counter += 1] || '50%x50%'}' 'rtsp://${user}:${pass}@${ipAddr}:${port}/live/ch${channel}'`)
})()

concurrently([
  genCmd('192.168.10.82'),
  genCmd('192.168.10.89'),
], {
  killOthers: ['success', 'failure'],
  prefixColors: 'auto',
  outputStream: createWriteStream('/dev/null'),
})

