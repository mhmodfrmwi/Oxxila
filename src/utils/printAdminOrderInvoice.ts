// src/utils/printAdminOrderInvoice.ts
import logoIcon from '../assets/oxxila-logo-mark.svg'
import logoWordmark from '../assets/Oxxila.svg'
import type { AdminOrderDetail } from '../types/adminOrders'
import {
  formatAdminOrderDateTime,
  formatAdminOrderMoney,
} from './adminOrdersFormat'

export interface OrderInvoiceLabels {
  documentTitle: string
  brand: string
  invoice: string
  order: string
  date: string
  billTo: string
  shipTo: string
  phone: string
  email: string
  items: string
  product: string
  qty: string
  unitPrice: string
  lineTotal: string
  subtotal: string
  shipping: string
  discount: string
  storeCredit: string
  coupon: string
  total: string
  payment: string
  paymentStatus: string
  carrier: string
  carrierNotSelected: string
  tracking: string
  orderDetails: string
  thankYou: string
  thankYouSub: string
  print: string
  download: string
  printFailed: string
  languageEnglish: string
  languageArabic: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function assetHref(importedUrl: string): string {
  return new URL(importedUrl, window.location.origin).href
}

function formatAddress(order: AdminOrderDetail): string {
  const address = order.shippingAddress
  if (!address) return order.zoneLabel ?? '—'
  return (
    [
      address.addressLine,
      address.districtName,
      address.governorateName,
      address.countryName,
    ]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(', ') ||
    order.zoneLabel ||
    '—'
  )
}

function resolveCarrierLabel(order: AdminOrderDetail, notSelected: string): string {
  const carrier = order.carrierName?.trim()
  if (order.hasAssignedCarrier && carrier) return carrier
  return notSelected
}

function buildInvoiceSheet(
  order: AdminOrderDetail,
  labels: OrderInvoiceLabels,
  locale: string,
  logoIconUrl: string,
  logoWordmarkUrl: string,
): string {
  const money = (value: number) => formatAdminOrderMoney(value, locale)
  const date = formatAdminOrderDateTime(order.createdAt, locale)
  const carrierLabel = resolveCarrierLabel(order, labels.carrierNotSelected)

  const trackingMeta = order.trackingNumber?.trim()
    ? `<div class="meta-item">
            <span class="label">${escapeHtml(labels.tracking)}</span>
            <span class="value">${escapeHtml(order.trackingNumber.trim())}</span>
          </div>`
    : ''

  const itemRows =
    order.items.length === 0
      ? `<tr><td colspan="4" class="empty">—</td></tr>`
      : order.items
          .map((item) => {
            const qty = Number(item.quantity) || 0
            const unit = Number(item.price) || 0
            const line = unit * qty
            return `<tr>
              <td class="product">${escapeHtml(item.name)}</td>
              <td class="center">${qty}</td>
              <td class="end nowrap">${escapeHtml(money(unit))}</td>
              <td class="end nowrap strong">${escapeHtml(money(line))}</td>
            </tr>`
          })
          .join('')

  const discountRow =
    order.discountAmount > 0
      ? `<div class="total-row">
          <span>${escapeHtml(labels.discount)}${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ''}</span>
          <span class="save">−${escapeHtml(money(order.discountAmount))}</span>
        </div>`
      : ''

  const creditRow =
    order.storeCreditApplied > 0
      ? `<div class="total-row">
          <span>${escapeHtml(labels.storeCredit)}</span>
          <span class="save">−${escapeHtml(money(order.storeCreditApplied))}</span>
        </div>`
      : ''

  const phone = order.customerPhone
    ? `<p class="detail-line">${escapeHtml(labels.phone)}: <strong>${escapeHtml(order.customerPhone)}</strong></p>`
    : ''
  const email = order.customerEmail
    ? `<p class="detail-line">${escapeHtml(labels.email)}: <strong>${escapeHtml(order.customerEmail)}</strong></p>`
    : ''

  const subtotal =
    order.subtotal > 0
      ? order.subtotal
      : order.items.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
          0,
        )

  return `<article class="sheet" data-locale="${escapeHtml(locale)}">
      <header class="topbar">
        <div class="brand">
          <img class="icon" src="${logoIconUrl}" alt="" />
          <img class="wordmark" src="${logoWordmarkUrl}" alt="${escapeHtml(labels.brand)}" />
        </div>
        <div class="invoice-badge">
          <p class="kicker">${escapeHtml(labels.invoice)}</p>
          <p class="number">${escapeHtml(order.orderNumber)}</p>
          <p class="date">${escapeHtml(labels.date)}: ${escapeHtml(date)}</p>
        </div>
      </header>

      <div class="body">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="label">${escapeHtml(labels.payment)}</span>
            <span class="value">${escapeHtml(order.paymentSummary)}</span>
          </div>
          <div class="meta-item">
            <span class="label">${escapeHtml(labels.paymentStatus)}</span>
            <span class="value">${escapeHtml(order.paymentStatusLabel)}</span>
          </div>
          <div class="meta-item">
            <span class="label">${escapeHtml(labels.carrier)}</span>
            <span class="value${order.hasAssignedCarrier && order.carrierName ? '' : ' muted-value'}">${escapeHtml(carrierLabel)}</span>
          </div>
          ${trackingMeta}
        </div>

        <div class="parties">
          <section class="party">
            <h2>${escapeHtml(labels.billTo)}</h2>
            <p class="name">${escapeHtml(order.customerName)}</p>
            ${phone}
            ${email}
          </section>
          <section class="party">
            <h2>${escapeHtml(labels.shipTo)}</h2>
            <p class="detail-line" style="margin:0;color:var(--ink);font-size:14px;">${escapeHtml(formatAddress(order))}</p>
          </section>
        </div>

        <h2 class="section-title">${escapeHtml(labels.items)}</h2>
        <table class="items">
          <thead>
            <tr>
              <th>${escapeHtml(labels.product)}</th>
              <th class="center">${escapeHtml(labels.qty)}</th>
              <th class="end">${escapeHtml(labels.unitPrice)}</th>
              <th class="end">${escapeHtml(labels.lineTotal)}</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div class="totals-wrap">
          <div class="totals">
            <div class="totals-head">${escapeHtml(labels.orderDetails)}</div>
            <div class="totals-body">
              <div class="total-row">
                <span>${escapeHtml(labels.subtotal)}</span>
                <span>${escapeHtml(money(subtotal))}</span>
              </div>
              <div class="total-row">
                <span>${escapeHtml(labels.shipping)}</span>
                <span>${escapeHtml(money(order.shippingPrice))}</span>
              </div>
              ${discountRow}
              ${creditRow}
              <div class="total-row grand">
                <span>${escapeHtml(labels.total)}</span>
                <span>${escapeHtml(money(order.totalPrice))}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p class="footer-main">${escapeHtml(labels.thankYou)}</p>
          <p class="footer-sub">${escapeHtml(labels.thankYouSub)}</p>
        </div>
      </div>
    </article>`
}

function buildInvoiceHtml(
  order: AdminOrderDetail,
  labelsByLocale: { en: OrderInvoiceLabels; ar: OrderInvoiceLabels },
  initialLocale: string,
): string {
  const initial = initialLocale.startsWith('ar') ? 'ar' : 'en'
  const logoIconUrl = escapeHtml(assetHref(logoIcon))
  const logoWordmarkUrl = escapeHtml(assetHref(logoWordmark))
  const sheetEn = buildInvoiceSheet(order, labelsByLocale.en, 'en', logoIconUrl, logoWordmarkUrl)
  const sheetAr = buildInvoiceSheet(order, labelsByLocale.ar, 'ar', logoIconUrl, logoWordmarkUrl)
  const uiLabels = labelsByLocale[initial]

  return `<!DOCTYPE html>
<html lang="${initial}" dir="${initial === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(uiLabels.documentTitle)} ${escapeHtml(order.orderNumber)}</title>
  <style>
    :root {
      --ink: #1a1733;
      --muted: #6f6b8f;
      --line: #ddd9ef;
      --soft: #f8f7fc;
      --brand: #7b65fb;
      --brand-soft: #9179d2;
      --save: #0d8a52;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background: #eceaf5;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: 800px;
      margin: 24px auto 36px;
      padding: 0 16px 20px;
    }
    .sheet {
      background: #fff;
      border: 1px solid var(--line);
      overflow: hidden;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      padding: 28px 32px 22px;
      border-bottom: 3px solid var(--brand);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .brand img.icon {
      width: 52px;
      height: 52px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .brand img.wordmark {
      height: 28px;
      width: auto;
      object-fit: contain;
    }
    .invoice-badge {
      text-align: end;
      flex-shrink: 0;
    }
    .invoice-badge .kicker {
      margin: 0;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 700;
    }
    .invoice-badge .number {
      margin: 6px 0 0;
      font-size: 24px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.02em;
    }
    .invoice-badge .date {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--muted);
    }
    .body { padding: 24px 32px 32px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 24px;
      margin-bottom: 24px;
      padding: 18px 20px;
      background: var(--soft);
      border: 1px solid var(--line);
    }
    .meta-item .label {
      display: block;
      margin-bottom: 4px;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 700;
    }
    .meta-item .value {
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.4;
    }
    .meta-item .value.muted-value {
      color: var(--muted);
      font-weight: 500;
      font-style: italic;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .party {
      border: 1px solid var(--line);
      padding: 16px 18px;
      min-height: 110px;
    }
    .party h2 {
      margin: 0 0 10px;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 700;
    }
    .party .name {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.35;
    }
    .detail-line {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--muted);
      line-height: 1.45;
    }
    .detail-line strong { color: var(--ink); font-weight: 600; }
    .section-title {
      margin: 0 0 10px;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 700;
    }
    table.items {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      border: 1px solid var(--line);
    }
    table.items thead th {
      background: var(--ink);
      color: #fff;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
      padding: 11px 14px;
      text-align: start;
      border-bottom: 1px solid var(--line);
    }
    table.items tbody td {
      padding: 13px 14px;
      border-bottom: 1px solid var(--line);
      vertical-align: middle;
    }
    table.items tbody tr:nth-child(even) td { background: #faf9fd; }
    table.items tbody tr:last-child td { border-bottom: none; }
    .product { font-weight: 600; }
    .center { text-align: center; }
    .end { text-align: end; }
    .nowrap { white-space: nowrap; }
    .strong { font-weight: 700; }
    .empty { padding: 18px; color: var(--muted); text-align: center; }
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 22px;
    }
    .totals {
      width: min(100%, 300px);
      border: 1px solid var(--line);
      background: #fff;
    }
    .totals-head {
      padding: 10px 16px;
      background: var(--soft);
      border-bottom: 1px solid var(--line);
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 700;
    }
    .totals-body { padding: 12px 16px 14px; }
    .total-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 6px 0;
      font-size: 14px;
      color: var(--muted);
    }
    .total-row span:last-child { color: var(--ink); font-weight: 600; }
    .total-row .save { color: var(--save); }
    .total-row.grand {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 2px solid var(--ink);
      color: var(--ink);
      font-size: 16px;
      font-weight: 700;
    }
    .total-row.grand span:last-child { color: var(--brand); font-size: 18px; }
    .footer {
      margin-top: 28px;
      padding: 22px 24px;
      border-top: 1px solid var(--line);
      text-align: center;
      background: linear-gradient(180deg, #fff 0%, var(--soft) 100%);
    }
    .footer-main {
      margin: 0;
      color: var(--brand-deep);
      font-size: 15px;
      font-weight: 600;
      line-height: 1.6;
      font-style: italic;
    }
    .footer-sub {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.55;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
    }
    .lang-switch {
      display: inline-flex;
      padding: 4px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid var(--line);
      box-shadow: 0 8px 24px rgba(61, 48, 130, 0.08);
    }
    .lang-btn {
      appearance: none;
      border: none;
      cursor: pointer;
      min-width: 88px;
      padding: 10px 16px;
      border-radius: 8px;
      background: transparent;
      color: var(--muted);
      font-size: 14px;
      font-weight: 600;
    }
    .lang-btn.active {
      background: var(--brand);
      color: #fff;
    }
    .lang-btn:hover:not(.active) { background: var(--soft); color: var(--ink); }
    .sheet[hidden] { display: none !important; }
    .print-btn {
      appearance: none;
      border: none;
      cursor: pointer;
      min-width: 220px;
      padding: 14px 28px;
      border-radius: 8px;
      background: var(--brand);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .print-btn:hover { filter: brightness(1.05); }
    .print-btn:active { transform: translateY(1px); }
    .download-btn {
      appearance: none;
      border: 1.5px solid var(--brand);
      cursor: pointer;
      min-width: 180px;
      padding: 13px 24px;
      border-radius: 8px;
      background: #fff;
      color: var(--brand);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .download-btn:hover { background: var(--soft); }
    .download-btn:active { transform: translateY(1px); }
    .action-group {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    @media (max-width: 720px) {
      .topbar, .parties, .meta-grid { grid-template-columns: 1fr; display: grid; }
      .topbar { padding: 22px; }
      .body { padding: 20px 22px 24px; }
      .invoice-badge { text-align: start; }
    }
    @media print {
      body { background: #fff; }
      .page { margin: 0; max-width: none; padding: 0; }
      .sheet { border: none; }
      .sheet[hidden] { display: none !important; }
      .actions { display: none !important; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div id="invoice-en"${initial === 'en' ? '' : ' hidden'}>${sheetEn}</div>
    <div id="invoice-ar"${initial === 'ar' ? '' : ' hidden'}>${sheetAr}</div>

    <div class="actions">
      <div class="lang-switch" role="group" aria-label="Invoice language">
        <button type="button" class="lang-btn${initial === 'en' ? ' active' : ''}" data-locale="en" onclick="setInvoiceLocale('en')">
          ${escapeHtml(uiLabels.languageEnglish)}
        </button>
        <button type="button" class="lang-btn${initial === 'ar' ? ' active' : ''}" data-locale="ar" onclick="setInvoiceLocale('ar')">
          ${escapeHtml(uiLabels.languageArabic)}
        </button>
      </div>
      <div class="action-group">
        <button type="button" class="download-btn" id="download-btn" onclick="downloadInvoice()">
          ${escapeHtml(uiLabels.download)}
        </button>
        <button type="button" class="print-btn" id="print-btn" onclick="window.print()">
          ${escapeHtml(uiLabels.print)}
        </button>
      </div>
    </div>
  </div>
  <script>
    var invoiceOrderNumber = ${JSON.stringify(order.orderNumber)};

    function currentInvoiceLocale() {
      return document.getElementById('invoice-ar').hidden ? 'en' : 'ar';
    }

    function updateActionLabels(locale) {
      var isAr = locale === 'ar';
      var labels = ${JSON.stringify({
        en: { print: labelsByLocale.en.print, download: labelsByLocale.en.download },
        ar: { print: labelsByLocale.ar.print, download: labelsByLocale.ar.download },
      })};
      var printBtn = document.getElementById('print-btn');
      var downloadBtn = document.getElementById('download-btn');
      if (printBtn) printBtn.textContent = isAr ? labels.ar.print : labels.en.print;
      if (downloadBtn) downloadBtn.textContent = isAr ? labels.ar.download : labels.en.download;
    }

    function setInvoiceLocale(locale) {
      var isAr = locale === 'ar';
      document.documentElement.lang = isAr ? 'ar' : 'en';
      document.documentElement.dir = isAr ? 'rtl' : 'ltr';
      document.getElementById('invoice-en').hidden = isAr;
      document.getElementById('invoice-ar').hidden = !isAr;
      document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-locale') === locale);
      });
      updateActionLabels(locale);
    }

    function downloadInvoice() {
      var locale = currentInvoiceLocale();
      var isAr = locale === 'ar';
      var source = document.getElementById(isAr ? 'invoice-ar' : 'invoice-en');
      var styles = document.querySelector('style').textContent;
      var html = '<!DOCTYPE html><html lang="' + locale + '" dir="' + (isAr ? 'rtl' : 'ltr') + '"><head><meta charset="utf-8"><title>Invoice ' + invoiceOrderNumber + '</title><style>' + styles + '.actions{display:none!important;}</style></head><body><div class="page">' + source.innerHTML + '</div></body></html>';
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'oxxila-invoice-' + invoiceOrderNumber.replace(/[^a-zA-Z0-9-]+/g, '') + '-' + locale + '.html';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    }
  </script>
</body>
</html>`
}

/**
 * Opens a print-ready invoice preview. Print starts only when the user
 * clicks the Print button in that window.
 */
export function printAdminOrderInvoice(
  order: AdminOrderDetail,
  labelsByLocale: { en: OrderInvoiceLabels; ar: OrderInvoiceLabels },
  initialLocale = 'en',
): boolean {
  const html = buildInvoiceHtml(order, labelsByLocale, initialLocale)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank', 'width=920,height=1100')

  if (!printWindow) {
    URL.revokeObjectURL(url)
    return false
  }

  const revoke = () => URL.revokeObjectURL(url)
  printWindow.addEventListener('beforeunload', revoke, { once: true })
  window.setTimeout(revoke, 5 * 60_000)
  return true
}
