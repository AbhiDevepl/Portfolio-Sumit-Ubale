import { listFiles } from '../lib/b2'
import { json, requireSession } from '../lib/session'

/** GET -> every image and video in the bucket with a signed preview URL. */
export default requireSession(async () => {
  return json({ files: await listFiles() })
})
