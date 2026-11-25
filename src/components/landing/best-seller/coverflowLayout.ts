// src/components/landing/best-seller/coverflowLayout.ts

export interface CoverflowStep {
  x: number
  y: number
  rotate: number
  scale: number
  opacity: number
}

export interface CoverflowLayout {
  cardWidth: number
  /** Index 0 is the active card; each further entry is one slot outward on both sides. */
  steps: CoverflowStep[]
  /** How far the dropped, tilted side cards reach below the active card. */
  dropAllowance: number
}

const DESKTOP_MIN_WIDTH = 1024
const TABLET_MIN_WIDTH = 640
const MIN_CARD_WIDTH = 200

/** Card height = image (202/234 aspect) scaling with width + fixed-size text and padding. */
const CARD_HEIGHT_PER_WIDTH = 1.16
const CARD_FIXED_HEIGHT = 80
/** Section height outside the card: padding, header, frame padding, dots and CTA. */
const SECTION_CHROME_HEIGHT = 350
const FRAME_BOTTOM_PER_WIDTH = 18 / 228

const ACTIVE: CoverflowStep = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function tiltDrop(cardWidth: number, step: CoverflowStep) {
  return step.y + (cardWidth * step.scale * Math.sin((step.rotate * Math.PI) / 180)) / 2
}

/** Widest card that still lets the whole section fit in one screen height. */
function fitCardWidth(viewportHeight: number) {
  const available = viewportHeight - SECTION_CHROME_HEIGHT - CARD_FIXED_HEIGHT
  return Math.max(MIN_CARD_WIDTH, available / (CARD_HEIGHT_PER_WIDTH + FRAME_BOTTOM_PER_WIDTH))
}

/**
 * Figma "Frame 24" (110:5888) fan, expressed relative to card width so it scales with the frame:
 * neighbours step ~1.08 card widths out, drop and tilt 5°/10°. Narrower frames show fewer neighbours
 * and pull them inward so every visible card stays inside the frame.
 */
export function getCoverflowLayout(frameWidth: number, viewportHeight: number): CoverflowLayout {
  const half = frameWidth / 2
  const maxCardWidth = fitCardWidth(viewportHeight)

  if (frameWidth >= DESKTOP_MIN_WIDTH) {
    const cardWidth = Math.min(Math.max(frameWidth * 0.2, 240), maxCardWidth)
    const step1: CoverflowStep = { x: cardWidth * 1.08, y: cardWidth * 0.15, rotate: 5, scale: 0.9, opacity: 1 }
    const step2: CoverflowStep = {
      x: Math.min(cardWidth * 2.12, half - (cardWidth * 0.85) / 2),
      y: cardWidth * 0.46,
      rotate: 10,
      scale: 0.85,
      opacity: 1,
    }
    return {
      cardWidth,
      steps: [ACTIVE, step1, step2],
      dropAllowance: tiltDrop(cardWidth, step2),
    }
  }

  if (frameWidth >= TABLET_MIN_WIDTH) {
    const cardWidth = Math.min(clamp(frameWidth * 0.36, 240, 280), maxCardWidth)
    const step1: CoverflowStep = {
      // Extra 16px leaves room for the tilted card's corners.
      x: Math.min(cardWidth * 1.08, half - (cardWidth * 0.9) / 2 - 16),
      y: cardWidth * 0.12,
      rotate: 5,
      scale: 0.9,
      opacity: 0.85,
    }
    return {
      cardWidth,
      steps: [ACTIVE, step1],
      dropAllowance: tiltDrop(cardWidth, step1),
    }
  }

  // Mobile: a flat peek row — tilted neighbours tucked behind a narrow card read as clutter.
  const cardWidth = Math.min(clamp(frameWidth * 0.68, 220, 300), maxCardWidth)
  const scale = 0.86
  const step1: CoverflowStep = {
    x: (cardWidth + cardWidth * scale) / 2 + 14,
    y: 0,
    rotate: 0,
    scale,
    opacity: 0.55,
  }
  return {
    cardWidth,
    steps: [ACTIVE, step1],
    dropAllowance: 0,
  }
}
