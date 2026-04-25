/**
 * Order storage — PostgreSQL (Render or any DATABASE_URL).
 *
 * Set DATABASE_URL in .env. On startup, initDatabase() creates the schema.
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Pool } = pg

// ─────────────────────────────────────────────────────────────────────────────
// DB-less fallback (local JSON file)
// ─────────────────────────────────────────────────────────────────────────────

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')

function ensureOrdersFile() {
  try {
    const dir = path.dirname(ORDERS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2))
  } catch (e) {
    console.error('Failed to ensure orders file:', e.message)
  }
}

function readOrdersFromDisk() {
  try {
    ensureOrdersFile()
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8')
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    console.error('Failed to read orders from disk:', e.message)
    return []
  }
}

function writeOrdersToDisk(orders) {
  try {
    ensureOrdersFile()
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(Array.isArray(orders) ? orders : [], null, 2))
  } catch (e) {
    console.error('Failed to write orders to disk:', e.message)
  }
}

/** Parse hostname from postgres URL for diagnostics (password not logged). */
function postgresUrlHostname(connectionString) {
  if (!connectionString || typeof connectionString !== 'string') return null
  try {
    const normalized = connectionString.replace(/^postgres(ql)?:\/\//i, 'http://')
    return new URL(normalized).hostname || null
  } catch {
    return null
  }
}

function logDatabaseUrlHints(connectionString) {
  const host = postgresUrlHostname(connectionString)
  if (!host || host.includes('.')) return
  console.warn(
    `⚠ DATABASE_URL host "${host}" is not a full hostname (no ".domain"). ` +
      'Render internal URLs (dpg-…-a) only resolve on Render’s private network. If you get ENOTFOUND, set DATABASE_URL to the External Database URL from Render → PostgreSQL → Connect (host ends with e.g. .oregon-postgres.render.com).'
  )
}

function normalizeStripePaymentIntentId(pi) {
  if (pi == null || pi === '') return ''
  if (typeof pi === 'string') return pi
  if (typeof pi === 'object' && pi.id) return pi.id
  return String(pi)
}

const pool = process.env.DATABASE_URL
  ? (() => {
      logDatabaseUrlHints(process.env.DATABASE_URL)
      return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost')
          ? false
          : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      })
    })()
  : null

if (pool) {
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message)
  })
}

/** In-memory mirror for cheap reads; refreshed on writes and warmCache */
let _ordersCache = []

export function getAllOrders() {
  return _ordersCache
}

export function getOrderById(id) {
  if (!id) return null
  return _ordersCache.find((o) => o.id === id) || null
}

function bumpCache(order) {
  if (!order?.id) return
  const i = _ordersCache.findIndex((o) => o.id === order.id)
  if (i >= 0) _ordersCache[i] = order
  else _ordersCache.unshift(order)
}

export function rowToOrder(row) {
  if (!row) return null
  const d = row.data
  const data = typeof d === 'string' ? JSON.parse(d) : d
  const ca = row.created_at
  const ua = row.updated_at
  return {
    ...data,
    id: row.id,
    status: row.status || data?.status || 'pending',
    stripeSessionId: row.stripe_session_id || data?.stripeSessionId,
    stripePaymentIntentId: row.stripe_payment_intent || data?.stripePaymentIntentId,
    createdAt: ca instanceof Date ? ca.toISOString() : ca || data?.createdAt,
    updatedAt: ua instanceof Date ? ua.toISOString() : ua || data?.updatedAt,
  }
}

export async function initDatabase() {
  if (!pool) {
    // DB-less mode (file-backed)
    ensureOrdersFile()
    console.warn('⚠ DATABASE_URL is not set — using DB-less (file) order storage at', ORDERS_FILE)
    return
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id                     TEXT PRIMARY KEY,
      stripe_session_id      TEXT,
      stripe_payment_intent  TEXT,
      data                   JSONB NOT NULL,
      status                 TEXT DEFAULT 'pending',
      created_at             TIMESTAMPTZ DEFAULT NOW(),
      updated_at             TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_stripe_session
      ON orders (stripe_session_id) WHERE stripe_session_id IS NOT NULL
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi
      ON orders (stripe_payment_intent) WHERE stripe_payment_intent IS NOT NULL
  `)
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_unique
      ON orders (stripe_session_id) WHERE stripe_session_id IS NOT NULL AND stripe_session_id <> ''
  `)
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_pi_unique
      ON orders (stripe_payment_intent) WHERE stripe_payment_intent IS NOT NULL AND stripe_payment_intent <> ''
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC)
  `)

  console.log('✅ PostgreSQL orders table ready')
}

export async function warmCache() {
  _ordersCache = await getAllOrdersAsync()
  console.log(`✅ Order cache warmed — ${_ordersCache.length} orders loaded`)
}

export async function findOrderByStripeSessionId(sessionId) {
  if (!sessionId) return null
  if (!pool) {
    const cached = _ordersCache.find((o) => o?.stripeSessionId === sessionId) || null
    if (cached) return cached
    const orders = readOrdersFromDisk()
    const found = orders.find((o) => o?.stripeSessionId === sessionId) || null
    if (found) bumpCache(found)
    return found
  }

  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE stripe_session_id = $1 LIMIT 1',
    [sessionId]
  )
  const o = rowToOrder(rows[0])
  if (o) bumpCache(o)
  return o
}

export async function getAllOrdersAsync({ status, limit } = {}) {
  if (!pool) {
    let orders = readOrdersFromDisk()
    if (status) orders = orders.filter((o) => o?.status === status)
    orders.sort((a, b) => (b?.createdAt || '').localeCompare(a?.createdAt || ''))
    if (limit) orders = orders.slice(0, limit)
    _ordersCache = orders
    return orders
  }
  try {
    let query = 'SELECT * FROM orders'
    const params = []
    if (status) {
      params.push(status)
      query += ` WHERE status = $${params.length}`
    }
    query += ' ORDER BY created_at DESC'
    if (limit) {
      params.push(limit)
      query += ` LIMIT $${params.length}`
    }
    const { rows } = await pool.query(query, params)
    const orders = rows.map(rowToOrder)
    _ordersCache = orders
    return orders
  } catch (err) {
    console.error('getAllOrdersAsync error:', err.message)
    return []
  }
}

export async function getOrderByIdAsync(id) {
  if (!pool || !id) return null
  try {
    const cached = _ordersCache.find((o) => o.id === id)
    if (cached) return cached

    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id])
    const o = rowToOrder(rows[0])
    if (o) bumpCache(o)
    return o
  } catch (err) {
    console.error('getOrderByIdAsync error:', err.message)
    return null
  }
}

/**
 * Insert or return existing order (dedupe by Stripe session id or payment intent id).
 */
export async function saveOrder(orderData) {
  if (!orderData) throw new Error('saveOrder: missing orderData')

  const sessionId = orderData.stripeSessionId || ''
  const piNorm = normalizeStripePaymentIntentId(orderData.stripePaymentIntentId)

  if (!pool) {
    // DB-less (file-backed) mode: dedupe against cache/disk, then upsert.
    const orders = readOrdersFromDisk()
    const existing =
      (sessionId ? orders.find((o) => o?.stripeSessionId === sessionId) : null) ||
      (piNorm ? orders.find((o) => normalizeStripePaymentIntentId(o?.stripePaymentIntentId) === piNorm) : null) ||
      null

    if (existing) {
      bumpCache(existing)
      return existing
    }

    const orderId = orderData.id || `PP-${Date.now().toString().slice(-8)}`
    const newOrder = {
      ...orderData,
      id: orderId,
      stripePaymentIntentId: piNorm || orderData.stripePaymentIntentId,
      emailsSent: orderData.emailsSent || {
        confirmation: false,
        admin: false,
        shipping: false,
      },
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending',
    }

    orders.unshift(newOrder)
    writeOrdersToDisk(orders)
    bumpCache(newOrder)
    console.log('Order saved (file):', newOrder.id)
    return newOrder
  }

  if (sessionId) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE stripe_session_id = $1 LIMIT 1',
      [sessionId]
    )
    if (rows[0]) {
      const existing = rowToOrder(rows[0])
      console.log('Order already exists:', existing.id)
      bumpCache(existing)
      return existing
    }
  }
  if (piNorm) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE stripe_payment_intent = $1 LIMIT 1',
      [piNorm]
    )
    if (rows[0]) {
      const existing = rowToOrder(rows[0])
      console.log('Order already exists:', existing.id)
      bumpCache(existing)
      return existing
    }
  }

  const orderId = orderData.id || `PP-${Date.now().toString().slice(-8)}`
  const newOrder = {
    ...orderData,
    id: orderId,
    stripePaymentIntentId: piNorm || orderData.stripePaymentIntentId,
    emailsSent: orderData.emailsSent || {
      confirmation: false,
      admin: false,
      shipping: false,
    },
    createdAt: orderData.createdAt || new Date().toISOString(),
    status: orderData.status || 'pending',
  }

  try {
    await pool.query(
      `INSERT INTO orders (id, stripe_session_id, stripe_payment_intent, data, status)
       VALUES ($1, $2, $3, $4::jsonb, $5)`,
      [
        orderId,
        sessionId || null,
        piNorm || null,
        JSON.stringify(newOrder),
        newOrder.status,
      ]
    )
    bumpCache(newOrder)
    console.log('Order saved:', newOrder.id)
    return newOrder
  } catch (e) {
    if (e.code === '23505') {
      const { rows } = await pool.query(
        `SELECT * FROM orders WHERE stripe_session_id = $1
         OR ($2::text IS NOT NULL AND stripe_payment_intent = $2) LIMIT 1`,
        [sessionId || null, piNorm || null]
      )
      const existing = rowToOrder(rows[0])
      if (existing) {
        bumpCache(existing)
        return existing
      }
    }
    throw e
  }
}

/** Persist full order object (e.g. after refund webhook). */
export async function persistOrder(order) {
  if (!order?.id) throw new Error('persistOrder: invalid order')
  if (!pool) {
    const orders = readOrdersFromDisk()
    const idx = orders.findIndex((o) => o?.id === order.id)
    const updated = { ...order, updatedAt: new Date().toISOString() }
    if (idx >= 0) orders[idx] = updated
    else orders.unshift(updated)
    writeOrdersToDisk(orders)
    bumpCache(updated)
    return updated
  }
  await pool.query(
    `UPDATE orders SET data = $1::jsonb, status = $2, stripe_session_id = COALESCE($3, stripe_session_id),
     stripe_payment_intent = COALESCE($4, stripe_payment_intent), updated_at = NOW() WHERE id = $5`,
    [
      JSON.stringify(order),
      order.status || 'pending',
      order.stripeSessionId || null,
      normalizeStripePaymentIntentId(order.stripePaymentIntentId) || null,
      order.id,
    ]
  )
  bumpCache(order)
  return order
}

export async function updateOrderStatus(id, status) {
  const order = await getOrderByIdAsync(id)
  if (!order) throw new Error(`Order ${id} not found`)

  const updated = { ...order, status, updatedAt: new Date().toISOString() }
  if (!pool) {
    const orders = readOrdersFromDisk()
    const idx = orders.findIndex((o) => o?.id === id)
    if (idx >= 0) orders[idx] = updated
    else orders.unshift(updated)
    writeOrdersToDisk(orders)
    bumpCache(updated)
    return updated
  }
  await pool.query(
    `UPDATE orders SET status = $1, data = $2::jsonb, updated_at = NOW() WHERE id = $3`,
    [status, JSON.stringify(updated), id]
  )
  bumpCache(updated)
  return updated
}

export async function updateOrderTracking(id, trackingData) {
  const order = (await getOrderByIdAsync(id)) || { id }
  const updated = {
    ...order,
    ...trackingData,
    updatedAt: new Date().toISOString(),
    status: order.status === 'pending' ? 'processing' : order.status,
  }
  if (!pool) {
    const orders = readOrdersFromDisk()
    const idx = orders.findIndex((o) => o?.id === id)
    if (idx >= 0) orders[idx] = updated
    else orders.unshift(updated)
    writeOrdersToDisk(orders)
    bumpCache(updated)
    return updated
  }
  await pool.query(
    `UPDATE orders SET data = $1::jsonb, status = $2, updated_at = NOW() WHERE id = $3`,
    [JSON.stringify(updated), updated.status, id]
  )
  bumpCache(updated)
  return updated
}

export async function hasEmailBeenSent(orderId, emailType) {
  const order = await getOrderByIdAsync(orderId)
  return order?.emailsSent?.[emailType] === true
}

export async function markEmailSent(orderId, emailType) {
  const order = await getOrderByIdAsync(orderId)
  if (!order) {
    console.warn('markEmailSent: order not found', orderId)
    return
  }
  if (!order.emailsSent) order.emailsSent = {}
  order.emailsSent[emailType] = true
  order.updatedAt = new Date().toISOString()
  if (!pool) {
    const orders = readOrdersFromDisk()
    const idx = orders.findIndex((o) => o?.id === orderId)
    if (idx >= 0) orders[idx] = order
    else orders.unshift(order)
    writeOrdersToDisk(orders)
    bumpCache(order)
    return
  }
  await pool.query(
    `UPDATE orders SET data = $1::jsonb, status = COALESCE($2, status), updated_at = NOW() WHERE id = $3`,
    [JSON.stringify(order), order.status || null, orderId]
  )
  bumpCache(order)
}

export async function getOrderStats() {
  if (!pool) {
    const orders = readOrdersFromDisk()
    const total = orders.length
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    }
    let revenue = 0
    orders.forEach((o) => {
      const s = (o?.status || 'pending').toLowerCase()
      if (counts[s] != null) counts[s] += 1
      const t = Number.parseFloat(o?.total)
      if (Number.isFinite(t)) revenue += t
    })
    const avg = total > 0 ? revenue / total : 0
    return {
      total,
      ...counts,
      totalRevenue: revenue.toFixed(2),
      avgOrderValue: avg.toFixed(2),
    }
  }
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE status = 'pending')       AS pending,
        COUNT(*) FILTER (WHERE status = 'processing')    AS processing,
        COUNT(*) FILTER (WHERE status = 'shipped')       AS shipped,
        COUNT(*) FILTER (WHERE status = 'delivered')     AS delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled')     AS cancelled,
        COUNT(*) FILTER (WHERE status = 'refunded')      AS refunded,
        COALESCE(SUM((data->>'total')::numeric), 0)      AS total_revenue,
        COALESCE(AVG((data->>'total')::numeric), 0)      AS avg_order_value
      FROM orders
    `)
    const r = rows[0]
    return {
      total: parseInt(r.total, 10),
      pending: parseInt(r.pending, 10),
      processing: parseInt(r.processing, 10),
      shipped: parseInt(r.shipped, 10),
      delivered: parseInt(r.delivered, 10),
      cancelled: parseInt(r.cancelled, 10),
      refunded: parseInt(r.refunded, 10),
      totalRevenue: parseFloat(r.total_revenue).toFixed(2),
      avgOrderValue: parseFloat(r.avg_order_value).toFixed(2),
    }
  } catch (err) {
    console.error('getOrderStats error:', err.message)
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      totalRevenue: '0.00',
      avgOrderValue: '0.00',
    }
  }
}
