/**
 * pages/CategoriesPage.jsx
 * Full CRUD page for managing expense categories.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import CategoryForm from '../components/CategoryForm';
import { categoryService } from '../services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleEdit = (cat) => { setEditTarget(cat); setShowForm(true); };
  const handleDelete = (cat) => setDeleteTarget(cat);
  const handleFormClose = () => { setShowForm(false); setEditTarget(null); };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await categoryService.delete(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const BUDGET_NAMES = ['cash', 'gpay', 'card'];
  const isBudgetCat = (c) => c && (c.is_budget || BUDGET_NAMES.includes((c.name || '').trim().toLowerCase()));
  const normalCategories = categories.filter(c => !isBudgetCat(c));

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Categories</h1>
          <p className="page-subtitle">
            {normalCategories.length} normal categor{normalCategories.length !== 1 ? 'ies' : 'y'} for expenses
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }} id="add-category-btn">
          ➕ New Category
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading categories…
        </div>
      ) : normalCategories.length === 0 ? (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '48px' }}>
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <div className="empty-state-text">No expense categories yet.<br />Create categories like Food & Dining, Transportation, Shopping, etc.!</div>
          </div>
        </motion.div>
      ) : (
        <div className="grid-3" style={{ gap: '16px' }}>
          <AnimatePresence>
            {normalCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
              >
                {/* Glow */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
                  borderRadius: '50%', background: `radial-gradient(circle, ${cat.color}20 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px', fontSize: '1.6rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${cat.color}20`, border: `1px solid ${cat.color}40`,
                    flexShrink: 0,
                  }}>
                    {cat.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: cat.color, wordBreak: 'break-word' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(cat.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleEdit(cat)}
                    id={`edit-category-${cat.id}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleDelete(cat)}
                    id={`delete-category-${cat.id}`}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CategoryForm open={showForm} category={editTarget} onClose={handleFormClose} onSaved={fetchCategories} />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal-box" style={{ maxWidth: '400px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">🗑️ Delete Category</span>
                <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Delete <strong style={{ color: deleteTarget.color }}>{deleteTarget.icon} {deleteTarget.name}</strong>? This will not delete associated expenses.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting} id="confirm-delete-category-btn">
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
