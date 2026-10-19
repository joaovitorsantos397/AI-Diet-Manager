// Demo of the SQL persistence layer added in Fase A (see docs/DATABASE.md).
// Talks to the already-running server over HTTP — no DB access of its
// own, no new dependency (just Node's built-in fetch).
const BASE_URL = process.env.API_URL || 'http://localhost:3001'
const PROFILE_ID = 'demo'
const TODAY = new Date().toISOString().slice(0, 10)

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Profile-Id': PROFILE_ID },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`)
  }
  return data
}

function show(title, data) {
  console.log(`\n=== ${title} ===`)
  console.log(JSON.stringify(data, null, 2))
}

async function main() {
  await show(
    '(a) Registrando o café da manhã (2 itens)',
    await request('POST', '/api/meals', {
      eatenAt: `${TODAY}T08:00:00Z`,
      description: 'Café da manhã',
      items: [
        { name: 'Aveia', kcal: 150, proteinG: 5, carbsG: 27, fatG: 3 },
        { name: 'Banana', kcal: 90, proteinG: 1, carbsG: 23, fatG: 0 },
      ],
    }),
  )

  await show(
    '(b) Registrando o almoço (3 itens)',
    await request('POST', '/api/meals', {
      eatenAt: `${TODAY}T12:30:00Z`,
      description: 'Almoço',
      items: [
        { name: 'Arroz', kcal: 200, proteinG: 4, carbsG: 45, fatG: 0 },
        { name: 'Frango', kcal: 250, proteinG: 40, carbsG: 0, fatG: 8 },
        { name: 'Feijão', kcal: 130, proteinG: 8, carbsG: 22, fatG: 1 },
      ],
    }),
  )

  await show(
    '(c) Listando as refeições de hoje',
    await request('GET', `/api/meals?date=${TODAY}`),
  )

  await show(
    '(d) Totais de hoje',
    await request('GET', `/api/totals?date=${TODAY}`),
  )

  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  await show(
    '(e) Totais por período (últimos 7 dias, um total por dia)',
    await request('GET', `/api/totals?from=${sevenDaysAgo}&to=${TODAY}`),
  )

  await show(
    '(f) Removendo a última refeição (o almoço inteiro, não um item)',
    await request('DELETE', '/api/meals/last'),
  )
  await show(
    '(f) Refeições de hoje depois da remoção — o almoço e seus 3 itens sumiram juntos (ON DELETE CASCADE)',
    await request('GET', `/api/meals?date=${TODAY}`),
  )

  await show(
    '(g) Totais de hoje de novo — caíram exatamente o que o almoço valia',
    await request('GET', `/api/totals?date=${TODAY}`),
  )
}

main().catch((error) => {
  if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
    console.error(
      `\nNão consegui falar com ${BASE_URL}. Suba o servidor primeiro, por exemplo:\n` +
        '  DB_PATH=./data/demo.db npm run server',
    )
    process.exitCode = 1
    return
  }
  console.error('\nDemo falhou:', error.message)
  process.exitCode = 1
})
