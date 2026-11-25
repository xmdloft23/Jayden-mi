'use strict';
/**
 * Supabase-backed WhatsApp session store (optional).
 * Needs SUPABASE_URL + SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) and this table:
 *
 *   create table if not exists wa_sessions (
 *     number text primary key,
 *     creds  jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 *   create table if not exists wa_settings (
 *     chat_id text, key text, value jsonb,
 *     primary key (chat_id, key)
 *   );
 *
 * If env vars are missing, isEnabled() is false and every call is a no-op.
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const isEnabled = () => !!(URL && KEY);

let client = null;
function db() {
  if (!isEnabled()) return null;
  if (!client) client = require('@supabase/supabase-js').createClient(URL, KEY, { auth: { persistSession: false } });
  return client;
}

async function saveSession(number, creds) {
  const c = db(); if (!c) return false;
  const { error } = await c.from('wa_sessions').upsert({ number, creds, updated_at: new Date().toISOString() });
  if (error) { console.error('[SUPABASE] saveSession:', error.message); return false; }
  return true;
}
async function loadSession(number) {
  const c = db(); if (!c) return null;
  const { data, error } = await c.from('wa_sessions').select('creds').eq('number', number).maybeSingle();
  if (error) { console.error('[SUPABASE] loadSession:', error.message); return null; }
  return data ? data.creds : null;
}
async function listSessions() {
  const c = db(); if (!c) return [];
  const { data, error } = await c.from('wa_sessions').select('number');
  if (error) { console.error('[SUPABASE] listSessions:', error.message); return []; }
  return (data || []).map(r => r.number);
}
async function deleteSession(number) {
  const c = db(); if (!c) return false;
  const { error } = await c.from('wa_sessions').delete().eq('number', number);
  return !error;
}
async function saveSetting(chatId, key, value) {
  const c = db(); if (!c) return false;
  const { error } = await c.from('wa_settings').upsert({ chat_id: chatId, key, value });
  return !error;
}

module.exports = { isEnabled, saveSession, loadSession, listSessions, deleteSession, saveSetting };
