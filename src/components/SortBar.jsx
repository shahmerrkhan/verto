import { useState } from 'react'

export default function SortBar({ onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState('relevance')

  const sorts = [
    { value: 'relevance', label: 'Most relevant' },
    { value: 'deadline-asc', label: 'Deadline soon' },
    { value: 'amount-desc', label: 'Highest amount' },
  ]

  const selectedLabel = sorts.find(s => s.value === selected)?.label

  function handleSelect(value) {
    setSelected(value)
    onSortChange(value)
    setIsOpen(false)
  }

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>Sort by:</span>
      <div style={styles.container}>
        <button
          style={styles.trigger}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#064e3b'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
        >
          {selectedLabel}
          <span style={{
            ...styles.chevron,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▾</span>
        </button>

        {isOpen && (
          <>
            <div style={styles.backdrop} onClick={() => setIsOpen(false)} />
            <div style={styles.dropdown}>
              {sorts.map(sort => (
                <button
                  key={sort.value}
                  style={{
                    ...styles.option,
                    backgroundColor: selected === sort.value ? '#f0fdf4' : '#fff',
                    color: selected === sort.value ? '#064e3b' : '#333',
                    fontWeight: selected === sort.value ? '600' : '400',
                  }}
                  onClick={() => handleSelect(sort.value)}
                  onMouseEnter={e => {
                    if (selected !== sort.value) e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={e => {
                    if (selected !== sort.value) e.currentTarget.style.backgroundColor = '#fff'
                  }}
                >
                  {sort.label}
                  {selected === sort.value && <span style={styles.check}>✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#7d8590',
    whiteSpace: 'nowrap',
  },
  container: {
    position: 'relative',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: '#161b22',
    fontSize: '13px',
    fontWeight: '500',
    color: '#e6edf3',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  chevron: {
    fontSize: '12px',
    color: '#7d8590',
    transition: 'transform 0.2s ease',
    display: 'inline-block',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    backgroundColor: '#161b22',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 10,
    minWidth: '160px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  option: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    textAlign: 'left',
    backgroundColor: '#161b22',
    color: '#e6edf3',
  },
  check: {
    color: '#f59e0b',
    fontSize: '12px',
    fontWeight: '700',
  },
}