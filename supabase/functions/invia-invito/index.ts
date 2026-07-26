import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'
const APP_URL = 'https://massimocoletta1959-wq.github.io/toolkit-rischio-360'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }
  try {
    const { membro_id, azienda_id } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const [mr, ar] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/membri?id=eq.${membro_id}&select=*`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }),
      fetch(`${supabaseUrl}/rest/v1/aziende?id=eq.${azienda_id}&select=*`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }),
    ])
    const membro  = (await mr.json())[0]
    const azienda = (await ar.json())[0]
    if (!membro || !azienda) return new Response(JSON.stringify({ error: 'Non trovato' }), { status: 404 })
    const token = crypto.randomUUID().replace(/-/g, '')
    await fetch(`${supabaseUrl}/rest/v1/inviti`, {
      method: 'POST',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ azienda_id, membro_id, email: membro.email, token }),
    })
    const inviteUrl = `${APP_URL}?invito=${token}`
    const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#F7F8FA;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
<div style="background:#1A3A5C;padding:24px 32px;text-align:center;"><div style="font-size:28px;">🛡️</div>
<h1 style="color:white;margin:8px 0 0;font-size:18px;">Rischi 360 - task manager</h1></div>
<div style="padding:32px;">
<p style="color:#555;margin-bottom:20px;">Ciao <strong>${membro.nome} ${membro.cognome}</strong>,<br><br>
sei stato invitato ad accedere al portale di gestione rischi dell'azienda <strong>${azienda.nome}</strong>.</p>
<div style="background:#F7F8FA;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px;color:#555;">
<strong>Ruolo:</strong> ${membro.ruolo || 'Membro operativo'}<br>
<strong>Azienda:</strong> ${azienda.nome}<br>
<strong>Link valido per:</strong> 7 giorni</div>
<div style="text-align:center;margin-bottom:24px;">
<a href="${inviteUrl}" style="display:inline-block;background:#2B5FA5;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Accetta invito e accedi →</a></div>
<p style="font-size:11px;color:#aaa;text-align:center;">Oppure copia: <a href="${inviteUrl}" style="color:#2B5FA5;">${inviteUrl}</a></p>
</div></div></body></html>`
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `Rischi 360 - task manager <${FROM_EMAIL}>`, to: [membro.email], subject: `Invito al portale — ${azienda.nome}`, html }),
    })
    const successo = resendRes.status === 200
    return new Response(JSON.stringify({ successo, token, inviteUrl }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
