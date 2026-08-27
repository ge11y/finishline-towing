'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, ClipboardList, PackageX, ReceiptText, Store, TriangleAlert } from 'lucide-react'
import { AdminShell } from '@/components/AdminShell'
import type { ManualOrderSubmission, ManualPaymentProofSubmission } from '@/lib/manual-orders'
import type { CatalogInventoryRecord } from '@/lib/catalog-admin'
import type { AdminSettingsPayload } from '@/lib/admin-settings'

type ClientSummary = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  createdAt: string
  orderCount: number
  completedCount: number
  pendingCount: number
  totalSpent: number
  latestOrderAt: string | null
  lastStatus: ManualOrderSubmission['status'] | null
}

type CostLog = {
  id: string
  slug: string
  product_name: string
  strength_label: string
  vendor_name?: string
  status?: 'ordered' | 'arrived'
  unit_quantity?: number
  kit_quantity?: number
  units_per_kit?: number
  quantity_ordered: number
  ordered_on: string
  price_per_unit?: string | number
  price_per_kit?: string | number
  cost_paid: string
  created_at: string
}

function getSupplyOrderUnits(log: {
  unit_quantity?: number | null
  kit_quantity?: number | null
  units_per_kit?: number | null
}) {
  return Number(log.unit_quantity ?? 0) + Number(log.kit_quantity ?? 0) * Number(log.units_per_kit ?? 10)
}

function getSupplyOrderAveragePricePerUnit(log: {
  unit_quantity?: number | null
  kit_quantity?: number | null
  units_per_kit?: number | null
  cost_paid?: string | number | null
}) {
  const totalUnits = getSupplyOrderUnits(log)
  if (totalUnits <= 0) return 0
  return Number(log.cost_paid ?? 0) / totalUnits
}

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<ManualOrderSubmission[]>([])
  const [proofs, setProofs] = useState<ManualPaymentProofSubmission[]>([])
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [costLogs, setCostLogs] = useState<CostLog[]>([])
  const [catalogRecords, setCatalogRecords] = useState<CatalogInventoryRecord[]>([])
  const [settings, setSettings] = useState<AdminSettingsPayload | null>(null)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [costMessage, setCostMessage] = useState('')
  const [savingCost, setSavingCost] = useState(false)
  const [editingCostId, setEditingCostId] = useState<string | null>(null)
  const [costForm, setCostForm] = useState({
    slug: '',
    strengthLabel: '',
    vendorName: '',
    unitQuantity: '0',
    kitQuantity: '0',
    unitsPerKit: '10',
    orderedOn: new Date().toISOString().slice(0, 10),
    pricePerUnit: '',
    pricePerKit: '',
    markIncoming: true,
  })
  const [loading, setLoading] = useState(true)
  const [pendingFilter, setPendingFilter] = useState<'all' | 'needs_review' | 'waiting_to_ship' | 'shipped'>('all')
  const [showAllLowStock, setShowAllLowStock] = useState(false)

  const load = useCallback(async () => {
    try {
      const [ordersResponse, clientsResponse, costsResponse, catalogResponse, settingsResponse] = await Promise.all([
        fetch('/api/admin/orders', { cache: 'no-store' }),
        fetch('/api/admin/clients', { cache: 'no-store' }),
        fetch('/api/admin/inventory-costs', { cache: 'no-store' }),
        fetch('/api/catalog-source', { cache: 'no-store' }),
        fetch('/api/admin/settings', { cache: 'no-store' }),
      ])

      const ordersResult = (await ordersResponse.json()) as {
        ok: boolean
        orders?: ManualOrderSubmission[]
        proofs?: ManualPaymentProofSubmission[]
      }
      const clientsResult = (await clientsResponse.json()) as { ok: boolean; clients?: ClientSummary[] }
      const costsResult = (await costsResponse.json()) as { ok: boolean; logs?: CostLog[] }
      const catalogResult = (await catalogResponse.json()) as { ok: boolean; records?: CatalogInventoryRecord[] }
      const settingsResult = (await settingsResponse.json()) as { ok: boolean; settings?: AdminSettingsPayload }

      if (ordersResponse.ok && ordersResult.ok) {
        setOrders(ordersResult.orders ?? [])
        setProofs(ordersResult.proofs ?? [])
      }
      if (clientsResponse.ok && clientsResult.ok) {
        setClients(clientsResult.clients ?? [])
      }
      if (costsResponse.ok && costsResult.ok) {
        setCostLogs(costsResult.logs ?? [])
      }
      if (catalogResponse.ok && catalogResult.ok) {
        setCatalogRecords(catalogResult.records ?? [])
      }
      if (settingsResponse.ok && settingsResult.ok && settingsResult.settings) {
        setSettings(settingsResult.settings)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()

    const interval = window.setInterval(() => {
      void load()
    }, 10000)

    const handleFocus = () => {
      void load()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [load])

  const pendingOrders = useMemo(() => orders.filter((order) => order.status !== 'fulfilled'), [orders])
  const proofReceivedCount = useMemo(() => orders.filter((order) => order.paymentProofStatus === 'submitted').length, [orders])
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.order.totals.total, 0), [orders])
  const pendingRevenue = useMemo(
    () => pendingOrders.reduce((sum, order) => sum + order.order.totals.total, 0),
    [pendingOrders],
  )
  const totalSpend = useMemo(() => costLogs.reduce((sum, log) => sum + Number(log.cost_paid || 0), 0), [costLogs])
  const historicalAverageSpendPerUnit = useMemo(() => {
    const totalUnits = costLogs.reduce((sum, log) => sum + getSupplyOrderUnits(log), 0)
    if (totalUnits <= 0) return 0
    return totalSpend / totalUnits
  }, [costLogs, totalSpend])
  const shippedCount = useMemo(() => orders.filter((order) => order.status === 'shipped').length, [orders])
  const outOfStockItems = useMemo(
    () => catalogRecords.filter((record) => !record.archived && record.status === 'out_of_stock'),
    [catalogRecords],
  )
  const lowStockItems = useMemo(() => {
    const threshold = settings?.inventoryDefaults.lowStockThreshold ?? 4
    return catalogRecords
      .filter((record) => {
        if (record.archived) return false
        if (record.status !== 'in_stock') return false
        if (record.inventoryOnHand === null || record.inventoryOnHand === undefined) return false
        return record.inventoryOnHand <= (record.lowStockThreshold ?? threshold)
      })
      .sort((a, b) => {
        const left = a.inventoryOnHand ?? Number.MAX_SAFE_INTEGER
        const right = b.inventoryOnHand ?? Number.MAX_SAFE_INTEGER
        if (left !== right) return left - right
        return a.displayName.localeCompare(b.displayName)
      })
  }, [catalogRecords, settings])
  const visibleLowStockItems = useMemo(
    () => (showAllLowStock ? lowStockItems : lowStockItems.slice(0, 6)),
    [lowStockItems, showAllLowStock],
  )
  const sortedOutOfStockItems = useMemo(
    () =>
      [...outOfStockItems].sort((a, b) => {
        const left = a.inventoryOnHand ?? 0
        const right = b.inventoryOnHand ?? 0
        if (left !== right) return left - right
        return a.displayName.localeCompare(b.displayName)
      }),
    [outOfStockItems],
  )
  const filteredPendingOrders = useMemo(() => {
    if (pendingFilter === 'waiting_to_ship') {
      return pendingOrders.filter((order) => order.status === 'waiting_to_ship')
    }
    if (pendingFilter === 'shipped') {
      return pendingOrders.filter((order) => order.status === 'shipped')
    }
    if (pendingFilter === 'needs_review') {
      return pendingOrders.filter(
        (order) =>
          order.status === 'submitted' ||
          order.status === 'payment_pending' ||
          order.status === 'proof_received',
      )
    }
    return pendingOrders
  }, [pendingFilter, pendingOrders])
  const recentFilteredPendingOrders = useMemo(() => filteredPendingOrders.slice(0, 6), [filteredPendingOrders])
  const selectedCostRecord = useMemo(
    () => catalogRecords.find((record) => record.slug === costForm.slug) ?? null,
    [catalogRecords, costForm.slug],
  )

  // Presentation-only derivations for the home-screen tiles and attention strip.
  const ordersToday = useMemo(
    () => orders.filter((order) => new Date(order.createdAt).toDateString() === new Date().toDateString()).length,
    [orders],
  )
  const needsReviewCount = useMemo(
    () =>
      pendingOrders.filter(
        (order) => order.status === 'submitted' || order.status === 'payment_pending' || order.status === 'proof_received',
      ).length,
    [pendingOrders],
  )
  const liveProductCount = useMemo(
    () => catalogRecords.filter((record) => !record.archived && record.publicVisible).length,
    [catalogRecords],
  )

  // Module toggles gate what the home screen renders; while settings are
  // unknown we match AdminShell's behavior and treat modules as enabled.
  const modules = settings?.moduleSettings ?? null
  const crmOn = !modules || modules.crm
  const inventoryOn = !modules || modules.inventory
  const supplyOn = !modules || modules.supplyTracking
  const storefrontOn = !modules || modules.storefront

  const attentionItems = [
    ...(crmOn && needsReviewCount > 0
      ? [{ key: 'review', href: '/admin/orders?status=needs_review', tone: 'amber', Icon: ClipboardList, label: `${needsReviewCount} ${needsReviewCount === 1 ? 'order' : 'orders'} to review` }]
      : []),
    ...(crmOn && proofReceivedCount > 0
      ? [{ key: 'proof', href: '/admin/orders?status=proof_received', tone: 'blue', Icon: ReceiptText, label: `${proofReceivedCount} payment ${proofReceivedCount === 1 ? 'proof' : 'proofs'} to confirm` }]
      : []),
    ...(inventoryOn && lowStockItems.length > 0
      ? [{ key: 'low', href: '/admin/inventory', tone: 'amber', Icon: TriangleAlert, label: `${lowStockItems.length} running low` }]
      : []),
    ...(inventoryOn && outOfStockItems.length > 0
      ? [{ key: 'out', href: '/admin/inventory', tone: 'muted', Icon: PackageX, label: `${outOfStockItems.length} out of stock` }]
      : []),
  ]

  async function saveCheckoutOperations() {
    if (!settings) return
    setSettingsMessage('')
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutOperations: settings.checkoutOperations }),
      })
      const result = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !result.ok) {
        setSettingsMessage(result.error || 'Operations settings could not be saved.')
        return
      }
      setSettingsMessage('Operations settings saved.')
    } catch {
      setSettingsMessage('Operations settings could not be saved.')
    }
  }

  async function refreshCosts() {
    const response = await fetch('/api/admin/inventory-costs', { cache: 'no-store' })
    const result = (await response.json()) as { ok: boolean; logs?: CostLog[] }
    if (response.ok && result.ok) {
      setCostLogs(result.logs ?? [])
    }
  }

  async function refreshCatalogRecords() {
    const response = await fetch('/api/catalog-source', { cache: 'no-store' })
    const result = (await response.json()) as { ok: boolean; records?: CatalogInventoryRecord[] }
    if (response.ok && result.ok) {
      setCatalogRecords(result.records ?? [])
    }
  }

  async function saveCostEntry() {
    if (!selectedCostRecord) {
      setCostMessage('Choose the product and strength first.')
      return
    }

    setSavingCost(true)
    setCostMessage('')

    try {
      const response = await fetch('/api/admin/inventory-costs', {
        method: editingCostId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingCostId ? { id: editingCostId } : {}),
          slug: selectedCostRecord.slug,
          productName: selectedCostRecord.displayName,
          strengthLabel: costForm.strengthLabel || `${selectedCostRecord.strength} ${selectedCostRecord.unit}`,
          vendorName: costForm.vendorName,
          unitQuantity: Number(costForm.unitQuantity || '0'),
          kitQuantity: Number(costForm.kitQuantity || '0'),
          unitsPerKit: Number(costForm.unitsPerKit || '10'),
          orderedOn: costForm.orderedOn,
          pricePerUnit: costForm.pricePerUnit,
          pricePerKit: costForm.pricePerKit,
          markIncoming: costForm.markIncoming,
        }),
      })
      const result = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !result.ok) {
        setCostMessage(result.error || 'Supply order could not be saved.')
        return
      }

      setCostMessage('Supply order saved.')
      setEditingCostId(null)
      setCostForm({
        slug: '',
        strengthLabel: '',
        vendorName: '',
        unitQuantity: '0',
        kitQuantity: '0',
        unitsPerKit: '10',
        orderedOn: new Date().toISOString().slice(0, 10),
        pricePerUnit: '',
        pricePerKit: '',
        markIncoming: true,
      })
      await Promise.all([refreshCosts(), refreshCatalogRecords()])
    } catch {
      setCostMessage('Supply order could not be saved.')
    } finally {
      setSavingCost(false)
    }
  }

  function editCostEntry(entry: CostLog) {
    setEditingCostId(entry.id)
    setCostForm({
      slug: entry.slug,
      strengthLabel: entry.strength_label,
      vendorName: entry.vendor_name ?? '',
      unitQuantity: String(entry.unit_quantity ?? 0),
      kitQuantity: String(entry.kit_quantity ?? 0),
      unitsPerKit: String(entry.units_per_kit ?? 10),
      orderedOn: entry.ordered_on,
      pricePerUnit: String(entry.price_per_unit ?? ''),
      pricePerKit: String(entry.price_per_kit ?? ''),
      markIncoming: false,
    })
  }

  async function deleteCostEntry(id: string) {
    const confirmed = window.confirm('Delete this supply order entry?')
    if (!confirmed) return

    const response = await fetch('/api/admin/inventory-costs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const result = (await response.json()) as { ok?: boolean; error?: string }
    if (!response.ok || !result.ok) {
      setCostMessage(result.error || 'Supply order could not be deleted.')
      return
    }
    setCostMessage('Supply order deleted.')
    await refreshCosts()
  }

  return (
    <AdminShell
      active="/admin"
      title="Dashboard Overview"
      description="This is the founder home screen. Orders, clients, revenue, and spending all live here first so the team can see the whole operation at a glance."
      purpose="Use this page as the command center. Start here to see what needs attention, then open the deeper section only when you need to work an individual workflow."
      workflow={[
        'Check the top numbers to see open orders, clients, revenue, and spending.',
        'Open pending orders from this page when new work comes in.',
        'Use the spending section to watch product costs and supplier movement.',
        'Move into Orders, Clients, or Catalog only when more detail is needed.',
      ]}
      teamNotes={[
        'Pending orders are anything not marked complete.',
        'Proof received means founder still needs to confirm payment.',
        'Spending totals come from the cost log in the catalog inventory page.',
      ]}
    >
      {loading ? (
        <>
          <div className="admin-tiles" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="admin-tile">
                <div className="admin-skeleton" style={{ width: '55%', height: '11px' }} />
                <div className="admin-skeleton" style={{ width: '38%', height: '30px' }} />
                <div className="admin-skeleton" style={{ width: '72%', height: '11px' }} />
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '18px', display: 'grid', gap: '14px' }} aria-hidden="true">
            <div className="admin-skeleton" style={{ width: '32%', height: '12px' }} />
            {[0, 1, 2].map((index) => (
              <div key={index} className="admin-skeleton" style={{ height: '52px' }} />
            ))}
          </div>
          <span className="section-label" role="status">
            Loading dashboard…
          </span>
        </>
      ) : (
        <>
      <div className="admin-tiles">
        {crmOn ? (
          <Link href="/admin/orders" className="admin-tile">
            <span className="section-label">Orders Today</span>
            <span className="admin-tile-value">{ordersToday}</span>
            <span className="admin-tile-hint">{pendingOrders.length} open in the queue</span>
          </Link>
        ) : null}
        {crmOn ? (
          <Link href="/admin/orders" className="admin-tile">
            <span className="section-label">Revenue</span>
            <span className="admin-tile-value">${totalRevenue.toFixed(2)}</span>
            <span className="admin-tile-hint">
              {clients.length} {clients.length === 1 ? 'client' : 'clients'} · {shippedCount} shipped
            </span>
          </Link>
        ) : null}
        {crmOn ? (
          <Link href="/admin/orders" className="admin-tile">
            <span className="section-label">Pending Payments</span>
            {/* Colored only when non-zero: draws the eye to what actually needs
                attention; stays neutral when there's nothing to chase. */}
            <span className="admin-tile-value" style={needsReviewCount > 0 ? { color: 'var(--status-amber)' } : undefined}>
              {needsReviewCount}
            </span>
            <span className="admin-tile-hint">${pendingRevenue.toFixed(2)} not yet collected</span>
          </Link>
        ) : null}
        {inventoryOn ? (
          <Link href="/admin/inventory" className="admin-tile">
            <span className="section-label">Low Stock</span>
            <span className="admin-tile-value" style={lowStockItems.length > 0 ? { color: '#B42318' } : undefined}>
              {lowStockItems.length}
            </span>
            <span className="admin-tile-hint">{outOfStockItems.length} fully out</span>
          </Link>
        ) : null}
        {!crmOn && storefrontOn ? (
          <Link href="/admin/catalog" className="admin-tile">
            <span className="section-label">Products Live</span>
            <span className="admin-tile-value">{liveProductCount}</span>
            <span className="admin-tile-hint">visible on the storefront</span>
          </Link>
        ) : null}
      </div>

      {attentionItems.length > 0 ? (
        <section aria-label="Needs attention" style={{ display: 'grid', gap: '10px' }}>
          <div className="section-label">Needs Attention</div>
          <div className="admin-attention-strip">
            {attentionItems.map((item) => (
              <Link key={item.key} href={item.href} className="admin-attention-chip">
                <span className={`admin-attention-chip-icon tone-${item.tone}`}>
                  <item.Icon size={17} aria-hidden />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
          All caught up — nothing needs attention right now.
        </div>
      )}

      {crmOn || inventoryOn ? (
      <div className="admin-overview-split">
        {crmOn ? (
        <div className="card" style={{ padding: '18px', display: 'grid', gap: '14px', alignContent: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="section-label">Recent Orders</div>
            <Link href="/admin/orders" className="fm-btn-outline" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
              Open Orders
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ display: 'grid', justifyItems: 'center', gap: '10px', padding: '28px 16px', textAlign: 'center' }}>
              <span
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '999px',
                  background: 'var(--bg-elevated)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--accent-500)',
                }}
              >
                <Store size={26} aria-hidden />
              </span>
              <strong style={{ fontSize: '17px' }}>No orders yet</strong>
              <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6 }}>
                When customers check out, new orders land here first. Share the storefront to get the first one moving.
              </p>
              <Link href="/" className="fm-btn-outline" style={{ textDecoration: 'none' }}>
                View Storefront
              </Link>
            </div>
          ) : (
            <>
              <div className="admin-segmented" role="group" aria-label="Order stage filter">
                {[
                  ['all', 'All', pendingOrders.length],
                  ['needs_review', 'To Review', needsReviewCount],
                  ['waiting_to_ship', 'To Ship', pendingOrders.filter((order) => order.status === 'waiting_to_ship').length],
                  ['shipped', 'Shipped', pendingOrders.filter((order) => order.status === 'shipped').length],
                ].map(([value, label, count]) => {
                  const active = pendingFilter === value
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      aria-pressed={active}
                      className={`admin-segment${active ? ' active' : ''}`}
                      onClick={() => setPendingFilter(value as typeof pendingFilter)}
                    >
                      {label} ({count})
                    </button>
                  )
                })}
              </div>

              <div>
                {recentFilteredPendingOrders.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '18px 4px' }}>No orders in this stage right now.</div>
                ) : (
                  recentFilteredPendingOrders.map((order) => {
                    const matchingProof = proofs.find((proof) => proof.orderId === order.id)
                    const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim() || order.customer.email || 'Guest checkout'
                    return (
                      <Link key={order.id} href={`/admin/orders?open=${order.id}`} className="admin-list-row">
                        <div className="admin-list-row-main">
                          <span className="admin-list-row-title">{customerName}</span>
                          <span className="admin-list-row-sub">
                            #{order.id} · {(() => {
                              const itemCount = order.order.lines.reduce((sum, line) => sum + line.quantity, 0)
                              return `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
                            })()} ·{' '}
                            {matchingProof ? 'Proof submitted' : 'Awaiting proof'} · {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="admin-list-row-end">
                          <span className="admin-list-row-amount">${order.order.totals.total.toFixed(2)}</span>
                          <span className={`badge ${order.status === 'shipped' ? 'badge-green' : order.status === 'waiting_to_ship' ? 'badge-blue' : 'badge-amber'}`}>
                            {order.status.replaceAll('_', ' ')}
                          </span>
                        </div>
                        <ChevronRight size={16} className="admin-row-chevron" aria-hidden />
                      </Link>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
        ) : null}

        {inventoryOn ? (
        <div className="card" style={{ padding: '18px', display: 'grid', gap: '14px', alignContent: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="section-label">Inventory Heads-Up</div>
            {supplyOn ? (
              <Link href="/admin/supply" className="fm-btn-outline" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
                Place Order
              </Link>
            ) : null}
          </div>

          <div>
            {lowStockItems.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '10px 4px' }}>
                Nothing is running low — every active listing is above {settings?.inventoryDefaults.lowStockThreshold ?? 4} on hand.
              </div>
            ) : (
              visibleLowStockItems.map((item) => (
                <Link key={item.slug} href="/admin/inventory" className="admin-list-row">
                  <div className="admin-list-row-main">
                    <span className="admin-list-row-title">{item.displayName}</span>
                    <span className="admin-list-row-sub">{item.sku}</span>
                  </div>
                  <div className="admin-list-row-end">
                    <span className="admin-list-row-amount">{item.inventoryOnHand} left</span>
                    <span className="badge badge-amber">Low Stock</span>
                  </div>
                  <ChevronRight size={16} className="admin-row-chevron" aria-hidden />
                </Link>
              ))
            )}
          </div>

          {lowStockItems.length > 6 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="fm-btn-outline" onClick={() => setShowAllLowStock((current) => !current)}>
                {showAllLowStock ? 'Show Less' : `View More (${lowStockItems.length - 6} more)`}
              </button>
            </div>
          ) : null}

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'grid', gap: '8px' }}>
            <div className="section-label">Out of Stock</div>
            {sortedOutOfStockItems.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '4px' }}>Nothing is fully out right now.</div>
            ) : (
              <div>
                {sortedOutOfStockItems.map((item) => (
                  <Link key={`${item.slug}-out`} href="/admin/inventory" className="admin-list-row">
                    <div className="admin-list-row-main">
                      <span className="admin-list-row-title">{item.displayName}</span>
                      <span className="admin-list-row-sub">{item.sku}</span>
                    </div>
                    <div className="admin-list-row-end">
                      <span className="admin-list-row-amount">{item.inventoryOnHand ?? 0} left</span>
                      <span className="badge badge-muted">Out of Stock</span>
                    </div>
                    <ChevronRight size={16} className="admin-row-chevron" aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        ) : null}
      </div>
      ) : null}

      {supplyOn ? (
      <details id="supply-orders" className="card admin-disclosure" style={{ scrollMarginTop: '120px' }}>
        <summary>
          <span style={{ display: 'grid', gap: '4px' }}>
            <span className="section-label">Supply & Spending</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>
              ${totalSpend.toFixed(2)} spent · {costLogs.length} {costLogs.length === 1 ? 'order' : 'orders'} logged — tap to log a vendor order
            </span>
          </span>
          <ChevronDown size={18} className="admin-disclosure-chevron" aria-hidden />
        </summary>
        <div className="admin-disclosure-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/admin/supply" className="fm-btn-outline" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
              Open Supply
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ padding: '16px', display: 'grid', gap: '6px' }}>
              <div className="section-label">Cost Entries</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{costLogs.length}</div>
            </div>
            <div className="card" style={{ padding: '16px', display: 'grid', gap: '6px' }}>
              <div className="section-label">Total Spend</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>${totalSpend.toFixed(2)}</div>
            </div>
            <div className="card" style={{ padding: '16px', display: 'grid', gap: '6px' }}>
              <div className="section-label">Revenue Less Spend</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>${(totalRevenue - totalSpend).toFixed(2)}</div>
            </div>
            <div className="card" style={{ padding: '16px', display: 'grid', gap: '6px' }}>
              <div className="section-label">Avg Spend / Unit</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>${historicalAverageSpendPerUnit.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Product</label>
                <select
                  value={costForm.slug}
                  onChange={(event) => {
                    const slug = event.target.value
                    const record = catalogRecords.find((item) => item.slug === slug)
                    setCostForm((current) => ({
                      ...current,
                      slug,
                      strengthLabel: record ? `${record.strength} ${record.unit}` : '',
                    }))
                  }}
                  style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }}
                >
                  <option value="">Select product</option>
                  {catalogRecords.filter((record) => !record.archived).map((record) => (
                    <option key={record.slug} value={record.slug}>
                      {record.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Strength</label>
                <input value={costForm.strengthLabel} onChange={(event) => setCostForm((current) => ({ ...current, strengthLabel: event.target.value }))} style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Vendor</label>
                <input value={costForm.vendorName} onChange={(event) => setCostForm((current) => ({ ...current, vendorName: event.target.value }))} placeholder="Distributor" style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Date Ordered</label>
                <input type="date" value={costForm.orderedOn} onChange={(event) => setCostForm((current) => ({ ...current, orderedOn: event.target.value }))} style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Units Ordered</label>
                <input type="number" min="0" value={costForm.unitQuantity} onChange={(event) => setCostForm((current) => ({ ...current, unitQuantity: event.target.value }))} style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Kits Ordered</label>
                <input type="number" min="0" value={costForm.kitQuantity} onChange={(event) => setCostForm((current) => ({ ...current, kitQuantity: event.target.value }))} style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Units Per Kit</label>
                <input type="number" min="1" value={costForm.unitsPerKit} onChange={(event) => setCostForm((current) => ({ ...current, unitsPerKit: event.target.value }))} style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Price Per Unit</label>
                <input value={costForm.pricePerUnit} onChange={(event) => setCostForm((current) => ({ ...current, pricePerUnit: event.target.value }))} placeholder="$0.00" style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label className="section-label">Price Per Kit</label>
                <input value={costForm.pricePerKit} onChange={(event) => setCostForm((current) => ({ ...current, pricePerKit: event.target.value }))} placeholder="$0.00" style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <input type="checkbox" checked={costForm.markIncoming} onChange={(event) => setCostForm((current) => ({ ...current, markIncoming: event.target.checked }))} />
                Mark matching product as incoming
              </label>
              <button type="button" className="fm-btn-primary" onClick={saveCostEntry} disabled={savingCost}>
                {savingCost ? 'Saving...' : editingCostId ? 'Update Supply Order' : 'Save Supply Order'}
              </button>
            </div>
          </div>

          {costMessage ? <div style={{ color: 'var(--text-secondary)' }}>{costMessage}</div> : null}

          <div style={{ marginTop: '4px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'grid', gap: '10px' }}>
            <div>
              <div className="section-label">Recent Supply Orders</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
                Review all logged replenishment orders, vendor costs, and quantities here.
              </div>
            </div>
            {costLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No cost entries saved yet.</div>
            ) : (
              costLogs.map((entry) => (
                <div key={entry.id} className="card" style={{ padding: '14px', display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{entry.product_name}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{entry.strength_label}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>${Number(entry.cost_paid || 0).toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Vendor</div>
                      <div style={{ marginTop: '4px' }}>{entry.vendor_name || 'No vendor'}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Ordered</div>
                      <div style={{ marginTop: '4px' }}>{entry.ordered_on}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Units</div>
                      <div style={{ marginTop: '4px' }}>{entry.unit_quantity ?? 0}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Kits</div>
                      <div style={{ marginTop: '4px' }}>{entry.kit_quantity ?? 0}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Units Per Kit</div>
                      <div style={{ marginTop: '4px' }}>{entry.units_per_kit ?? 10}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Per Unit</div>
                      <div style={{ marginTop: '4px' }}>${Number(entry.price_per_unit || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Per Kit</div>
                      <div style={{ marginTop: '4px' }}>${Number(entry.price_per_kit || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div className="section-label" style={{ fontSize: '11px' }}>Avg / Unit</div>
                      <div style={{ marginTop: '4px' }}>${getSupplyOrderAveragePricePerUnit(entry).toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button type="button" className="fm-btn-outline" style={{ padding: '8px 10px', fontSize: '12px' }} onClick={() => editCostEntry(entry)}>
                      Edit
                    </button>
                    <button type="button" className="fm-btn-outline" style={{ padding: '8px 10px', fontSize: '12px' }} onClick={() => deleteCostEntry(entry.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </details>
      ) : null}

      {storefrontOn ? (
      <details className="card admin-disclosure">
        <summary>
          <span style={{ display: 'grid', gap: '4px' }}>
            <span className="section-label">Shipping & Tax Settings</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>
              Manual operations while checkout shipping and tax rules are finalized
            </span>
          </span>
          <ChevronDown size={18} className="admin-disclosure-chevron" aria-hidden />
        </summary>
        <div className="admin-disclosure-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label className="section-label">Shipping Mode</label>
              <select
                value={settings?.checkoutOperations.shippingMode ?? 'manual_review'}
                onChange={(event) =>
                  setSettings((current) => current ? ({
                    ...current,
                    checkoutOperations: {
                      ...current.checkoutOperations,
                      shippingMode: event.target.value as AdminSettingsPayload['checkoutOperations']['shippingMode'],
                    },
                  }) : current)
                }
                style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }}
              >
                <option value="manual_review">Manual Review</option>
                <option value="flat_rate">Flat Rate</option>
                <option value="tiered_placeholder">Tiered Placeholder</option>
              </select>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label className="section-label">Tax Mode</label>
              <select
                value={settings?.checkoutOperations.taxMode ?? 'pending_review'}
                onChange={(event) =>
                  setSettings((current) => current ? ({
                    ...current,
                    checkoutOperations: {
                      ...current.checkoutOperations,
                      taxMode: event.target.value as AdminSettingsPayload['checkoutOperations']['taxMode'],
                    },
                  }) : current)
                }
                style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }}
              >
                <option value="pending_review">Pending Review</option>
                <option value="not_charging">Not Charging</option>
                <option value="collect_at_checkout">Collect at Checkout</option>
              </select>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label className="section-label">Flat Rate</label>
              <input
                value={settings?.checkoutOperations.flatRate ?? ''}
                onChange={(event) =>
                  setSettings((current) => current ? ({
                    ...current,
                    checkoutOperations: {
                      ...current.checkoutOperations,
                      flatRate: event.target.value,
                    },
                  }) : current)
                }
                placeholder="$0.00"
                style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label className="section-label">Free Shipping</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', minHeight: '46px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', padding: '12px 14px' }}>
                <input
                  type="checkbox"
                  checked={settings?.checkoutOperations.freeShippingEnabled ?? true}
                  onChange={(event) =>
                    setSettings((current) => current ? ({
                      ...current,
                      checkoutOperations: {
                        ...current.checkoutOperations,
                        freeShippingEnabled: event.target.checked,
                      },
                    }) : current)
                  }
                />
                Enable threshold override
              </label>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label className="section-label">Free Shipping Threshold</label>
              <input
                value={settings?.checkoutOperations.freeShippingThreshold ?? ''}
                onChange={(event) =>
                  setSettings((current) => current ? ({
                    ...current,
                    checkoutOperations: {
                      ...current.checkoutOperations,
                      freeShippingThreshold: event.target.value,
                    },
                  }) : current)
                }
                placeholder="$300"
                style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label className="section-label">Tax Rate</label>
              <input
                value={settings?.checkoutOperations.taxRate ?? ''}
                onChange={(event) =>
                  setSettings((current) => current ? ({
                    ...current,
                    checkoutOperations: {
                      ...current.checkoutOperations,
                      taxRate: event.target.value,
                    },
                  }) : current)
                }
                placeholder="8"
                style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'grid', gap: '8px', gridColumn: '1 / -1' }}>
              <label className="section-label">Notes</label>
              <textarea
                value={settings?.checkoutOperations.notes ?? ''}
                onChange={(event) =>
                  setSettings((current) => current ? ({
                    ...current,
                    checkoutOperations: {
                      ...current.checkoutOperations,
                      notes: event.target.value,
                    },
                  }) : current)
                }
                rows={2}
                style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '12px 14px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Keep this as the working source of truth until checkout shipping and tax are finalized.
            </div>
            <button type="button" className="fm-btn-primary" onClick={saveCheckoutOperations}>
              Save Settings
            </button>
          </div>
          {settingsMessage ? <div style={{ color: 'var(--text-secondary)' }}>{settingsMessage}</div> : null}
        </div>
      </details>
      ) : null}
        </>
      )}
    </AdminShell>
  )
}
