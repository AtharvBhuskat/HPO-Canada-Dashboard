const API_URL = 'https://4mtxj04f6d.execute-api.us-east-1.amazonaws.com/default/send-email'

export interface SendEmailParams {
  to: string[]
  subject: string
  html: string
}

export interface SendEmailResult {
  message_id: string
  sent_to: number
}

export async function sendCampaignEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to send email')
  return data
}
