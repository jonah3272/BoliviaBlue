import { supabase } from './supabase';

/**
 * Fetch all blog articles from Supabase
 * @param {string} language - 'es' or 'en'
 * @returns {Promise<Array>} Array of blog articles
 */
export async function fetchBlogArticles(language = 'es') {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('language', language)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog articles:', error);
      throw error;
    }

    return data || [];
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
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured blog articles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchFeaturedBlogArticles:', error);
    return [];
  }
}

