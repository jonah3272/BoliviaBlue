import { Children, isValidElement, useEffect, useLayoutEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

const OWNER = 'data-bb-page-head';
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
const META_NAMES = new Set(['title', 'description', 'keywords', 'robots', 'application-name', 'apple-mobile-web-app-title', 'language', 'geo.region', 'geo.placename', 'twitter:card', 'twitter:url', 'twitter:title', 'twitter:description', 'twitter:image']);
const META_PROPERTIES = new Set(['og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'og:locale', 'og:locale:alternate', 'og:site_name']);
const ATTRIBUTES = { hrefLang: 'hreflang', charSet: 'charset', httpEquiv: 'http-equiv' };

function entriesFromChildren(children) {
  return Children.toArray(children).filter(isValidElement).map(({ type, props }) => ({
    tag: type,
    attributes: Object.fromEntries(Object.entries(props)
      .filter(([name, value]) => name !== 'children' && value != null && value !== false)
      .map(([name, value]) => [ATTRIBUTES[name] || name, String(value)])),
    text: props.children == null ? '' : String(props.children),
  }));
}

function removeInitialPageTags(head) {
  // These markers belong to our initial SEO shell / previous page metadata.
  // Existing exchange schemas have their own owner and remain untouched.
  for (const node of head.querySelectorAll('title:not([' + OWNER + ']), meta[data-rh], link[data-rh][rel="canonical"], link[data-rh][rel="alternate"][hreflang], script[data-rh][type="application/ld+json"]')) {
    if (node.tagName === 'META' && !META_NAMES.has(node.getAttribute('name')) && !META_PROPERTIES.has(node.getAttribute('property')) && node.getAttribute('http-equiv') !== 'refresh') continue;
    if (node.tagName === 'SCRIPT') {
      try {
        if (JSON.parse(node.textContent)?.['@type'] === 'ExchangeRateSpecification') continue;
      } catch { continue; }
    }
    node.remove();
  }
}

/** Page metadata changes the document only after its React render commits. */
export default function PageHead({ children }) {
  const adopted = useRef(false);
  const serialized = JSON.stringify(entriesFromChildren(children));
  useCommitEffect(() => {
    const entries = JSON.parse(serialized);
    const head = document.head;
    const previousLanguage = document.documentElement.getAttribute('lang');
    const language = entries.find(entry => entry.tag === 'html')?.attributes.lang;
    if (!adopted.current) {
      if (entries.some(entry => entry.tag !== 'script')) removeInitialPageTags(head);
      adopted.current = true;
    }
    const owned = [];
    for (const { tag, attributes, text } of entries) {
      if (tag === 'html') continue;
      if (!['title', 'meta', 'link', 'script'].includes(tag)) continue;
      const node = document.createElement(tag);
      node.setAttribute(OWNER, 'true');
      for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
      if (text) node.textContent = text;
      head.appendChild(node);
      owned.push(node);
    }
    if (language) document.documentElement.setAttribute('lang', language);
    return () => {
      // Remove exact nodes created by this committed instance, never another page or ad.
      for (const node of owned) node.remove();
      if (language && document.documentElement.getAttribute('lang') === language) {
        if (previousLanguage == null) document.documentElement.removeAttribute('lang');
        else document.documentElement.setAttribute('lang', previousLanguage);
      }
    };
  }, [serialized]);

  // Preserve server rendering compatibility; the production initial shell is built separately.
  return typeof document === 'undefined' ? <Helmet>{children}</Helmet> : null;
}
