import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

export default function ArticleDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticle()
  }, [id])

  async function fetchArticle() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error) {
      setLoading(false)
      return
    }

    setArticle(data)
    setLikeCount(0)
    
    // Increment views
    await supabase
      .from('articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)

    // Check if user liked it
    if (user) {
      const { data: likeData } = await supabase
        .from('article_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('article_id', id)
        .single()
      
      if (likeData) setLiked(true)
    }

    // Fetch like count
    const { data: likes } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact' })
      .eq('article_id', id)

    setLikeCount(likes?.length || 0)
    setLoading(false)
  }

  async function toggleLike() {
    if (!user) {
      navigate('/login')
      return
    }

    if (liked) {
      await supabase
        .from('article_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', id)
      setLiked(false)
      setLikeCount(likeCount - 1)
    } else {
      await supabase
        .from('article_likes')
        .insert({ user_id: user.id, article_id: id })
      setLiked(true)
      setLikeCount(likeCount + 1)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '15px' }}>
      Loading article...
    </div>
  )

  if (!article) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '15px' }}>
      Article not found
    </div>
  )

  return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '96px 24px 80px', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
          <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/articles')}
          style={{ background: 'none', border: 'none', color: '#064e3b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ← Back to articles
        </button>
      </div>

      <article style={styles.article}>
        <h1 style={styles.title}>{article.title}</h1>

        <div style={styles.meta}>
          <span style={styles.author}>{article.author_name}</span>
          <span style={styles.separator}>{String.fromCharCode(8226)}</span>
          <span style={styles.date}>
            {new Date(article.published_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span style={styles.separator}>{String.fromCharCode(8226)}</span>
          <span style={styles.views}>{article.views} views</span>
        </div>

        <div style={styles.content}>
          {article.content.split('\n').map((para, i) => (
            para.trim() && <p key={i} style={styles.paragraph}>{para}</p>
          ))}
        </div>

        <div style={styles.footer}>
          <button
            style={{...styles.likeBtn, backgroundColor: liked ? '#f0fdf4' : '#fff', borderColor: liked ? '#10b981' : '#e0e0e0', color: liked ? '#10b981' : '#666'}}
            onClick={toggleLike}
            onMouseEnter={e => !liked && (e.target.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={e => !liked && (e.target.style.backgroundColor = '#fff')}
          >
            {liked ? '❤' : '🤍'} {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </button>
        </div>
      </article>

      <Footer />
    </div>
  )
}

const styles = {
  header: { marginBottom: '32px' },
  backBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #064e3b', backgroundColor: 'transparent', color: '#064e3b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  article: { backgroundColor: '#fff', borderRadius: '16px', padding: '48px', border: '1px solid #e5e7eb', boxShadow: '0 1px 16px rgba(0,0,0,0.04)' },
  title: { fontSize: '34px', fontWeight: '700', color: '#0a0a0a', marginBottom: '16px', lineHeight: 1.15, letterSpacing: '-1px' },
  meta: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '36px', flexWrap: 'wrap', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' },
  author: { fontWeight: '600', color: '#374151' },
  separator: { color: '#d1d5db' },
  date: {},
  views: { color: '#6b7280' },
  content: { marginBottom: '32px' },
  paragraph: { fontSize: '15px', lineHeight: 1.8, color: '#374151', marginBottom: '16px' },
  footer: { paddingTop: '24px', borderTop: '1px solid #e5e7eb' },
  likeBtn: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
}