const chrono = require('chrono-node');

function extractEvent(text) {
  const results = chrono.parse(text);
  if (results.length === 0) return null;

  const date = results[0].start.date();
  const title = text.split('on')[0].trim();

  return {
    title: title || 'Event from WhatsApp',
    datetime: date,
    location: 'TBD'
  };
}

module.exports = { extractEvent };
