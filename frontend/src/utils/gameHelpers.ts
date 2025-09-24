export function normalizeScenario(raw: any): string {
  if (raw === null || raw === undefined) return ''
  try {
    if (typeof raw === 'string') {
      let s = raw.trim()

      // If payload looks like JSON with a scenario field, try to parse
      if ((s.startsWith('{') && s.includes('scenario')) || s.startsWith('{"')) {
        try {
          const parsed = JSON.parse(s)
          if (parsed && typeof parsed === 'object' && parsed.scenario) return String(parsed.scenario)
        } catch (e) {
          try {
            const unescaped = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_m: string, g1: string) => String.fromCharCode(parseInt(g1, 16)))
            const parsed2 = JSON.parse(unescaped)
            if (parsed2 && parsed2.scenario) return String(parsed2.scenario)
          } catch (_) {
            // fallthrough to plain-string cleaning
          }
        }
      }

      // Unescape unicode sequences and common escaped characters
      s = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_m: string, g1: string) => String.fromCharCode(parseInt(g1, 16)))
      s = s.replace(/\\\\/g, '\\')
      s = s.replace(/\\\*/g, '*')

      // Remove markdown emphasis markers like *text* or **text** or ***text***
      s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')

      return s.trim()
    }
    return String(raw)
  } catch (e) {
    return String(raw)
  }
}

export function parseAIJudgment(text?: string | null) {
  const empty = { explanation: '', p1: null as number | null, p2: null as number | null, paragraphs: [] as string[] }
  if (!text) return empty

  let s = String(text)

  // Unescape unicode sequences
  s = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_m: string, g1: string) => String.fromCharCode(parseInt(g1, 16)))

  // Remove obvious noisy score/winner lines that sometimes prefix the AI response
  s = s.replace(/PROMPT\s*1\s*SCORE[:\s-]*[^\n]*/gi, '')
  s = s.replace(/PROMPT\s*2\s*SCORE[:\s-]*[^\n]*/gi, '')
  s = s.replace(/Prompt\s*1[:\s]*\d{1,2}[^\n]*/gi, '')
  s = s.replace(/Prompt\s*2[:\s]*\d{1,2}[^\n]*/gi, '')
  s = s.replace(/Winner[:\s-]*[^\n]*/gi, '')

  // Ensure known headings are on their own line (helps when AI outputs everything on one line)
  const headingKeywords = ['Relevance', 'Clarity', 'Specificity', 'Structure', 'Context', 'Actionability', 'Overall', 'Conclusion', 'Analysis']
  // First, handle compact separators like "Relevance: - - Clarity:" where single hyphens separated by spaces
  // were used between headings. Convert the hyphen-run into a newline so headings split.
  const sepBetweenHeadings = new RegExp(
    `(${headingKeywords.join('|')})\\s*[: -]?\\s*(?:[–—-]\\s*)+(?=(?:${headingKeywords.join('|')})\\s*[: -]?)`,
    'gi'
  )
  // Use a blank-line separator so later split('\n\n') yields distinct paragraphs
  s = s.replace(sepBetweenHeadings, (_m: string, h: string) => `${h}:\n\n`)

  // Then ensure every heading keyword followed by ':' begins on its own line. Simpler and more reliable
  // than indexing into the full string.
  const headingInsert = new RegExp(`(^|\\n)\\s*(${headingKeywords.join('|')})\\s*:`, 'gi')
  // Insert a blank-line before headings to make them paragraph separators
  s = s.replace(headingInsert, (_m: string, p1: string, h: string) => `\n\n${h}:`)

  // Normalize separators and whitespace. Treat runs of dashes or em/en-dashes as paragraph breaks
  s = s.replace(/\s*[–—-]{2,}\s*/g, '\n\n')
  s = s.replace(/\r/g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')

  // Helper to clean markdown and escaped characters
  const cleanText = (t: string) =>
    t
      .replace(/\*{1,3}|_{1,3}|`+/g, '')
      .replace(/\\u[0-9A-Fa-f]{4}/g, '')
      .replace(/\\\\/g, '\\')
      .replace(/Prompt\s*\d+\s*scores?\s*\d+\/\d+/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

  // If structured headings are present, parse them into sections
  const structuredPattern = /^\s*(${headingKeywords.join('|')})\s*:/im
  if (structuredPattern.test(s)) {
    const sections: { [key: string]: string } = {}
  const lines = s.split('\n')
  let currentSection = ''
  let currentContent = ''
  // collect any text that appears outside the known heading sections
  let freeText = ''

    for (const rawLine of lines) {
      const line = rawLine.trim()
      // keep blank lines to separate sections but skip accidental whitespace-only lines
      if (!line) continue
      const sectionMatch = line.match(new RegExp(`^(${headingKeywords.join('|')})\\s*:\\s*(.*)$`, 'i'))
      if (sectionMatch) {
        // Always store previous section (even if empty) so headings aren't dropped
        if (currentSection !== '') sections[currentSection] = currentContent.trim()
        currentSection = sectionMatch[1]
        currentContent = sectionMatch[2] || ''
      } else if (currentSection) {
        currentContent += (currentContent ? ' ' : '') + line
      } else {
        // text before the first recognized heading: keep it as freeText
        freeText += (freeText ? '\n' : '') + line
      }
    }
    // store the final section (may be empty)
    if (currentSection !== '') sections[currentSection] = currentContent.trim()

    // If there was free-standing text (before the first heading), keep it to append later
    const freeSummary = freeText.trim()

    const sectionOrder = headingKeywords
    const paragraphs: string[] = []
    for (const section of sectionOrder) {
      // normalize and strip leftover hyphen placeholders like "- -" or sequences of dashes
      const rawContent = (sections[section] ?? '').replace(/(?:\s*[–—-]{1,}\s*)+/g, ' ').trim()
      const content = cleanText(rawContent)
      // if content is empty or only punctuation/hyphens, provide a readable placeholder
      const final = content && !/^[-\s]*$/.test(content) ? content : 'No comment.'
      paragraphs.push(`${section}: ${final}`)
    }
    // If there was free-standing explanatory text, append it as a Summary paragraph so it's not lost
    if (freeSummary) paragraphs.push(`Summary: ${cleanText(freeSummary)}`)
    const cleanedExplanation = paragraphs.join('\n\n')
    return { explanation: cleanedExplanation, p1: null, p2: null, paragraphs }
  }

  // Markdown-style ### headers parsing
  if (s.includes('###')) {
    const sections: { [key: string]: string } = {}
    const lines = s.split('\n')
    let currentSection = ''
    let currentContent = ''
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) continue
      const headerMatch = line.match(/^###\s*([A-Za-z][A-Za-z\s\-']*)/)
      if (headerMatch) {
        if (currentSection && currentContent.trim()) sections[currentSection] = currentContent.trim()
        currentSection = headerMatch[1].replace(/\s*\([^)]*\)/, '')
        currentContent = ''
      } else if (currentSection) {
        let cleanedLine = line.replace(/^[•\-*]\s*/, '')
        cleanedLine = cleanedLine.replace(/^\d+\.\s*/, '')
        if (cleanedLine) currentContent += (currentContent ? ' ' : '') + cleanedLine
      }
    }
    if (currentSection && currentContent.trim()) sections[currentSection] = currentContent.trim()

    const sectionOrder = headingKeywords
    const paragraphs: string[] = []
    for (const section of sectionOrder) {
      const key = Object.keys(sections).find(k => k.toLowerCase().includes(section.toLowerCase()))
      const rawContent = key ? (sections[key] ?? '') : ''
      const cleaned = cleanText(rawContent.replace(/(?:\s*[–—-]{1,}\s*)+/g, ' ')).trim()
      const final = cleaned && !/^[-\s]*$/.test(cleaned) ? cleaned : 'No comment.'
      paragraphs.push(`${section}: ${final}`)
    }
    const cleanedExplanation = paragraphs.join('\n\n')
    return { explanation: cleanedExplanation, p1: null, p2: null, paragraphs }
  }

  // Fallback: try to extract numeric scores and produce cleaned explanation paragraphs
  const scorePatterns1 = [
    /Prompt\s*1\s*Score\s*[: -]?\s*(\d{1,2})\s*\/\s*(\d{1,2})/i,
    /Prompt1Score\s*[: -]?\s*(\d{1,2})/i,
    /Player\s*1\s*score\s*[: -]?\s*(\d{1,2})/i,
    /P1[:\s]*?(\d{1,2})\s*\/\s*(\d{1,2})/i,
  ]
  const scorePatterns2 = [
    /Prompt\s*2\s*Score\s*[: -]?\s*(\d{1,2})\s*\/\s*(\d{1,2})/i,
    /Prompt2Score\s*[: -]?\s*(\d{1,2})/i,
    /Player\s*2\s*score\s*[: -]?\s*(\d{1,2})/i,
    /P2[:\s]*?(\d{1,2})\s*\/\s*(\d{1,2})/i,
  ]

  let p1: number | null = null
  let p2: number | null = null
  for (const re of scorePatterns1) {
    const m = s.match(re)
    if (m) { p1 = parseInt(m[1], 10); break }
  }
  for (const re of scorePatterns2) {
    const m = s.match(re)
    if (m) { p2 = parseInt(m[1], 10); break }
  }

  if ((p1 === null || p2 === null)) {
    const compact = s.match(/Prompt\s*1[:\s]*?(\d{1,2})[,;\s]+Prompt\s*2[:\s]*?(\d{1,2})/i)
    if (compact) {
      p1 = p1 ?? parseInt(compact[1], 10)
      p2 = p2 ?? parseInt(compact[2], 10)
    }
  }

  if (p1 === null) {
    const v = s.match(/Player\s*1\s*score[: -]?\s*(\d{1,2})/i)
    if (v) p1 = parseInt(v[1], 10)
  }
  if (p2 === null) {
    const v = s.match(/Player\s*2\s*score[: -]?\s*(\d{1,2})/i)
    if (v) p2 = parseInt(v[1], 10)
  }

  // Clean the main explanation text: strip score lines, markdown and extraneous whitespace
  let explanation = s
  try {
    explanation = explanation.replace(/^\s*Prompt\s*1\s*Score[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Prompt\s*2\s*Score[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Prompt1Score[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Prompt2Score[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Player\s*1\s*score[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Player\s*2\s*score[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Winner[:\s-].*$/gim, '')
    explanation = explanation.replace(/^\s*Explanation[:\s-]*$/gim, '')
    explanation = explanation.replace(/\(\s*(?:Prompt\s*1[^)]+|Prompt1[^)]+|Prompt\s*2[^)]+|Prompt2[^)]+|Player\s*1[^)]+|Player\s*2[^)]+)\s*\)/gi, '')
    explanation = explanation.replace(/Prompt\s*1[:\s]*\d{1,2}[^\n]*/gi, '')
    explanation = explanation.replace(/Prompt\s*2[:\s]*\d{1,2}[^\n]*/gi, '')
    explanation = explanation.replace(/\*{1,3}/g, '')
    explanation = explanation.replace(/_{1,3}/g, '')
    explanation = explanation.replace(/`+/g, '')
    explanation = explanation.replace(/\\\\/g, '\\')
    explanation = explanation.replace(/\\u([0-9A-Fa-f]{4})/g, (_m: string, g1: string) => String.fromCharCode(parseInt(g1, 16)))
    explanation = explanation.replace(/\r/g, '\n')
    explanation = explanation.replace(/\n{3,}/g, '\n\n')
    explanation = explanation.replace(/\t/g, ' ')
    explanation = explanation.replace(/\s{2,}/g, ' ')
    explanation = explanation.trim()
  } catch (e) {
    explanation = s
  }

  const paragraphs = explanation
    .split(/\n\s*\n|\n(?=\d+\.)/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0)

  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i] = paragraphs[i].replace(/^\d+\.\s*/g, '').trim()
  }

  // If any paragraph is just a heading with no content (e.g. "Relevance:"), attach a placeholder
  for (let i = 0; i < paragraphs.length; i++) {
    const m = paragraphs[i].match(/^([A-Za-z][A-Za-z\s\-']*:)\s*$/)
    if (m) paragraphs[i] = `${m[1]} No comment.`
    // strip leftover dash placeholders inside paragraphs
    paragraphs[i] = paragraphs[i].replace(/(?:\s*[–—-]{1,}\s*)+/g, ' ').trim()
  }

  const cleanedExplanation = paragraphs
    .map((p: string) => p.replace(/\*{1,3}|_{1,3}|`+/g, '').trim())
    .map((p: string) => p.replace(/\s{2,}/g, ' '))
    .join('\n\n')

  return { explanation: cleanedExplanation, p1, p2, paragraphs: cleanedExplanation ? cleanedExplanation.split('\n\n') : [] }
}
