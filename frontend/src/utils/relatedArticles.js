/** Keep source order inside each group; never recommend the current slug twice. */
export function selectRelatedArticles(candidates, currentArticle, limit = 2, excludedSlugs = []) {
  const currentSlug = currentArticle?.slug;
  const category = currentArticle?.category;
  const seen = new Set([currentSlug, ...excludedSlugs]);
  const available = (Array.isArray(candidates) ? candidates : []).filter((article) => {
    if (!article || typeof article.slug !== 'string' || !article.slug.trim() || !article.title || seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  });
  const sameCategory = available.filter((article) => category && article.category === category);
  const otherCategories = available.filter((article) => !category || article.category !== category);
  return [...sameCategory, ...otherCategories].slice(0, limit);
}
