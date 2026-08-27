import type { ReactNode } from 'react'

/**
 * Renders the legal page bodies.
 *
 * These used to be dumped into a `white-space: pre-wrap` div, so every
 * `**Section heading**` appeared on the live site with its asterisks showing.
 * The factory's placeholder text had the same problem from the start — it went
 * unnoticed because nobody ever read those pages.
 *
 * A deliberately small parser rather than a markdown dependency: this renders
 * three checked-in files written by us, not user input, and the whole grammar
 * is a bold line, a bullet, an italic footer, and inline bold. Real headings
 * also mean the document has a structure a screen reader can move through.
 */

const BOLD_LINE = /^\*\*(.+)\*\*$/
const ITALIC_LINE = /^\*(.+)\*$/

/** Turns `**bold**` inside a line of prose into real emphasis. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/)
    return match ? <strong key={`${keyPrefix}-${index}`}>{match[1]}</strong> : part
  })
}

export function LegalBody({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

  return (
    <div className="legal-body">
      {blocks.map((block, index) => {
        const key = `b${index}`

        const heading = block.match(BOLD_LINE)
        if (heading) return <h2 key={key}>{heading[1]}</h2>

        if (block.split('\n').every((line) => line.trim().startsWith('- '))) {
          return (
            <ul key={key}>
              {block.split('\n').map((line, i) => (
                <li key={`${key}-${i}`}>{inline(line.trim().slice(2), `${key}-${i}`)}</li>
              ))}
            </ul>
          )
        }

        const italic = block.match(ITALIC_LINE)
        if (italic) {
          return (
            <p key={key} className="legal-footnote">
              {italic[1]}
            </p>
          )
        }

        return <p key={key}>{inline(block, key)}</p>
      })}
    </div>
  )
}
