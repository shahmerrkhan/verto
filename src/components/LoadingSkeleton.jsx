export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '40px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '40%', height: '20px', borderRadius: '6px', background: 'linear-gradient(90deg, #1c2330 25%, #222d3d 50%, #1c2330 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ width: '100%', height: '14px', borderRadius: '6px', background: 'linear-gradient(90deg, #1c2330 25%, #222d3d 50%, #1c2330 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ width: '70%', height: '14px', borderRadius: '6px', background: 'linear-gradient(90deg, #1c2330 25%, #222d3d 50%, #1c2330 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ width: '100%', height: '36px', borderRadius: '8px', background: 'linear-gradient(90deg, #1c2330 25%, #222d3d 50%, #1c2330 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginTop: '8px' }} />
        </div>
      ))}
    </div>
  )
}