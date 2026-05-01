import { useState } from 'react'

export default function FilterBar({ onFilterChange, opportunities }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const types = ['all', 'scholarship', 'competition', 'internship', 'program', 'grant']

  function handleSearch(value) {
    setSearchTerm(value)
    onFilterChange({
      search: value,
      type: selectedType,
    })
  }

  function handleTypeChange(type) {
    setSelectedType(type)
    onFilterChange({
      search: searchTerm,
      type: type,
    })
  }

  return (
    <div style={styles.container} className="filterBar">
      <input
        type="text"
        placeholder="Search opportunities..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.typeFilter}>
        {types.map(type => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            style={{
              ...styles.typeBtn,
              backgroundColor: selectedType === type ? '#064e3b' : '#f3f4f6',
              color: selectedType === type ? '#fff' : '#555',
              fontWeight: selectedType === type ? '600' : '500',
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {(searchTerm || selectedType !== 'all') && (
  <button
    style={styles.clearBtn}
    onClick={() => {
      setSearchTerm('')
      setSelectedType('all')
      onFilterChange({ search: '', type: 'all' })
    }}
    onMouseEnter={e => {
      e.target.style.borderColor = '#064e3b'
      e.target.style.color = '#064e3b'
    }}
    onMouseLeave={e => {
      e.target.style.borderColor = '#ddd'
      e.target.style.color = '#666'
    }}
  >
    ✕ Clear filters
  </button>
)}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
  },
  searchInput: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    width: '100%',
  },
  typeFilter: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
typeBtn: {
  padding: '8px 14px',
  borderRadius: '6px',
  border: 'none',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minHeight: 'auto',
},
clearBtn: {
  alignSelf: 'flex-start',
  padding: '7px 14px',
  borderRadius: '8px',
  border: '1.5px solid #ddd',
  backgroundColor: '#fff',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  color: '#666',
  transition: 'all 0.2s ease',
},
}