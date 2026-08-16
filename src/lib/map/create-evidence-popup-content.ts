import { AccessibilityEvidence } from '@/types';

/**
 * Constructs a safe DOM element for MapLibre evidence popups using textContent.
 * Prevents stored XSS when rendering user-generated or external text content.
 */
export function createEvidencePopupContent(
  evidence: AccessibilityEvidence,
  color: string,
  sourceLabel: string
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'barrierless-evidence-popup';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.padding = '6px 8px';
  container.style.maxWidth = '220px';

  // 1. Source Header
  const sourceEl = document.createElement('div');
  sourceEl.style.fontSize = '10px';
  sourceEl.style.fontWeight = '700';
  sourceEl.style.textTransform = 'uppercase';
  sourceEl.style.color = color;
  sourceEl.style.letterSpacing = '0.5px';
  sourceEl.textContent = sourceLabel;

  // 2. Category Title
  const categoryEl = document.createElement('div');
  categoryEl.style.fontSize = '13px';
  categoryEl.style.fontWeight = '700';
  categoryEl.style.color = '#071A2F';
  categoryEl.style.marginTop = '2px';
  categoryEl.textContent = evidence.category;

  // 3. Description Body
  const descriptionEl = document.createElement('div');
  descriptionEl.style.fontSize = '11px';
  descriptionEl.style.color = '#4C637A';
  descriptionEl.style.marginTop = '4px';
  descriptionEl.style.lineHeight = '1.4';
  descriptionEl.textContent = evidence.description;

  container.appendChild(sourceEl);
  container.appendChild(categoryEl);
  container.appendChild(descriptionEl);

  // 4. Distance From Route Indicator
  if (evidence.distanceFromRouteMeters !== undefined) {
    const distEl = document.createElement('div');
    distEl.style.fontSize = '11px';
    distEl.style.color = '#0867E8';
    distEl.style.marginTop = '4px';
    distEl.style.fontWeight = '600';
    distEl.textContent = `Distance from selected route: ${evidence.distanceFromRouteMeters}m`;
    container.appendChild(distEl);
  }

  return container;
}
