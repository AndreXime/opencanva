import type { TextDecoration, TextElement, TextFontStyle } from './types'
import { DEFAULT_TEXT_LINE_HEIGHT } from './measureText'

export function isBold(fontStyle: TextFontStyle): boolean {
  return fontStyle.includes('bold')
}

export function isItalic(fontStyle: TextFontStyle): boolean {
  return fontStyle.includes('italic')
}

export function toggleBold(fontStyle: TextFontStyle): TextFontStyle {
  if (isBold(fontStyle)) {
    return isItalic(fontStyle) ? 'italic' : 'normal'
  }
  return isItalic(fontStyle) ? 'bold italic' : 'bold'
}

export function toggleItalic(fontStyle: TextFontStyle): TextFontStyle {
  if (isItalic(fontStyle)) {
    return isBold(fontStyle) ? 'bold' : 'normal'
  }
  return isBold(fontStyle) ? 'bold italic' : 'italic'
}

export function toggleUnderline(
  textDecoration: TextDecoration,
): TextDecoration {
  return textDecoration === 'underline' ? 'none' : 'underline'
}

export function normalizeTextElement(
  element: TextElement,
): TextElement {
  return {
    ...element,
    fontStyle: element.fontStyle ?? 'normal',
    textDecoration: element.textDecoration ?? 'none',
    letterSpacing:
      typeof element.letterSpacing === 'number' ? element.letterSpacing : 0,
    lineHeight:
      typeof element.lineHeight === 'number'
        ? element.lineHeight
        : DEFAULT_TEXT_LINE_HEIGHT,
  }
}
