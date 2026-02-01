/**
 * Banned Hype Words List for Anti-Hype Tone Enforcement (LOG-25)
 *
 * This module defines marketing/hype terms that must be excluded from
 * generated content. Each entry includes a rationale for the ban.
 *
 * Categories:
 *  - EN: English marketing/hype terms
 *  - KO: Korean marketing/hype terms
 *  - EMOJI: Emojis that convey hype or informal tone
 */

export interface BannedWord {
  /** The banned term or pattern */
  word: string
  /** Language/category: 'en' | 'ko' | 'emoji' */
  category: 'en' | 'ko' | 'emoji'
  /** Why this term is banned */
  rationale: string
}

export const BANNED_WORDS_LIST: BannedWord[] = [
  // ─── English hype / marketing terms ──────────────────────────────
  {
    word: 'game-changer',
    category: 'en',
    rationale: 'Overused startup buzzword that exaggerates impact',
  },
  {
    word: 'game changer',
    category: 'en',
    rationale: 'Variant of game-changer without hyphen',
  },
  {
    word: 'revolutionary',
    category: 'en',
    rationale: 'Implies unprecedented change; rarely accurate for dev work',
  },
  {
    word: 'cutting-edge',
    category: 'en',
    rationale: 'Marketing jargon implying superiority without evidence',
  },
  {
    word: 'cutting edge',
    category: 'en',
    rationale: 'Variant without hyphen',
  },
  {
    word: 'innovative',
    category: 'en',
    rationale: 'Vague superlative; real innovation should be self-evident',
  },
  {
    word: 'disruptive',
    category: 'en',
    rationale: 'Silicon Valley buzzword that overstates significance',
  },
  {
    word: 'next-level',
    category: 'en',
    rationale: 'Informal hype term with no measurable meaning',
  },
  {
    word: 'next level',
    category: 'en',
    rationale: 'Variant without hyphen',
  },
  {
    word: 'amazing',
    category: 'en',
    rationale: 'Subjective emotional language; not factual',
  },
  {
    word: 'incredible',
    category: 'en',
    rationale: 'Literally means "not credible"; undermines trust',
  },
  {
    word: 'awesome',
    category: 'en',
    rationale: 'Casual superlative inappropriate for professional content',
  },
  {
    word: 'groundbreaking',
    category: 'en',
    rationale: 'Implies historic significance; almost always an overstatement',
  },
  {
    word: 'world-class',
    category: 'en',
    rationale: 'Unverifiable comparative claim',
  },
  {
    word: 'best-in-class',
    category: 'en',
    rationale: 'Marketing superlative without evidence',
  },
  {
    word: 'state-of-the-art',
    category: 'en',
    rationale: 'Vague claim of technological superiority',
  },
  {
    word: 'bleeding-edge',
    category: 'en',
    rationale: 'Exaggerated variant of cutting-edge',
  },
  {
    word: 'mind-blowing',
    category: 'en',
    rationale: 'Hyperbolic emotional language',
  },
  {
    word: 'unbelievable',
    category: 'en',
    rationale: 'Literally undermines credibility of claims',
  },
  {
    word: 'unprecedented',
    category: 'en',
    rationale: 'Almost never literally true; exaggerates novelty',
  },
  {
    word: 'supercharge',
    category: 'en',
    rationale: 'Marketing verb implying extreme amplification',
  },
  {
    word: 'turbocharge',
    category: 'en',
    rationale: 'Marketing verb implying extreme amplification',
  },
  {
    word: 'skyrocket',
    category: 'en',
    rationale: 'Exaggerates growth or improvement',
  },
  {
    word: 'unleash',
    category: 'en',
    rationale: 'Dramatic marketing verb; not appropriate for tech logs',
  },
  {
    word: 'unlock',
    category: 'en',
    rationale: 'Marketing metaphor implying hidden potential',
  },
  {
    word: 'empower',
    category: 'en',
    rationale: 'Corporate buzzword that adds no factual meaning',
  },
  {
    word: 'leverage',
    category: 'en',
    rationale: 'Overused business jargon; prefer "use" or "apply"',
  },
  {
    word: 'synergy',
    category: 'en',
    rationale: 'Classic corporate buzzword with vague meaning',
  },
  {
    word: 'paradigm shift',
    category: 'en',
    rationale: 'Overused buzzword that exaggerates impact of changes',
  },
  {
    word: 'rocket ship',
    category: 'en',
    rationale: 'Startup hype metaphor for rapid growth',
  },
  {
    word: '10x',
    category: 'en',
    rationale: 'Startup culture hype term unless backed by data',
  },
  {
    word: 'magical',
    category: 'en',
    rationale: 'Subjective and non-technical descriptor',
  },
  {
    word: 'insane',
    category: 'en',
    rationale: 'Informal hyperbole inappropriate for professional tone',
  },
  {
    word: 'crushing it',
    category: 'en',
    rationale: 'Informal hype expression',
  },
  {
    word: 'killing it',
    category: 'en',
    rationale: 'Informal hype expression',
  },
  {
    word: 'absolutely',
    category: 'en',
    rationale: 'Intensifier that inflates claims unnecessarily',
  },
  {
    word: 'extremely',
    category: 'en',
    rationale: 'Vague intensifier; prefer concrete measurements',
  },

  // ─── Korean hype / marketing terms ───────────────────────────────
  {
    word: '혁신적',
    category: 'ko',
    rationale: '"innovative" in Korean; same vague superlative issue',
  },
  {
    word: '획기적',
    category: 'ko',
    rationale: '"groundbreaking" in Korean; overstates significance',
  },
  {
    word: '놀라운',
    category: 'ko',
    rationale: '"amazing/surprising" in Korean; emotional language',
  },
  {
    word: '압도적',
    category: 'ko',
    rationale: '"overwhelming" in Korean; exaggerates degree',
  },
  {
    word: '최고의',
    category: 'ko',
    rationale: '"the best" in Korean; unverifiable superlative',
  },
  {
    word: '최첨단',
    category: 'ko',
    rationale: '"cutting-edge/state-of-the-art" in Korean',
  },
  {
    word: '파괴적',
    category: 'ko',
    rationale: '"disruptive" in Korean; Silicon Valley buzzword',
  },
  {
    word: '미친',
    category: 'ko',
    rationale: '"crazy/insane" in Korean; informal hype slang',
  },
  {
    word: '대박',
    category: 'ko',
    rationale: '"jackpot/amazing" in Korean; casual exclamation',
  },
  {
    word: '엄청난',
    category: 'ko',
    rationale: '"tremendous" in Korean; vague intensifier',
  },
  {
    word: '충격적',
    category: 'ko',
    rationale: '"shocking" in Korean; sensationalist language',
  },
  {
    word: '경이로운',
    category: 'ko',
    rationale: '"marvelous/wondrous" in Korean; exaggerated admiration',
  },
  {
    word: '폭발적',
    category: 'ko',
    rationale: '"explosive" in Korean; exaggerates growth/impact',
  },
  {
    word: '게임체인저',
    category: 'ko',
    rationale: 'Korean transliteration of "game-changer"',
  },
  {
    word: '넥스트레벨',
    category: 'ko',
    rationale: 'Korean transliteration of "next-level"',
  },
  {
    word: '완전',
    category: 'ko',
    rationale: '"totally/completely" as informal intensifier in Korean',
  },
  {
    word: '진짜',
    category: 'ko',
    rationale: '"really" as informal emphasis in Korean; too casual',
  },
  {
    word: '레전드',
    category: 'ko',
    rationale: 'Korean transliteration of "legend"; hype slang',
  },
  {
    word: '미쳤다',
    category: 'ko',
    rationale: '"That\'s crazy" in Korean; informal hype expression',
  },
  {
    word: '역대급',
    category: 'ko',
    rationale: '"all-time best" in Korean; exaggerated comparison',
  },
  {
    word: '쩐다',
    category: 'ko',
    rationale: 'Korean slang for "amazing"; too informal',
  },
  {
    word: '핵',
    category: 'ko',
    rationale: '"nuclear" prefix used as Korean slang intensifier (e.g. 핵꿀팁)',
  },
  {
    word: '갓',
    category: 'ko',
    rationale: '"God" prefix used as Korean hype slang (e.g. 갓성비)',
  },

  // ─── Banned emojis ───────────────────────────────────────────────
  {
    word: '🚀',
    category: 'emoji',
    rationale: 'Rocket emoji; universal startup hype symbol',
  },
  {
    word: '🔥',
    category: 'emoji',
    rationale: 'Fire emoji; implies something is "hot" or trending',
  },
  {
    word: '💥',
    category: 'emoji',
    rationale: 'Explosion emoji; sensationalist emphasis',
  },
  {
    word: '⚡',
    category: 'emoji',
    rationale: 'Lightning emoji; implies speed/power hype',
  },
  {
    word: '✨',
    category: 'emoji',
    rationale: 'Sparkles emoji; implies magical quality',
  },
  {
    word: '💪',
    category: 'emoji',
    rationale: 'Muscle emoji; informal motivation/hype',
  },
  {
    word: '🎯',
    category: 'emoji',
    rationale: 'Target emoji; overused in marketing content',
  },
  {
    word: '💡',
    category: 'emoji',
    rationale: 'Lightbulb emoji; overused "idea/insight" cliché',
  },
  {
    word: '🏆',
    category: 'emoji',
    rationale: 'Trophy emoji; implies winning/superiority',
  },
  {
    word: '🎉',
    category: 'emoji',
    rationale: 'Party emoji; too casual for professional content',
  },
  {
    word: '👏',
    category: 'emoji',
    rationale: 'Clap emoji; informal praise/celebration',
  },
  {
    word: '❤️',
    category: 'emoji',
    rationale: 'Heart emoji; emotional rather than factual',
  },
  {
    word: '😍',
    category: 'emoji',
    rationale: 'Heart-eyes emoji; excessive enthusiasm',
  },
  {
    word: '🤯',
    category: 'emoji',
    rationale: 'Mind-blown emoji; sensationalist reaction',
  },
  {
    word: '💯',
    category: 'emoji',
    rationale: '100 emoji; slang emphasis for perfection',
  },
  {
    word: '👀',
    category: 'emoji',
    rationale: 'Eyes emoji; clickbait attention-grabbing',
  },
  {
    word: '🙌',
    category: 'emoji',
    rationale: 'Raised hands emoji; informal celebration',
  },
  {
    word: '⭐',
    category: 'emoji',
    rationale: 'Star emoji; implies special/superior quality',
  },
  {
    word: '🌟',
    category: 'emoji',
    rationale: 'Glowing star emoji; hype emphasis',
  },
  {
    word: '💰',
    category: 'emoji',
    rationale: 'Money bag emoji; implies profit/financial hype',
  },
]

/** Flat list of all banned words (for quick lookup in detection) */
export const BANNED_HYPE_WORDS: string[] = BANNED_WORDS_LIST.map((b) => b.word)

/** Only English banned terms */
export const BANNED_EN_WORDS: string[] = BANNED_WORDS_LIST.filter(
  (b) => b.category === 'en'
).map((b) => b.word)

/** Only Korean banned terms */
export const BANNED_KO_WORDS: string[] = BANNED_WORDS_LIST.filter(
  (b) => b.category === 'ko'
).map((b) => b.word)

/** Only banned emojis */
export const BANNED_EMOJIS: string[] = BANNED_WORDS_LIST.filter(
  (b) => b.category === 'emoji'
).map((b) => b.word)
