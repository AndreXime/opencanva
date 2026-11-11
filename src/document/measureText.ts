import Konva from 'konva'
import type { TextElement } from './types'

export const DEFAULT_TEXT_LINE_HEIGHT = 1.3

/** @deprecated use DEFAULT_TEXT_LINE_HEIGHT */
export const TEXT_LINE_HEIGHT = DEFAULT_TEXT_LINE_HEIGHT

export function measureTextBlockHeight(
  element: Pick<
    TextElement,
    | 'text'
    | 'width'
    | 'fontSize'
    | 'fontFamily'
    | 'fontStyle'
    | 'align'
    | 'letterSpacing'
    | 'lineHeight'
  >,
  text = element.text,
): number {
  const lineHeight = element.lineHeight || DEFAULT_TEXT_LINE_HEIGHT
  const probe = new Konva.Text({
    text: text.length > 0 ? text : ' ',
    width: Math.max(20, element.width),
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    fontStyle: element.fontStyle,
    align: element.align,
    letterSpacing: element.letterSpacing ?? 0,
    lineHeight,
    wrap: 'word',
    padding: 0,
  })
  const measured = probe.height()
  probe.destroy()
  return Math.ceil(Math.max(element.fontSize * lineHeight, measured) + 2)
}
