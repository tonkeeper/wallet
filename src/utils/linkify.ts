const linkify = require('linkify-it')();

linkify.tlds('ton', true);

export function getLinkifyIt() {
  return linkify;
}
