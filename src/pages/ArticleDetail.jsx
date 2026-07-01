import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'

export default function ArticleDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [article, setArticle] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)

  async function fetchArticle() {
    try {
      const res = await fetch(`/api/articles?action=detail&id=${id}&userId=${user?.id || ''}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setArticle(data.article)
      setLiked(data.liked)
      setLikeCount(data.likeCount)
    } catch {
      setArticle(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArticle()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function toggleLike() {
    if (!user) { navigate('/login'); return }
    if (likeLoading) return
    setLikeLoading(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1)
    try {
      const res = await fetch(`/api/articles?action=like&id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, liked: wasLiked }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLiked(wasLiked)
      setLikeCount(wasLiked ? likeCount + 1 : likeCount - 1)
    } finally {
      setLikeLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>Loading...</p>
    </div>
  )

  if (!article) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>Article not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', paddingTop: '80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}
      >
        <button
          onClick={() => navigate('/articles')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '0 0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-sans)',
            transition: 'color var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Back to articles
        </button>

        <article>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            marginBottom: '16px',
          }}>
            {article.title}
          </h1>

          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '40px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--border-default)',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-sans)',
          }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{article.author_name}</span>
            <span>·</span>
            <span>{new Date(article.published_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>·</span>
            <span>{article.views} views</span>
          </div>

          <div style={{ marginBottom: '40px' }}>
            {article.content.split('\n').map((para, i) =>
              para.trim() ? (
                <p key={i} style={{
                  fontSize: '15px',
                  lineHeight: 1.85,
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {para}
                </p>
              ) : null
            )}
          </div>

          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--border-default)',
          }}>
            <button
              onClick={toggleLike}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: liked ? 'var(--success)' : 'var(--border-strong)',
                backgroundColor: liked ? 'var(--success-muted)' : 'transparent',
                color: liked ? 'var(--success)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: likeLoading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all var(--transition)',
              }}
            >
              {liked ? '♥' : '♡'} {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </button>
          </div>
        </article>
      </motion.div>

      <Footer />
    </div>
  )
}