import { useState } from 'react'

export default function FilterBar({ onFilterChange, opportunities }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const types = ['all', 'scholarship', 'competition', 'internship', 'program', 'grant']

  function handleSearch(value) {
    setSearchTerm(value)
    onFilterChange({ search: value, type: selectedType })
  }

  function handleTypeChange(type) {
    setSelectedType(type)
    onFilterChange({ search: searchTerm, type })
  }

  return (
    <div style={{ marginBottom: '24px', backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <input
        type="text"
        placeholder="Search opportunities..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
        onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' }}>Type</span>
        {types.map(type => (
          <button key={type} onClick={() => handleTypeChange(type)} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid', borderColor: selectedType === type ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: selectedType === type ? 'rgba(245,158,11,0.1)' : 'transparent', color: selectedType === type ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        {(searchTerm || selectedType !== 'all') && (
          <button style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => { setSearchTerm(''); setSelectedType('all'); onFilterChange({ search: '', type: 'all' }) }}>
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  )
}