import { useState, useEffect } from 'react'

export default function FilterBar({ onFilterChange, opportunities }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const types = ['all', 'scholarship', 'competition', 'internship', 'program', 'grant']
  const provinces = ['all', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK']

  const isFiltered = searchTerm || selectedType !== 'all' || selectedProvince !== 'all' || minAmount

  // Count results in real time
  const matchCount = opportunities?.filter(op => {
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch = !term || [
      op.title,
      op.org_name,
      op.description,
      op.eligibility_notes,
      ...(Array.isArray(op.interest_tags) ? op.interest_tags : []),
      op.type,
    ].some(field => field?.toLowerCase().includes(term))

    const matchesType = selectedType === 'all' || op.type === selectedType

    const matchesProvince = selectedProvince === 'all' || (() => {
      const scope = op.province_scope || []
      return scope.includes('ALL') || scope.includes(selectedProvince)
    })()

    const matchesAmount = !minAmount || (op.amount && op.amount >= parseInt(minAmount))

    return matchesSearch && matchesType && matchesProvince && matchesAmount
  }).length ?? 0

  useEffect(() => {
    onFilterChange({
      search: searchTerm,
      type: selectedType,
      province: selectedProvince,
      minAmount: minAmount ? parseInt(minAmount) : null,
    })
  }, [searchTerm, selectedType, selectedProvince, minAmount])

  function clearAll() {
    setSearchTerm('')
    setSelectedType('all')
    setSelectedProvince('all')
    setMinAmount('')
  }

  return (
    <div style={{ marginBottom: '24px', backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by title, org, tags, eligibility..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '14px', padding: '2px 6px' }}>✕</button>
        )}
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' }}>Type</span>
        {types.map(type => (
          <button key={type} onClick={() => setSelectedType(type)} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid', borderColor: selectedType === type ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: selectedType === type ? 'rgba(245,158,11,0.1)' : 'transparent', color: selectedType === type ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{ background: 'none', border: 'none', color: '#484f58', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
      >
        {showAdvanced ? '▾' : '▸'} Advanced filters
      </button>

      {/* Advanced filters */}
      {showAdvanced && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
          {/* Province */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px' }}>Province</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {provinces.map(p => (
                <button key={p} onClick={() => setSelectedProvince(p)} style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid', borderColor: selectedProvince === p ? '#818cf8' : 'rgba(255,255,255,0.08)', backgroundColor: selectedProvince === p ? 'rgba(129,140,248,0.1)' : 'transparent', color: selectedProvince === p ? '#818cf8' : '#7d8590', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                  {p === 'all' ? 'All' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Min amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px' }}>Min prize ($)</span>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={minAmount}
              onChange={e => setMinAmount(e.target.value)}
              style={{ width: '120px', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '12px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        </div>
      )}

      {/* Bottom row — result count + clear */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#484f58', fontWeight: '500' }}>
          {isFiltered ? (
            <span><span style={{ color: '#f59e0b', fontWeight: '700' }}>{matchCount}</span> result{matchCount !== 1 ? 's' : ''}</span>
          ) : (
            <span>{opportunities?.length || 0} opportunities</span>
          )}
        </span>
        {isFiltered && (
          <button onClick={clearAll} style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            ✕ Clear all
          </button>
        )}
      </div>
    </div>
  )
}