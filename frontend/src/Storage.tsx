import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGenerationRecords, setFavorite, deleteByIds, type GenerationRecord } from './data/generations';
import { subscribeAuth } from './auth';

const ITEMS_PER_PAGE = 5;

const Storage: React.FC = () => {
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = subscribeAuth((user) => setUserId(user?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId) { setRecords([]); return; }
    setLoading(true);
    listGenerationRecords(userId)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [userId]);

  const masterCheckboxRef = useRef<HTMLInputElement | null>(null);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase();
    return records.filter((r) => 
      r.filename.toLowerCase().includes(query) ||
      (r.genre && r.genre.toLowerCase().includes(query)) ||
      (r.difficulty && r.difficulty.toLowerCase().includes(query))
    );
  }, [records, searchQuery]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  // Sort records: favorites first, then by creation date (newest first)
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  }, [filteredRecords]);

  const totalPages = Math.ceil(sortedRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedRecords, currentPage]);

  // Reset to first page if search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset to current page if it exceeds total pages after a deletion or search
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const toggleSelectAll = (checked: boolean) => {
    const map: Record<string, boolean> = {};
    sortedRecords.forEach((r) => { map[r.id] = checked; });
    setSelected(map);
  };

  const toggleFavorite = async (rec: GenerationRecord) => {
    if (!userId) return;
    const next = !rec.favorite;
    setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, favorite: next } : r));
    try {
      await setFavorite(userId, rec.id, next);
    } catch (e) {
      setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, favorite: rec.favorite } : r));
    }
  };

  const bulkDelete = async () => {
    if (!userId || selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
    const keep = records.filter((r) => !selectedIds.includes(r.id));
    setRecords(keep);
    setSelected({});
    try {
      await deleteByIds(userId, selectedIds);
    } catch (e) {
      const fresh = await listGenerationRecords(userId);
      setRecords(fresh);
    }
  };

  const allCount = sortedRecords.length;
  // Selected IDs that are actually in the current filtered/sorted list
  const visibleSelectedCount = sortedRecords.filter(r => selected[r.id]).length;
  
  const isAllChecked = allCount > 0 && visibleSelectedCount === allCount;
  const isIndeterminate = visibleSelectedCount > 0 && visibleSelectedCount < allCount;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="modern-container" style={{ padding: '4rem 2rem' }}>
      <style>{`
        .modern-checkbox-wrapper {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.2s ease;
        }
        .modern-checkbox-wrapper.checked {
          background: #3b82f6;
          border-color: #3b82f6;
        }
        .modern-checkbox-wrapper.indeterminate {
          border-color: #3b82f6;
        }
        .checkbox-visual {
          color: white;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-input:focus {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
      <div className="glass-card" style={{ maxWidth: '1200px', margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header & Toolbar */}
        <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
            marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <div>
            <h1 className="modern-title" style={{ textAlign: 'left', margin: 0 }}>Music Vault</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.4rem' }}>Your personal library of AI compositions</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search by name, genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  style={{ 
                    position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
              <label style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', 
                  color: visibleSelectedCount === allCount ? '#3b82f6' : '#94a3b8', 
                  fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none'
              }}>
                <div className={`modern-checkbox-wrapper ${isAllChecked ? 'checked' : isIndeterminate ? 'indeterminate' : ''}`}>
                  <input
                    ref={masterCheckboxRef}
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="modern-checkbox"
                    style={{ opacity: 0, position: 'absolute' }}
                  />
                  <div className="checkbox-visual">
                    {isAllChecked && <span>✓</span>}
                    {!isAllChecked && isIndeterminate && <span style={{ width: '8px', height: '2px', background: 'white' }}></span>}
                  </div>
                </div>
                {visibleSelectedCount > 0 ? `${visibleSelectedCount} Selected` : 'Select All'}
              </label>
              
              <button 
                  className="back-btn" 
                  disabled={selectedIds.length === 0} 
                  onClick={bulkDelete}
                  style={{ 
                      padding: '0.75rem 1.25rem', fontSize: '0.9rem', 
                      background: selectedIds.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: selectedIds.length > 0 ? '#ef4444' : '#64748b',
                      borderColor: selectedIds.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
              >
                <span>🗑</span> {selectedIds.length > 0 ? `Delete (${selectedIds.length})` : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
              <p style={{ color: '#94a3b8' }}>Retrieving your library...</p>
            </div>
          )}
          
          {!loading && sortedRecords.length === 0 && (
            <div style={{ textAlign: 'center', padding: '8rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>🎹</div>
              <h3 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: '1rem' }}>Vault is Empty</h3>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Generate your first masterpiece to see it here.</p>
              <Link to="/generate-prompt" className="start-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Create Project</Link>
            </div>
          )}

          {!loading && paginatedRecords.map((rec) => (
            <div 
              key={rec.id} 
              className="glass-card" 
              style={{ 
                padding: '1.25rem 2rem', background: 'rgba(255,255,255,0.03)', 
                border: selected[rec.id] ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: '2rem',
                transition: 'all 0.2s ease',
                flexDirection: 'row',
                boxShadow: selected[rec.id] ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : 'none',
                transform: selected[rec.id] ? 'scale(1.005)' : 'none'
              }}
            >
              <div className={`modern-checkbox-wrapper ${selected[rec.id] ? 'checked' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setSelected((m) => ({ ...m, [rec.id]: !selected[rec.id] }))}>
                <input
                  type="checkbox"
                  checked={!!selected[rec.id]}
                  onChange={() => {}} // Handled by div click for better hit area
                  className="modern-checkbox"
                  style={{ opacity: 0, position: 'absolute' }}
                />
                <div className="checkbox-visual">
                  {selected[rec.id] && <span>✓</span>}
                </div>
              </div>
              
              <button 
                onClick={() => toggleFavorite(rec)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                    fill={rec.favorite ? '#fbbf24' : 'transparent'}
                    stroke={rec.favorite ? '#fbbf24' : '#64748b'}
                    strokeWidth="1.5"
                  />
                </svg>
              </button>

              <div style={{ flex: 1 }}>
                <Link 
                    to={`/output/${encodeURIComponent(rec.filename)}`} 
                    style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none' }}
                >
                    {rec.filename}
                </Link>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <span className="topic-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{rec.genre || 'Piano'}</span>
                    <span className="topic-tag" style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)' }}>{rec.difficulty || 'All Levels'}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Length</div>
                    {rec.durationSec || 0}s
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Created</div>
                    {rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '—'}
                </div>
                <Link to={`/output/${encodeURIComponent(rec.filename)}`} className="back-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Open
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        {!loading && sortedRecords.length > 0 && (
          <div style={{ 
              marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', 
              alignItems: 'center' 
          }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, sortedRecords.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedRecords.length)} of {sortedRecords.length} items
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="back-btn" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem 1rem' }}
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '0.5rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: currentPage === page ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: currentPage === page ? '#3b82f6' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: currentPage === page ? '700' : '400',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                className="back-btn" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Storage;