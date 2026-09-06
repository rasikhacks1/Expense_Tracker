/**
 * components/CategoryForm.jsx
 * Modal form for creating and editing categories.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { categoryService } from '../services/categoryService';

const ICONS = ['🍕','🚗','🏠','✈️','🎬','💊','📚','💪','🛍️','💡','☕','🎮','🐾','🌿','💰','🎵'];
const COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#06d6a0','#7c3aed',
];
const EMPTY = { name: '', icon: '💰', color: '#7c3aed' };

export default function CategoryForm({ open, category, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!category;

  useEffect(() => {
    if (open) {
      setForm(category ? { name: category.name, icon: category.icon, color: category.color } : EMPTY);
      setErrors({});
    }
  }, [open, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    const trimmed = form.name.trim();
    if (!trimmed) {
      errs.name = 'Name is required';
    } else if (['cash', 'gpay', 'card'].includes(trimmed.toLowerCase())) {
      errs.name = 'Cash, GPay, and Card are reserved for budget tracking';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await categoryService.update(category.id, { ...form, is_budget: false });
        toast.success('Category updated!');
      } else {
        await categoryService.create({ ...form, is_budget: false });
        toast.success('Category created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{isEdit ? '✏️ Edit Category' : '🏷️ New Category'}</span>
              <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-category-modal">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Preview */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '20px', fontSize: '2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${form.color}20`, border: `2px solid ${form.color}60`,
                  }}>
                    {form.icon}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input id="category-name" name="name" className="form-input" placeholder="e.g. Food & Dining" value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ICONS.map(icon => (
                      <button key={icon} type="button"
                        onClick={() => setForm(f => ({ ...f, icon }))}
                        style={{
                          width: '38px', height: '38px', borderRadius: '8px', fontSize: '1.2rem',
                          cursor: 'pointer', border: form.icon === icon ? `2px solid ${form.color}` : '1px solid rgba(255,255,255,0.1)',
                          background: form.icon === icon ? `${form.color}20` : 'rgba(255,255,255,0.04)',
                          transition: 'all 0.15s',
                        }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {COLORS.map(color => (
                      <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: color,
                          cursor: 'pointer', border: form.color === color ? '3px solid white' : '2px solid transparent',
                          boxShadow: form.color === color ? `0 0 12px ${color}` : 'none',
                          transition: 'all 0.15s',
                        }} />
                    ))}
                    <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none' }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="submit-category-btn">
                  {saving ? '⏳ Saving…' : isEdit ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
