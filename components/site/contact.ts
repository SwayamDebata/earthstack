/* ==========================================================================
   The pilot request.

   The nav CTA opens a drafted mail rather than scrolling to a section, so the
   click produces the thing the button promises instead of a jump to the foot
   of another page. The body carries the three things we always end up asking
   for anyway, so the first reply can be useful.

   Plain hyphens throughout, no em dashes: this text is composed into a mail
   client, where the house typographic rules still apply.
   ========================================================================== */

export const PILOT_EMAIL = 'swayam@modelearth.in';

const SUBJECT = 'Pilot request';

const BODY = [
  'Hello ModelEarth,',
  '',
  'We would like to talk about running a pilot.',
  '',
  'District or basin:',
  'Organisation:',
  'What you use for flood warning today:',
  'Who would use it day to day:',
  '',
  'Anything else worth knowing:',
  '',
].join('\n');

export const PILOT_MAILTO =
  `mailto:${PILOT_EMAIL}` +
  `?subject=${encodeURIComponent(SUBJECT)}` +
  `&body=${encodeURIComponent(BODY)}`;
