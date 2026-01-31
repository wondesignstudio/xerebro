import { NextResponse } from 'next/server'

const DEFAULT_MODEL = 'gpt-4o-mini'

function buildSystemPrompt() {
  return [
    '너는 B2B 영업 멘트를 다듬는 AI 편집자다.',
    '정중하고 간결하게, 과장이나 허위 표현 없이 작성한다.',
    'AI나 봇이 쓴 것 같은 딱딱한 말투를 피하고 자연스럽게 작성한다.',
    '상대의 문제(Pain Point)를 이해한다는 뉘앙스를 먼저 담는다.',
    '마무리는 강요 없이 도움을 제안하는 Soft CTA로 끝낸다.',
    '스팸/비방/차별/선정적 표현은 절대 생성하지 않는다.',
  ].join(' ')
}

type DraftRequestBody = {
  prompt: string
  draftMessage: string
}

function extractOutputText(responseBody: Record<string, unknown>) {
  const output = responseBody.output

  if (!Array.isArray(output)) {
    return ''
  }

  const textParts: string[] = []

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const message = item as { type?: string; content?: Array<{ type?: string; text?: string }> }
    if (message.type !== 'message' || !Array.isArray(message.content)) {
      continue
    }

    for (const part of message.content) {
      if (part?.type === 'output_text' && typeof part.text === 'string') {
        textParts.push(part.text)
      }
    }
  }

  return textParts.join('\n').trim()
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key.' }, { status: 500 })
  }

  let body: DraftRequestBody

  try {
    body = (await request.json()) as DraftRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body.prompt || !body.draftMessage) {
    return NextResponse.json({ error: 'Prompt and draft message are required.' }, { status: 400 })
  }

  const instructions = buildSystemPrompt()
  const input = [
    {
      role: 'user',
      content: `현재 초안:\n${body.draftMessage}\n\n사용자 요청:\n${body.prompt}\n\n요청에 맞게 초안을 수정해 주세요.`,
    },
  ]

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      temperature: 0.4,
      max_output_tokens: 300,
      store: false,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    return NextResponse.json({ error: 'OpenAI request failed.', detail: errorBody }, { status: 502 })
  }

  const responseBody = (await response.json()) as Record<string, unknown>
  const outputText = extractOutputText(responseBody)

  if (!outputText) {
    return NextResponse.json({ error: 'No draft returned from model.' }, { status: 502 })
  }

  return NextResponse.json({ draft: outputText })
}
