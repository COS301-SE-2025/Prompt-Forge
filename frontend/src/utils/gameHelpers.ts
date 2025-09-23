export function normalizeScenario(raw: any): string {
  if (raw === null || raw === undefined) return ''
  let s = raw
  try {
    if (typeof raw === 'string') {
      s = raw.trim()
      if ((s.startsWith('{') && s.includes('scenario')) || s.startsWith('{"')) {
        try {
          const parsed = JSON.parse(s)
          if (parsed && typeof parsed === 'object' && parsed.scenario) return String(parsed.scenario)
        } catch (e) {
          try {
            const unescaped = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_m: string, g1: string) => String.fromCharCode(parseInt(g1, 16)))
            const parsed2 = JSON.parse(unescaped)
            if (parsed2 && parsed2.scenario) return String(parsed2.scenario)
          } catch (e2) {
            // fallthrough
          }
        }
      }

      if (s.includes('\\u')) {
        try {
          const unescaped = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_m: string, g1: string) => String.fromCharCode(parseInt(g1, 16)))
          if (typeof unescaped === 'string') {
            // Remove escaped backslashes and unescape escaped asterisks
            let cleaned = unescaped.replace(/\\\\/g, '\\')
            cleaned = cleaned.replace(/\\\*/g, '*')
            // Remove markdown emphasis markers like *text* or **text** or ***text***
            cleaned = cleaned.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
            return cleaned
          }
        } catch (e) {
          // ignore
        }
      }
      // Also strip stray markdown emphasis markers from plain strings and unescape common sequences
      try {
        let cleaned = s.replace(/\\\\/g, '\\')
        cleaned = cleaned.replace(/\\\*/g, '*')
        cleaned = cleaned.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
        // Trim any leftover whitespace/newlines
        return cleaned.trim()
      } catch (e) {
        return s
      }
    }
    return String(raw)
  } catch (e) {
    return String(raw)
  }
}

export function parseAIJudgment(text?: string | null) {
  if (!text) return { explanation: '', p1: null as number | null, p2: null as number | null }
  let s = String(text)
  // Unescape unicode sequences
  s = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_m, g1) => String.fromCharCode(parseInt(g1, 16)))

  // Attempt several common score patterns and also player-centric lines
  const patterns = [
  /Prompt\s*1\s*Score\s*[: -]?\s*(\d{1,2})\s*\/\s*(\d{1,2})/i,
  /Prompt1Score\s*[: -]?\s*(\d{1,2})/i,
  /Player\s*1\s*score\s*[: -]?\s*(\d{1,2})/i,
  /P1[:\s]*?(\d{1,2})\s*\/\s*(\d{1,2})/i,
  ]

  const patterns2 = [
  /Prompt\s*2\s*Score\s*[: -]?\s*(\d{1,2})\s*\/\s*(\d{1,2})/i,
  /Prompt2Score\s*[: -]?\s*(\d{1,2})/i,
  /Player\s*2\s*score\s*[: -]?\s*(\d{1,2})/i,
  /P2[:\s]*?(\d{1,2})\s*\/\s*(\d{1,2})/i,
  ]

  let p1: number | null = null
  let p2: number | null = null

  for (const re of patterns) {
    const m = s.match(re)
    if (m) {
      p1 = parseInt(m[1], 10)
      break
    }
  }
  for (const re of patterns2) {
    const m = s.match(re)
    if (m) {
      p2 = parseInt(m[1], 10)
      break
    }
  }

  // Also look for compact "Prompt 1: 6, Prompt 2: 0" lines
  if ((p1 === null || p2 === null)) {
    const compact = s.match(/Prompt\s*1[:\s]*?(\d{1,2})[,;\s]+Prompt\s*2[:\s]*?(\d{1,2})/i)
    if (compact) {
      p1 = p1 ?? parseInt(compact[1], 10)
      p2 = p2 ?? parseInt(compact[2], 10)
    }
  }

  // If still missing, try searching for 'Player X score: N' verbose logs
  if (p1 === null) {
    const v = s.match(/Player\s*1\s*score[: -]?\s*(\d{1,2})/i)
    if (v) p1 = parseInt(v[1], 10)
  }
  if (p2 === null) {
    const v = s.match(/Player\s*2\s*score[: -]?\s*(\d{1,2})/i)
    if (v) p2 = parseInt(v[1], 10)
  }
  // Create a cleaned explanation: remove any top-level score/winner lines and inline parenthetical scores,
  // strip markdown (asterisks/underscores/backticks), and normalize whitespace.
  let explanation = s
  try {
    // Remove header-like score declarations (lines starting with Prompt X Score / PromptXScore / Winner / Explanation)
  explanation = explanation.replace(/^\s*Prompt\s*1\s*Score[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Prompt\s*2\s*Score[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Prompt1Score[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Prompt2Score[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Player\s*1\s*score[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Player\s*2\s*score[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Winner[:\s-].*$/gim, '')
  explanation = explanation.replace(/^\s*Explanation[:\s-]*$/gim, '')

    // Remove inline parenthetical score blocks like "(Prompt 1: 10/10, Prompt 2: 1/10)" or "(Prompt1:10, Prompt2:1)"
    explanation = explanation.replace(/\(\s*(?:Prompt\s*1[^)]+|Prompt1[^)]+|Prompt\s*2[^)]+|Prompt2[^)]+|Player\s*1[^)]+|Player\s*2[^)]+)\s*\)/gi, '')
    // Also remove compact inline 'Prompt 1: 10, Prompt 2: 1' without parentheses
    explanation = explanation.replace(/Prompt\s*1[:\s]*\d{1,2}[^\n]*/gi, '')
    explanation = explanation.replace(/Prompt\s*2[:\s]*\d{1,2}[^\n]*/gi, '')

    // Strip common markdown: bold/italic asterisks, underscores, and inline code ticks
    explanation = explanation.replace(/\*{1,3}/g, '')
    explanation = explanation.replace(/_{1,3}/g, '')
    explanation = explanation.replace(/`+/g, '')

    // Remove stray repeated backslashes and unescape any remaining unicode escapes
    explanation = explanation.replace(/\\\\/g, '\\')
    explanation = explanation.replace(/\\u([0-9A-Fa-f]{4})/g, (_m, g1) => String.fromCharCode(parseInt(g1, 16)))

    // Normalize newlines and whitespace
    explanation = explanation.replace(/\r/g, '\n')
    explanation = explanation.replace(/\n{3,}/g, '\n\n')
    explanation = explanation.replace(/\t/g, ' ')
    explanation = explanation.replace(/\s{2,}/g, ' ')
    explanation = explanation.trim()
  } catch (e) {
    // If cleaning fails, fall back to raw text
    explanation = s
  }

  // Split into paragraphs at numbered markers like '1.' or at blank lines. Keep order and numbering.
  const paragraphs = explanation
    .split(/\n\s*\n|\n(?=\d+\.)/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  // Final pass: remove any leftover leading numbering labels like '1.' from paragraph starts while keeping the text
  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i] = paragraphs[i].replace(/^\d+\.\s*/g, '').trim()
  }
  // Make sure the explanation is plain text: no markdown, no embedded score snippets
  const cleanedExplanation = paragraphs
    .map(p => p.replace(/\*{1,3}|_{1,3}|`+/g, '').trim())
    .map(p => p.replace(/\s{2,}/g, ' '))
    .join('\n\n')

  return { explanation: cleanedExplanation, p1, p2, paragraphs: cleanedExplanation.split('\n\n') }
}
