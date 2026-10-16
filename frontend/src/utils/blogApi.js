import { supabase } from './supabase';
import { reviewedRetrospective, reviewedRetrospectiveIds, isDiscoverableBlogArticle } from '../data/reviewedRetrospectives';

// Keep the broad legacy exclusion. Fetch only reviewed candidates separately,
// then verify each complete row before allowing discovery. Fail closed on errors.
async function fetchReviewedRetrospectives(language) {
  const ids = reviewedRetrospectiveIds(language);
  if (!ids.length) return [];
  try {
    const { data, error } = await supabase.from('blog_articles').select('*')
      .eq('language', language).in('id', ids).neq('category', 'daily-evidence');
    return error ? [] : (data || []).filter((article) => reviewedRetrospective(article));
  } catch { return []; }
}

function byEditorialDate(a, b) {
  const date = (row) => reviewedRetrospective(row)?.revisedAt || row.published_at || row.created_at;
  return Date.parse(date(b)) - Date.parse(date(a));
}

/**
 * Fetch all blog articles from Supabase
 * @param {string} language - 'es' or 'en'
 * @returns {Promise<Array>} Array of blog articles
 */
export async function fetchBlogArticles(language = 'es') {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('id,slug,language,title,excerpt,author,category,featured,read_time,published_at,created_at')
      .eq('language', language)
      .neq('category', 'daily-evidence')
      .not('slug', 'like', 'analisis-diario-%')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog articles:', error);
      throw error;
    }

    return [...(data || []).filter(isDiscoverableBlogArticle), ...await fetchReviewedRetrospectives(language)].sort(byEditorialDate);
  } catch (error) {
    console.error('Error in fetchBlogArticles:', error);
    // Fallback to empty array if Supabase is not configured
    return [];
  }
}

/**
 * Fetch a single blog article by slug
 * @param {string} slug - Article slug
 * @param {string} language - 'es' or 'en'
 * @returns {Promise<Object|null>} Blog article or null
 */
export async function fetchBlogArticleBySlug(slug, language = 'es') {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .eq('language', language)
      .neq('category', 'daily-evidence')
      .single();

    if (error) {
      console.error('Error fetching blog article:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchBlogArticleBySlug:', error);
    return null;
  }
}

/**
 * Fetch featured blog articles
 * @param {string} language - 'es' or 'en'
 * @param {number} limit - Maximum number of articles to return
 * @returns {Promise<Array>} Array of featured blog articles
 */
export async function fetchFeaturedBlogArticles(language = 'es', limit = 5) {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('language', language)
      .neq('category', 'daily-evidence')
      .not('slug', 'like', 'analisis-diario-%')
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured blog articles:', error);
      throw error;
    }

    return [...(data || []).filter(isDiscoverableBlogArticle), ...(await fetchReviewedRetrospectives(language)).filter((article) => article.featured)]
      .sort(byEditorialDate).slice(0, limit);
  } catch (error) {
    console.error('Error in fetchFeaturedBlogArticles:', error);
    return [];
  }
}

