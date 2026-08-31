/* ==========================================================================
   Blog posts.

   Every figure below already appears somewhere on this site with a label, and
   nothing here is a new claim. If a post needs a number that is not already
   published and labelled elsewhere, publish it there first.
   ========================================================================== */

export type Block =
  | { t: 'p'; x: string }
  | { t: 'h'; x: string }
  | { t: 'quote'; x: string }
  | { t: 'note'; x: string }
  | { t: 'list'; x: string[] };

export type Post = {
  slug: string;
  title: string;
  kicker: string;
  cover: string; // key into COVERS, used when there is no painted plate
  image?: string; // painted plate under /story/abstract
  imageAlt?: string;
  date: string; // ISO
  dateLabel: string;
  mins: number;
  excerpt: string;
  featured?: boolean;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: 'why-a-cloudburst-in-nepal-is-an-odisha-problem',
    title: 'Why a cloudburst in Nepal becomes a problem on the Indian plain',
    kicker: 'Explainer',
    cover: 'upstream',
    image: '/story/abstract/me-abstract-06-monsoon-wall.jpg',
    imageAlt:
      'A wall of monsoon rain falling from the hills onto flooded paddy, with a single figure walking the bund',
    date: '2026-08-28',
    dateLabel: '28 August 2026',
    mins: 7,
    featured: true,
    excerpt:
      'Rivers do not stop at borders, and neither does a monsoon. What falls on the eastern Himalaya arrives downstream as a number somebody has to act on, often a day or two later.',
    body: [
      {
        t: 'p',
        x: 'Most of the water that causes trouble on the north Indian plain does not fall on the plain. It falls upstream, on ground that is steeper, higher and usually in another jurisdiction, and then it travels.',
      },
      {
        t: 'p',
        x: 'That travel time is the only reason early warning is possible at all. A catchment converts rainfall into river level with a delay set by its slope, its soil and how wet it already was. On a steep Himalayan headwater that delay is hours. By the time the same water is moving across a delta it can be a day or more. Everything a warning system does happens inside that window.',
      },
      { t: 'h', x: 'The same physics, three different problems' },
      {
        t: 'p',
        x: 'It is worth being precise about which basin does what, because they are often spoken about as one thing:',
      },
      {
        t: 'list',
        x: [
          'The Ganga and Brahmaputra systems collect from Nepal, Tibet and the eastern Himalaya, and deliver into Bihar, Bengal and Assam. Their headwaters are largely outside India.',
          'Odisha’s rivers, the Mahanadi, the Brahmani and the Baitarani, rise inside India, mostly in Chhattisgarh, Jharkhand and Odisha itself. Their upstream problem is domestic, not international.',
          'Both share the same failure mode: the place the water starts is not the place that has to decide, and the two are often not talking on the same clock.',
        ],
      },
      {
        t: 'quote',
        x: 'Upstream rain is information. It only becomes a warning if it crosses an institutional boundary faster than the water does.',
      },
      { t: 'h', x: 'What this means for a decision engine' },
      {
        t: 'p',
        x: 'It means rainfall alone is a weak signal, and we have the measurements to say so rather than the intuition. Scored on heavy monsoon days in north Odisha, days with a recorded flood had a median of 1.94 times the local wet-day p95. Days with no recorded flood had 2.03. The days without floods had more rain.',
      },
      {
        t: 'p',
        x: 'Rain tells you what the sky did. River level tells you what the catchment did with it, which is the part that decides whether a road goes under. That is why river telemetry sits on the risk path, and why a station only counts toward a score when it is genuinely live rather than merely present.',
      },
      {
        t: 'p',
        x: 'It also means the honest unit of a warning is not a probability. It is a length of usable road. Forty-eight hours of lead is roughly two days in which a household can move grain above waist height and an officer can pre-position at a bridge. That is the thing being bought, and it is the thing worth measuring.',
      },
      {
        t: 'note',
        x: 'Explainer. The rainfall medians and the gating rule appear on the research page with their labels. This post makes no claim about any specific recent flood.',
      },
    ],
  },
  {
    slug: 'the-last-mile-when-it-worked',
    title: 'Odisha has already solved the last mile once',
    kicker: 'Field notes',
    cover: 'lastmile',
    image: '/story/abstract/me-abstract-08-last-mile.jpg',
    imageAlt:
      'An older woman reading a lit phone in a doorway while floodwater stands in the yard outside',
    date: '2026-08-24',
    dateLabel: '24 August 2026',
    mins: 5,
    featured: true,
    excerpt:
      'The 1999 super cyclone is the storm everyone here measures time against. What gets told less often is what the state built afterwards, and how well it held.',
    body: [
      {
        t: 'p',
        x: 'It is easy to write about early warning as a problem nobody has solved. In Odisha that is not quite true, and the exception is worth studying rather than skipping.',
      },
      {
        t: 'p',
        x: 'The October 1999 super cyclone crossed the coast and killed on a scale that reset how the state thinks about storms. The models had seen it coming. The satellites had seen it. What failed was the last step, the distance between a correct forecast and a household that acts on it.',
      },
      { t: 'h', x: 'What was built afterwards' },
      {
        t: 'p',
        x: 'The response was not a better model. It was institutions and concrete: a dedicated state disaster authority, a network of purpose-built cyclone shelters along the coast, trained volunteers in the villages that would need them, and an evacuation protocol with named people responsible for triggering it.',
      },
      {
        t: 'p',
        x: 'When Cyclone Phailin came ashore in October 2013 as a comparably severe storm, the state ran that protocol. Around a million people were moved inland before landfall, in what was widely reported at the time as one of the largest pre-emptive evacuations the country had carried out. The death toll was in the tens rather than the thousands.',
      },
      {
        t: 'quote',
        x: 'The physics did not improve between 1999 and 2013. The distribution did.',
      },
      { t: 'h', x: 'Why we keep pointing at it' },
      {
        t: 'p',
        x: 'Because it settles an argument that otherwise runs forever. When the warning reaches the person who has to move, and that person has somewhere to go and a reason to believe the message, the outcome changes by orders of magnitude. The bottleneck was never the meteorology.',
      },
      {
        t: 'p',
        x: 'It also sets the bar for anything built now. A cyclone gives a coast a day or two of visible, unambiguous warning, and it arrives through a chain that has been rehearsed. A river flood in an ungauged reach gives an officer far less, through a chain that has not been. Closing that gap is a distribution problem before it is a modelling one, which is the whole reason this exists.',
      },
      {
        t: 'note',
        x: 'Field notes. The 1999 and 2013 events are drawn from the public record, and figures are given as the approximate orders of magnitude that were reported. Nothing here is a ModelEarth measurement.',
      },
    ],
  },
  {
    slug: 'the-audit-that-cost-us-our-best-number',
    title: 'We audited our own 99.3% and it did not survive',
    kicker: 'Evidence',
    cover: 'audit',
    image: '/story/abstract/me-abstract-02-night-watch.jpg',
    imageAlt:
      'A lone analyst at a desk of screens at night, a river map on the glass behind them',
    date: '2026-08-19',
    dateLabel: '19 August 2026',
    mins: 6,
    excerpt:
      'Our labeller snapped every flood event to the nearest pilot city within 120 km. In Odisha that radius crosses whole basins, and it meant the engine had been scored on the wrong rivers.',
    body: [
      {
        t: 'p',
        x: 'For months our best number was a 99.3% detection rate across 143 validated flood positives, drawn from the INDOFLOODS labelled event record. It led every deck we had and it sat at the top of this site.',
      },
      {
        t: 'p',
        x: 'Then we went back and asked a duller question about the labels themselves. Our event labeller had been snapping each INDOFLOODS gauge to the nearest pilot city within 120 kilometres. That sounds reasonable until you look at a map of Odisha, where 120 kilometres crosses whole basins.',
      },
      { t: 'h', x: 'Where the events actually were' },
      {
        t: 'p',
        x: 'When each event was traced back to the river it actually happened on, the distribution was not what the headline implied:',
      },
      {
        t: 'list',
        x: [
          'Baitarani, 79 events. Anandapur is 86.8 km from Cuttack.',
          'Rushikulya, 34 events. Purushottampur is 104.6 km away, in Ganjam.',
          'Brahmani, 29 events. Jenapur, 49.4 km.',
          'Mahanadi, 1 event. Naraj.',
        ],
      },
      {
        t: 'quote',
        x: 'One of 143 validated positives was on the river we were claiming to watch.',
      },
      {
        t: 'p',
        x: 'It also explained a puzzle we had shelved. Bhubaneswar and Sambalpur had been showing zero scored events, and we had assumed a bug. There were never real ones there to score.',
      },
      { t: 'h', x: 'What we did with it' },
      {
        t: 'p',
        x: 'The number was mislabelled, not fabricated. We could have quietly corrected the labeller, rerun the backtest and moved on with a slightly different figure. Instead we retired the headline, published the audit, and put the replacement on the public site: 95.1% across all 143 events, and 94.4% on north Odisha onsets, rain-only, scored against each gauge’s own ERA5 p95 with negatives sampled at the same gauge.',
      },
      {
        t: 'p',
        x: 'The harder finding was underneath it. Our old “0% false positive rate” had been measured on dry days, which is the one case a rainfall rule separates by construction. On heavy monsoon days at or above a gauge’s own p95 with no recorded flood, the engine fires on every single one: 647 of 647. Sweeping thresholds from 0.5 to 8 times p95, precision never exceeds 24.2% against a 20% base rate.',
      },
      {
        t: 'p',
        x: 'North Odisha flood days have a median of 1.94 times p95. Non-flood heavy days have 2.03. The days without floods had more rain. Either rainfall genuinely cannot discriminate and we need river level as a feature, or the flood record is not exhaustive and we need river level as a label. Both answers point the same way, which is why real river telemetry is now in production.',
      },
      {
        t: 'note',
        x: 'Backtest. Every figure here appears on the research page with the same label, and in docs/ModelEarth_Backtest_Relabel_Audit.md.',
      },
    ],
  },

  {
    slug: 'zero-of-twelve-gauges',
    title: 'Zero of twelve gauges were telling the truth',
    kicker: 'Field notes',
    cover: 'gauges',
    image: '/story/abstract/me-abstract-04-gauge-honesty.jpg',
    imageAlt:
      'A staff gauge standing in a flat river, an unfinished bridge behind it in the haze',
    date: '2026-07-28',
    dateLabel: '28 July 2026',
    mins: 5,
    excerpt:
      'The first real lesson was not a modelling lesson. It was that three of four failure modes in a public river feed arrive as valid rows, with valid timestamps.',
    body: [
      {
        t: 'p',
        x: 'On the day we started ingesting the public river network, not one of the twelve CWC stations we needed was decision-grade. Not one.',
      },
      {
        t: 'list',
        x: [
          'The Brahmani and Baitarani feed had been stalled since 3 June, 84 days.',
          'Five sensors were flatlined: Akhuapada, Champua, Pamposh, Nimapara, Seorinarayan.',
          '34.6% of readings at Kishan Nagar were outside physical range, including a spike to 1133 m and minus 834 m at Jenapur.',
          'Sambalpur, Hirakud, Basantpur and Khairmal were real but stale, running 38 to 79 hours behind.',
        ],
      },
      {
        t: 'p',
        x: 'This is not a complaint about CWC. Running a national gauge network is genuinely hard. It is an observation about what arrives at your ingest layer, and about how little of it announces itself as broken.',
      },
      { t: 'h', x: 'Three of four failure modes look like data' },
      {
        t: 'p',
        x: 'A flatline, a stall and a physically impossible spike all arrive as valid rows with valid timestamps. Nothing in the payload says “do not trust me”. Only the fourth trace, an actual river rising, is what it appears to be. A platform that trusts the feed wholesale would have alerted on noise, confidently, with a number attached.',
      },
      {
        t: 'quote',
        x: 'An unvalidated gauge is worse than no gauge, because it fails silently and looks like data.',
      },
      {
        t: 'p',
        x: 'So the ingest now ships with a QC layer it turned out to need badly: a physical-range filter, stuck-sensor detection over a 500-reading window, a staleness check, and a datum check that strips a published danger level when it does not share the station’s datum. A level counts toward a score only when the gauge is genuinely live. Otherwise the briefing says the read is rainfall-only, out loud, and the score is capped accordingly.',
      },
      {
        t: 'p',
        x: 'That discipline is also why our own hardware is held to the same bar. Bhoomi G1 writes to an ingest store and stops. It passes four gates before a reading could ever count, and zero units are deployed today.',
      },
      {
        t: 'note',
        x: 'Live in production. The QC layer and the gated river term are described in full on the research page.',
      },
    ],
  },

  {
    slug: 'why-we-do-not-claim-seventy-two-hours',
    title: 'Why we will not say seventy-two hours',
    kicker: 'How we work',
    cover: 'leadtime',
    image: '/story/abstract/me-abstract-10-lead-time.jpg',
    imageAlt:
      'A figure standing in a flooded street at dawn, contour bands of water drawn across the foreground',
    date: '2026-06-30',
    dateLabel: '30 June 2026',
    mins: 4,
    excerpt:
      'The engine caught one of six onsets at seventy-two hours. So seventy-two hours does not appear anywhere on this site, including in the places where it would help us.',
    body: [
      {
        t: 'p',
        x: 'In the August 2026 north Odisha replay we ran the unmodified rule engine on the forecast exactly as it was issued that week. At forty-eight hours it caught all six location onsets. At twenty-four hours, four of six. At seventy-two hours, one of six.',
      },
      {
        t: 'p',
        x: 'A seventy-two hour warning is a much better thing to sell than a forty-eight hour one. It is most of an extra day. It is the difference between moving livestock at leisure and moving them at night.',
      },
      { t: 'quote', x: 'One of six is not a lead time. It is a coincidence with good manners.' },
      {
        t: 'p',
        x: 'So seventy-two hours does not appear anywhere on this site. Not in the deck, not on the product pages, not in a footnote with an asterisk. The number we publish is forty-eight hours, labelled BACKTEST, because it was measured on history and has never been quoted as live accuracy.',
      },
      { t: 'h', x: 'The same rule cost us more than that' },
      {
        t: 'p',
        x: 'Through the recession that followed that same event, fourteen of eighteen location-days scored LOW while 13.44 lakh people were still displaced. The rain had stopped; the water had not. The engine reads rainfall, not flood state, and the active-flood hold we had built for exactly this case keys off river level, which made it dead code for ungauged locations.',
      },
      {
        t: 'p',
        x: 'That is the single largest known gap in the system and it is written up on the product page it belongs to, with a MISS label, rather than in a place where nobody would look for it.',
      },
      {
        t: 'note',
        x: 'Backtest and Miss. Both figures appear on the Flood Ops page and in docs/ModelEarth_NorthOdisha_Aug2026_Replay.md.',
      },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
