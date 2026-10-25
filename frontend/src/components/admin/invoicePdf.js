import { ORDER_STATUSES } from './adminHelpers.js'

/* Builds a one-page A4 invoice as a real PDF file and downloads it.
   jsPDF is loaded only when the button is pressed, so it does not slow down the shop.
   The standard PDF font has no ৳ sign, so amounts are written as "Tk". */
const taka = (amount) => `Tk ${Number(amount || 0).toLocaleString('en-US')}`

export async function buildInvoicePdf(order) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const left = 18
  const right = 192
  const number = order.orderNumber || order.id
  const lines = order.lines ?? []
  const subtotal = order.subtotal ?? lines.reduce((sum, line) => sum + line.price * line.qty, 0)
  let y = 22

  const rule = () => { doc.setDrawColor(220); doc.line(left, y, right, y) }
  const gray = () => doc.setTextColor(110)
  const black = () => doc.setTextColor(20)

  /* header */
  black(); doc.setFont('helvetica', 'bold'); doc.setFontSize(20)
  doc.text('Make Me Pretty', left, y)
  doc.setFontSize(12); doc.text('INVOICE', right, y, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); gray()
  y += 6; doc.text(`Invoice no: ${number}`, right, y, { align: 'right' })
  y += 5; doc.text(`Date: ${order.date ?? ''}`, right, y, { align: 'right' })
  y += 6; rule()

  /* customer and order details */
  y += 8; doc.setFont('helvetica', 'bold'); doc.setFontSize(9); gray(); doc.text('BILL TO', left, y); doc.text('ORDER DETAILS', 110, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); black()
  const billTo = [order.name, order.phone, ...doc.splitTextToSize(order.address || '', 80)].filter(Boolean)
  const details = [
    `Payment: ${order.method} (${order.pay})`,
    `Status: ${ORDER_STATUSES[order.status] ?? ''}`,
    ...(order.partnerName ? [`Delivery: ${order.partnerName}`] : []),
  ]
  const detailsStart = y + 6
  billTo.forEach((text, index) => doc.text(String(text), left, detailsStart + index * 5))
  details.forEach((text, index) => doc.text(text, 110, detailsStart + index * 5))
  y = detailsStart + Math.max(billTo.length, details.length) * 5 + 4

  /* items table */
  doc.setFillColor(248, 238, 240); doc.rect(left, y, right - left, 8, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); black()
  doc.text('Item', left + 2, y + 5.5)
  doc.text('Qty', 125, y + 5.5, { align: 'right' })
  doc.text('Unit price', 156, y + 5.5, { align: 'right' })
  doc.text('Amount', right - 2, y + 5.5, { align: 'right' })
  y += 8
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10)

  lines.forEach((line) => {
    const nameLines = doc.splitTextToSize(String(line.name), 90)
    const height = nameLines.length * 5 + 3
    if (y + height > 262) { doc.addPage(); y = 20 }
    doc.text(nameLines, left + 2, y + 5.5)
    doc.text(String(line.qty), 125, y + 5.5, { align: 'right' })
    doc.text(taka(line.price), 156, y + 5.5, { align: 'right' })
    doc.text(taka(line.price * line.qty), right - 2, y + 5.5, { align: 'right' })
    y += height
    doc.setDrawColor(235); doc.line(left, y, right, y)
  })

  /* totals */
  if (y > 235) { doc.addPage(); y = 20 }
  y += 4
  const total = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 12 : 10)
    doc.text(label, 130, y); doc.text(value, right - 2, y, { align: 'right' }); y += bold ? 7 : 6
  }
  total('Subtotal', taka(subtotal))
  total('Delivery', order.deliveryCharge ? taka(order.deliveryCharge) : 'Free')
  if (order.discount > 0) total(`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, `- ${taka(order.discount)}`)
  doc.setDrawColor(200); doc.line(130, y - 3, right, y - 3); y += 2
  total('Total', taka(order.total), true)

  /* footer */
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); gray()
  doc.text('Thank you for shopping with Make Me Pretty.', 105, 280, { align: 'center' })
  return doc
}

export async function downloadInvoicePdf(order) {
  const doc = await buildInvoicePdf(order)
  doc.save(`invoice-${order.orderNumber || order.id}.pdf`)
}