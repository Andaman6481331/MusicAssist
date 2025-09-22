import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGenerationRecords, setFavorite, deleteByIds, type GenerationRecord } from './data/generations';
import { subscribeAuth } from './auth';

const Storage: React.FC = () => {
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

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
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const toggleSelectAll = (checked: boolean) => {
    const map: Record<string, boolean> = {};
    records.forEach((r) => { map[r.id] = checked; });
    setSelected(map);
  };

  const toggleFavorite = async (rec: GenerationRecord) => {
    if (!userId) return;
    const next = !rec.favorite;
    setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, favorite: next } : r));
    try {
      await setFavorite(userId, rec.id, next);
    } catch (e) {
      // revert on error
      setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, favorite: rec.favorite } : r));
    }
  };

  const bulkDelete = async () => {
    if (!userId || selectedIds.length === 0) return;
    const keep = records.filter((r) => !selectedIds.includes(r.id));
    setRecords(keep);
    setSelected({});
    try {
      await deleteByIds(userId, selectedIds);
    } catch (e) {
      // reload on error
      const fresh = await listGenerationRecords(userId);
      setRecords(fresh);
    }
  };

  const allCount = records.length;
  const checkedCount = selectedIds.length;
  const isAllChecked = allCount > 0 && checkedCount === allCount;
  const isIndeterminate = checkedCount > 0 && checkedCount < allCount;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="page-container2" style={{ flexDirection: 'column' }}>
      <div className="container" style={{padding: '1rem 2rem', maxWidth: 1000, width: '100%', alignSelf: 'center'}}>
        <div className="toolbar">
          <div className="toolbar-left">
            <h1 className="card-title" style={{ margin: 0 }}>My Generations</h1>
          </div>
          <div className="toolbar-right">
            <label className="checkbox">
              <input
                ref={masterCheckboxRef}
                type="checkbox"
                checked={isAllChecked}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              <span>Select all</span>
            </label>
            <button className="btn danger" disabled={selectedIds.length === 0} onClick={bulkDelete}>
              <img src="/icon/trash.svg" alt="delete" />
              Delete
            </button>
          </div>
        </div>

        <div className="list">
          {loading && <div className="list-empty">Loading...</div>}
          {!loading && records.length === 0 && (
            <div className="list-empty">No items yet. Generate something from the Generate tab.</div>
          )}
          {records.map((rec) => (
            <div className="list-row" key={rec.id}>
              <div className="cell checkbox">
                <input
                  type="checkbox"
                  checked={!!selected[rec.id]}
                  onChange={(e) => setSelected((m) => ({ ...m, [rec.id]: e.target.checked }))}
                />
              </div>
              <button className="icon-btn" onClick={() => toggleFavorite(rec)} title={rec.favorite ? 'Unfavorite' : 'Favorite'} aria-label={rec.favorite ? 'Unfavorite' : 'Favorite'}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                  <path
                    d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                    fill={rec.favorite ? '#ffd266' : 'transparent'}
                    stroke="#ffd266"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <div className="cell grow">
                <Link to={`/output/${encodeURIComponent(rec.filename)}`} className="item-title">{rec.filename}</Link>
                <div className="item-sub">{rec.difficulty || 'Beginner'}, {rec.genre || 'Pop'}, {rec.key || 'C'}</div>
              </div>
              <div className="cell meta">{rec.durationSec || 0}s</div>
              <div className="cell meta">{rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Storage;