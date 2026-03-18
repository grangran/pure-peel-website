/**
 * Subscriber list storage (file-based).
 * Used by POST /api/subscribe to record signups when not using Klaviyo.
 * Data is stored in data/subscribers.json (gitignored via /data/).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json')

const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

const readSubscribers = () => {
  ensureDataDir()
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    return []
  }
  try {
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeSubscribers = (list) => {
  ensureDataDir()
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf8')
}

/**
 * Check if email is already in the subscriber list (no side effects).
 * @param {string} email
 * @returns {boolean}
 */
export function hasSubscriber(email) {
  const normalized = (email || '').toLowerCase().trim()
  if (!normalized) return false
  const list = readSubscribers()
  return list.some((s) => (s.email || '').toLowerCase() === normalized)
}

/**
 * Add a subscriber (email + optional language/source). Idempotent by email.
 * @param {string} email
 * @param {{ language?: string, source?: string }} meta
 * @returns {{ added: boolean, subscriber: object }}
 */
export function addSubscriber(email, meta = {}) {
  const normalized = (email || '').toLowerCase().trim()
  if (!normalized) return { added: false, subscriber: null }

  const list = readSubscribers()
  const existing = list.find((s) => (s.email || '').toLowerCase() === normalized)
  if (existing) {
    return { added: false, subscriber: existing }
  }

  const subscriber = {
    email: normalized,
    language: meta.language === 'fr' ? 'fr' : 'en',
    source: meta.source || 'inline',
    subscribedAt: new Date().toISOString(),
  }
  list.push(subscriber)
  writeSubscribers(list)
  return { added: true, subscriber }
}

/**
 * @returns {Array<{ email: string, language: string, source: string, subscribedAt: string }>}
 */
export function getSubscribers() {
  return readSubscribers()
}
