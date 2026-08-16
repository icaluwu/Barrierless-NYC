import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createEvidencePopupContent } from './create-evidence-popup-content';
import { AccessibilityEvidence } from '@/types';

class MockDOMElement {
  tagName: string;
  style: Record<string, string> = {};
  className = '';
  private _textContent = '';
  children: MockDOMElement[] = [];

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  set textContent(val: string) {
    this._textContent = val;
  }

  get textContent(): string {
    return this._textContent + this.children.map((c) => c.textContent).join('');
  }

  appendChild(child: MockDOMElement) {
    this.children.push(child);
  }

  append(...children: MockDOMElement[]) {
    children.forEach((c) => this.appendChild(c));
  }

  querySelector(selector: string): MockDOMElement | null {
    const targetTag = selector.toUpperCase();
    for (const child of this.children) {
      if (child.tagName === targetTag) return child;
      const subMatch = child.querySelector(selector);
      if (subMatch) return subMatch;
    }
    return null;
  }
}

describe('createEvidencePopupContent (Stored XSS Protection)', () => {
  const origDocument = (globalThis as any).document;

  beforeEach(() => {
    (globalThis as any).document = {
      createElement: (tag: string) => new MockDOMElement(tag),
    };
  });

  afterEach(() => {
    (globalThis as any).document = origDocument;
  });

  it('renders malicious HTML tags as plain text nodes without producing executable DOM elements', () => {
    const maliciousEvidence: AccessibilityEvidence = {
      id: 'xss-1',
      source: 'community',
      sourceType: 'community',
      sourceName: '<script>alert("xss-source")</script>',
      coordinate: [-73.985, 40.758],
      severity: 'high',
      category: '<img src=x onerror=alert(1)>',
      description: '<a href="javascript:alert(1)">Click me</a>',
      distanceFromRouteMeters: 12,
    };

    const popupEl = createEvidencePopupContent(
      maliciousEvidence,
      '#7C3AED',
      maliciousEvidence.sourceName || 'Community Report'
    ) as unknown as MockDOMElement;

    // Verify that NO executable tags (<script>, <img>, <a>) were injected into the DOM tree
    expect(popupEl.querySelector('script')).toBeNull();
    expect(popupEl.querySelector('img')).toBeNull();
    expect(popupEl.querySelector('a')).toBeNull();

    // Verify that the text content literally contains the malicious input strings safely encoded as text
    expect(popupEl.textContent).toContain('<script>alert("xss-source")</script>');
    expect(popupEl.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(popupEl.textContent).toContain('<a href="javascript:alert(1)">Click me</a>');
    expect(popupEl.textContent).toContain('Distance from selected route: 12m');
  });
});
