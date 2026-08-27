import type { OrderDraft } from '@/lib/cart'

export const MANUAL_ORDER_STORAGE_KEY = 'factory_manual_orders_v1'
export const CHECKOUT_FORM_STORAGE_KEY = 'factory_checkout_form_v1'
export const PAYMENT_PROOF_STORAGE_KEY = 'factory_payment_proofs_v1'

export type ManualPaymentMethod = 'bank_transfer' | 'invoice' | 'card' | 'cashapp' | 'paypal' | 'venmo' | 'crypto' | 'zelle' | 'other'
export type ManualOrderStatus =
  | 'submitted'
  | 'payment_pending'
  | 'proof_received'
  | 'waiting_to_ship'
  | 'shipped'
  | 'ready_to_fulfill'
  | 'fulfilled'

export interface ManualOrderCustomer {
  email: string
  firstName: string
  lastName: string
  phone: string
}

export interface ManualOrderAddress {
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface ManualOrderSubmission {
  id: string
  createdAt: string
  status: ManualOrderStatus
  paymentMethod: ManualPaymentMethod
  order: OrderDraft
  customer: ManualOrderCustomer
  shippingAddress: ManualOrderAddress
  billingAddress: ManualOrderAddress
  notes?: string
  paymentProofStatus: 'not_received' | 'submitted' | 'confirmed'
  fulfillmentNotes?: string
  trackingCarrier?: string
  trackingNumber?: string
  packageType?: 'padded_envelope' | 'bubble_mailer' | 'small_box' | 'medium_box' | 'large_box' | 'tube' | 'other'
  packageDetails?: string
  shipmentPhotoName?: string
  shipmentPhotoPreviewUrl?: string
  labelDocumentName?: string
  labelDocumentUrl?: string
  labelDocumentType?: string
  labelExtraction?: {
    carrier?: string
    trackingNumber?: string
    packageDetails?: string
    recipientName?: string
    recipientAddress?: {
      address1?: string
      address2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
      raw?: string
      source?: 'label' | 'order'
    }
    confidence?: 'low' | 'medium' | 'high'
    rawTextPreview?: string
    extractedAt?: string
  }
  fulfillmentUpdatedAt?: string
  affiliateId?: string
  affiliateCode?: string
  affiliateName?: string
  affiliateSource?: 'link' | 'code'
  affiliateLandingPath?: string
  inventoryChangeSummary?: Array<{
    slug: string
    displayName: string
    strengthLabel: string
    quantityDeducted: number
    previousInventory: number | null
    nextInventory: number
  }>
  inventoryAdjustedAt?: string
}

export interface ManualPaymentProofSubmission {
  id: string
  orderId: string
  createdAt: string
  customerName: string
  customerEmail: string
  paymentMethod: ManualPaymentMethod
  amountPaid: number
  transactionReference: string
  notes?: string
  screenshotName?: string
  screenshotPreviewUrl?: string
  status: 'submitted' | 'reviewed'
}

export interface ManualPaymentInstructions {
  method: ManualPaymentMethod
  label: string
  destination: string
  link?: string
  detail: string
  caution: string
}

export type ManualPaymentMethodConfig = {
  method: ManualPaymentMethod
  label?: string
  destination?: string
  link?: string
  detail?: string
  enabled?: boolean
}

export type ManualPaymentBusinessSettings = {
  paymentMethods?: ManualPaymentMethodConfig[]
}

export const MANUAL_PAYMENT_INSTRUCTIONS: Record<ManualPaymentMethod, ManualPaymentInstructions> = {
  bank_transfer: {
    method: 'bank_transfer',
    label: 'Bank Transfer / Wire',
    destination: 'Account details provided with your order confirmation',
    detail: 'Send the order total by bank transfer (ACH/wire) using the account details shown with your order confirmation.',
    caution: 'Include your Order ID in the transfer reference so the payment can be matched to your order.',
  },
  invoice: {
    method: 'invoice',
    label: 'Invoice',
    destination: 'Invoice sent to your email after order review',
    detail: 'Your order is reviewed and a formal invoice is emailed to you with payment options. Fulfillment begins once the invoice is paid.',
    caution: 'The invoice references your Order ID. Reply to the invoice email with any questions.',
  },
  card: {
    method: 'card',
    label: 'Card (Stripe)',
    destination: 'Secure online payment',
    detail: 'Pay by credit or debit card through Stripe secure checkout.',
    caution: 'You will be redirected to a secure Stripe page to complete payment.',
  },
  cashapp: {
    method: 'cashapp',
    label: 'Cash App',
    destination: '$yourcashapp',
    link: 'https://cash.app/$yourcashapp',
    detail: 'Send the full order amount through Cash App using the destination shown above.',
    caution: 'Include your Order ID in the payment note so the payment can be matched to your order.',
  },
  paypal: {
    method: 'paypal',
    label: 'PayPal',
    destination: 'founder-paypal@example.com',
    detail: 'Send the full order amount through PayPal using the founder payment account.',
    caution: 'Include your Order ID in the payment note so the payment can be matched to your order.',
  },
  venmo: {
    method: 'venmo',
    label: 'Venmo',
    destination: '@yourvenmo',
    detail: 'Send the full order amount through Venmo using the handle shown above.',
    caution: 'Include your Order ID in the payment note so the payment can be matched to your order.',
  },
  crypto: {
    method: 'crypto',
    label: 'Crypto',
    destination: 'Wallet provided after order review',
    detail: 'Use this option if founder has provided the current wallet and chain instructions for your order.',
    caution: 'Please confirm the wallet details carefully before sending payment, then submit proof on the next step.',
  },
  zelle: {
    method: 'zelle',
    label: 'Zelle',
    destination: 'payments@example.com',
    detail: 'Send the full order amount through Zelle using the destination shown above.',
    caution: 'Include your Order ID in the payment note so the payment can be matched to your order.',
  },
  other: {
    method: 'other',
    label: 'Other',
    destination: 'Details provided after order review',
    detail: 'Use the payment destination and instructions shown here for this order.',
    caution: 'Include your Order ID in the payment note so the payment can be matched to your order.',
  },
}

export function buildManualPaymentLink(method: ManualPaymentMethod, destination: string) {
  const trimmed = destination.trim()
  if (!trimmed) return undefined
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (method === 'cashapp') return `https://cash.app/${trimmed.startsWith('$') ? trimmed : `$${trimmed}`}`
  if (method === 'venmo') return `https://venmo.com/${trimmed.replace(/^@/, '')}`
  return undefined
}

export function getConfiguredManualPaymentInstructions(
  method: ManualPaymentMethod,
  businessDetails?: ManualPaymentBusinessSettings | null,
): ManualPaymentInstructions {
  const fallback = MANUAL_PAYMENT_INSTRUCTIONS[method] ?? MANUAL_PAYMENT_INSTRUCTIONS.other
  const saved = businessDetails?.paymentMethods?.find((entry) => entry.method === method)
  const destination = saved?.destination?.trim() || fallback.destination
  const link = saved?.link?.trim() || buildManualPaymentLink(method, destination) || fallback.link

  return {
    method,
    label: saved?.label?.trim() || fallback.label,
    destination,
    link,
    detail: saved?.detail?.trim() || fallback.detail,
    caution: fallback.caution,
  }
}

export function getEnabledManualPaymentMethods(businessDetails?: ManualPaymentBusinessSettings | null) {
  const savedMethods = businessDetails?.paymentMethods
  if (!savedMethods?.length) {
    return Object.values(MANUAL_PAYMENT_INSTRUCTIONS).filter((method) =>
      method.method === 'cashapp' || method.method === 'paypal' || method.method === 'venmo',
    )
  }

  const enabled = savedMethods
    .filter((entry) => entry.enabled !== false)
    .map((entry) => getConfiguredManualPaymentInstructions(entry.method, businessDetails))

  return enabled.length ? enabled : [getConfiguredManualPaymentInstructions('paypal', businessDetails)]
}

export function getManualOrderStatusLabel(status: ManualOrderStatus) {
  return {
    submitted: 'Submitted',
    payment_pending: 'Payment Pending',
    proof_received: 'Proof Received',
    waiting_to_ship: 'Waiting to Ship',
    shipped: 'Shipped',
    ready_to_fulfill: 'Waiting to Ship',
    fulfilled: 'Completed',
  }[status]
}

export const PACKAGE_TYPE_OPTIONS: Array<{
  value: NonNullable<ManualOrderSubmission['packageType']>
  label: string
}> = [
  { value: 'padded_envelope', label: 'Padded Envelope' },
  { value: 'bubble_mailer', label: 'Bubble Mailer' },
  { value: 'small_box', label: 'Small Box' },
  { value: 'medium_box', label: 'Medium Box' },
  { value: 'large_box', label: 'Large Box' },
  { value: 'tube', label: 'Tube' },
  { value: 'other', label: 'Other' },
]

export const SHIPPING_CARRIER_OPTIONS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other'] as const

export function loadManualOrders(): ManualOrderSubmission[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MANUAL_ORDER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ManualOrderSubmission[]) : []
  } catch {
    return []
  }
}

export function saveManualOrders(orders: ManualOrderSubmission[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MANUAL_ORDER_STORAGE_KEY, JSON.stringify(orders))
}

export function appendManualOrder(order: ManualOrderSubmission) {
  const current = loadManualOrders()
  saveManualOrders([order, ...current])
}

export function findManualOrder(orderId: string) {
  return loadManualOrders().find((order) => order.id === orderId) ?? null
}

export function replaceManualOrder(updatedOrder: ManualOrderSubmission) {
  const current = loadManualOrders()
  const next = current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
  saveManualOrders(next)
}

export function loadPaymentProofs(): ManualPaymentProofSubmission[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PAYMENT_PROOF_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ManualPaymentProofSubmission[]) : []
  } catch {
    return []
  }
}

export function savePaymentProofs(proofs: ManualPaymentProofSubmission[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PAYMENT_PROOF_STORAGE_KEY, JSON.stringify(proofs))
}

export function appendPaymentProof(proof: ManualPaymentProofSubmission) {
  const current = loadPaymentProofs()
  savePaymentProofs([proof, ...current])
}

export function buildManualOrderSummary(order: ManualOrderSubmission) {
  const lines = order.order.lines
    .map(
      (line) =>
        `- ${line.displayName} (${line.strengthLabel || 'n/a'}, ${line.formatType}) x ${line.quantity} = $${(line.lineTotal ?? line.lineSubtotal).toFixed(2)}${line.freeUnits ? ` (${line.freeUnits} free)` : ''}`,
    )
    .join('\n')

  return [
    `Order ID: ${order.id}`,
    `Created: ${order.createdAt}`,
    `Payment Method: ${order.paymentMethod.toUpperCase()}`,
    '',
    `Customer: ${order.customer.firstName} ${order.customer.lastName}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone}`,
    '',
    'Shipping Address:',
    `${order.shippingAddress.address1}`,
    order.shippingAddress.address2 || '',
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
    `${order.shippingAddress.country}`,
    '',
    'Items:',
    lines,
    '',
    `Subtotal: $${order.order.totals.subtotal.toFixed(2)}`,
    `Promotion savings: $${order.order.totals.discount.toFixed(2)}`,
    `Total: $${order.order.totals.total.toFixed(2)}`,
    '',
    'Notes:',
    order.notes || 'None provided',
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildManualOrderMailto(order: ManualOrderSubmission, email: string, businessName = 'Demo Business') {
  const subject = encodeURIComponent(`${businessName} manual order ${order.id}`)
  const body = encodeURIComponent(
    `${buildManualOrderSummary(order)}\n\nPlease confirm receipt of this order and payment instructions for ${order.paymentMethod.toUpperCase()}.`,
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
}

export function buildShipmentConfirmationMailto(order: ManualOrderSubmission, businessName = 'Demo Business') {
  const subject = encodeURIComponent(`Your ${businessName} order ${order.id} has shipped`)
  const body = encodeURIComponent(
    [
      `Hello ${order.customer.firstName || 'there'},`,
      '',
      `Your ${businessName} order ${order.id} has shipped.`,
      '',
      `Carrier: ${order.trackingCarrier || 'Not provided yet'}`,
      `Tracking Number: ${order.trackingNumber || 'Not provided yet'}`,
      `Package Info: ${order.packageDetails || 'Not provided'}`,
      '',
      'Thank you,',
      businessName,
    ].join('\n'),
  )

  return `mailto:${order.customer.email}?subject=${subject}&body=${body}`
}
