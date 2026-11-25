'use strict';
/**
 * Numbered-reply ("1".."9") selection registry.
 * Plugins call registerHandler({ name, check(sock, message, context, number) })
 * and index.js calls handleSelection() when a user replies with a digit.
 * check() must return true when it handled the reply.
 */
const handlers = [];

function registerHandler(h) {
  if (!h || typeof h.check !== 'function') return;
  const i = handlers.findIndex(x => x.name && x.name === h.name);
  if (i >= 0) handlers[i] = h; else handlers.push(h);
}

async function handleSelection(sock, message, context = {}, number) {
  for (const h of handlers) {
    try {
      if (await h.check(sock, message, context, number)) return true;
    } catch (e) {
      console.error(`[selection:${h.name || 'handler'}]`, e.message);
    }
  }
  return false;
}

const selectionHandler = { registerHandler, handleSelection, handlers };
module.exports = { registerHandler, handleSelection, selectionHandler };
