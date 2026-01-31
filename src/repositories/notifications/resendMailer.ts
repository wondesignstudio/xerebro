import { Resend } from 'resend'

const FROM_NAME = 'XEREBRO Team'

function getSenderAddress() {
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!fromEmail) {
    throw new Error('Missing RESEND_FROM_EMAIL.')
  }

  return `${FROM_NAME} <${fromEmail}>`
}

function toRecipientName(email: string) {
  const local = email.split('@')[0]
  return local ? `${local}님` : '고객님'
}

export async function sendLeadReadyEmail(params: { to: string; dashboardUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY.')
  }

  const resend = new Resend(apiKey)
  const recipientName = toRecipientName(params.to)
  const subject = '리드 탐색 완료 안내'

  const text = `${recipientName}, 요청하신 리드 탐색이 완료되었습니다. 지금 확인해 보세요. ${params.dashboardUrl}`

  const html = `
    <p>${recipientName}, 요청하신 리드 탐색이 완료되었습니다.</p>
    <p>지금 확인해 보세요.</p>
    <p><a href="${params.dashboardUrl}">대시보드 바로가기</a></p>
  `

  const { error } = await resend.emails.send({
    from: getSenderAddress(),
    to: params.to,
    subject,
    text,
    html,
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email.')
  }
}
