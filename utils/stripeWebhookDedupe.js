import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'processed-stripe-events.json')
const MAX_IDS = 2000

export function isStripeWebhookEventProcessed(eventId) {
  if (!eventId || typeof eventId !== 'string') return false
  try {
    if (!fs.existsSync(FILE)) return false
    const arr = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    return Array.isArray(arr) && arr.includes(eventId)
  } catch {
    return false
  }
}

export function markStripeWebhookEventProcessed(eventId) {
  if (!eventId || typeof eventId !== 'string') return
  try {
    const dir = path.dirname(FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    let arr = []
    if (fs.existsSync(FILE)) {
      try {
        arr = JSON.parse(fs.readFileSync(FILE, 'utf8'))
      } catch {
        arr = []
      }
    }
    if (!Array.isArray(arr)) arr = []
    if (arr.includes(eventId)) return
    arr.push(eventId)
    while (arr.length > MAX_IDS) arr.shift()
    fs.writeFileSync(FILE, JSON.stringify(arr, null, 2))
  } catch (e) {
    console.error('Failed to persist Stripe webhook event id:', e.message)
  }
}
