import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Questa funzione viene eseguita ogni giorno tramite Supabase Cron
// e invia reminder per i ticket in scadenza entro 3 giorni

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const functionUrl = `${supabaseUrl}/functions/v1/invia-email`

  // Calcola la data tra 3 giorni
  const tra3giorni = new Date()
  tra3giorni.setDate(tra3giorni.getDate() + 3)
  const dataStr = tra3giorni.toISOString().split('T')[0]

  // Trova i ticket in scadenza entro 3 giorni non ancora completati e senza reminder
  const res = await fetch(
    `${supabaseUrl}/rest/v1/ticket?scadenza=eq.${dataStr}&stato=neq.Completato&reminder_inviato=eq.false&select=id`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  )
  const tickets = await res.json()

  let inviati = 0
  for (const ticket of tickets) {
    await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
      body: JSON.stringify({ ticket_id: ticket.id, tipo: 'reminder' }),
    })
    inviati++
  }

  return new Response(JSON.stringify({ reminder_inviati: inviati, data_scadenza: dataStr }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
