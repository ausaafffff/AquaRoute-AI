// client/src/components/MapHUD.jsx
import React, { useState } from 'react';

export default function MapHUD({ showHazards = true, activeHazardCount = 18 }) {
  const [collapsed, setCollapsed] = useState(false);

  // Minimized Mobile Pill
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '20px',
          padding: '6px 12px',
          color: '#38bdf8',
          fontSize: '11px',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'auto'
        }}
      >
        <span>🗺️</span>
        <span>HUD Legend</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '12px 14px',
        color: '#f8fafc',
        fontFamily: "'Inter', -apple-system, sans-serif",
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        maxWidth: '240px',
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Title + Collapse Button */}
      <div
        style={{
          fontSize: '10.5px',
          fontWeight: 800,
          letterSpacing: '0.6px',
          color: '#38bdf8',
          textTransform: 'uppercase',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '5px'
        }}
      >
        <span>WATERLOGGING HUD</span>
        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '0 2px'
          }}
          title="Minimize HUD"
        >
          ✕
        </button>
      </div>

      {/* Legend Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
        {/* Safe Detour */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '3.5px',
              backgroundColor: '#10b981',
              borderRadius: '2px',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>Safe Detour</span>
        </div>

        {/* Flooded Direct Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '0',
              borderTop: '2.5px dashed #ef4444'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>Direct (Flooded)</span>
        </div>

        {/* Severe Flood Zone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>Severe Zone (&lt; 118m)</span>
        </div>

        {/* Moderate Risk Zone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              border: '2px solid rgba(245, 158, 11, 0.4)'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>Moderate Zone</span>
        </div>
      </div>

      {/* Tip footer */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '9.5px',
          color: '#94a3b8'
        }}
      >
        💡 Tap map to set custom pin
      </div>
    </div>
  );
}