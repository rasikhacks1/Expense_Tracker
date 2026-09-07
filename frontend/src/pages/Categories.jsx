import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCategories } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import CategoryForm from '../components/CategoryForm/CategoryForm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import './Categories.css';

const TABS = [
  { id: 'expense', label: '💸 Expense Categories' },
  { id: 'budget', label: '🎯 Budget Categories' },
];

export default function Categories() {
  const [activeTab, setActiveTab] = useState('expense');
  const { categories, loading, error, refetch } = useCategories(activeTab);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);       
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function readonlyMsg() {
    if (activeTab === 'budget') {
      return 'These categories drive the Budgets page. Create the categories you want to set budgets for.';
    }
    return 'Expense categories populate the category dropdown on the expense form. They are seeded with defaults — customize them freely.';
  }

 
  async function handleCreate(name) {
    setIsSaving(true);
    try {
      const created = await createCategory({ name, type: activeTab });
      toast.success(`Category "${created.name}" added.`);
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to add category.');
    } finally {
      setIsSaving(false);
    }
  }


  async function handleRename(name) {
    setIsSaving(true);
    try {
      const updated = await updateCategory(editing.id, { name });
      toast.success(`Renamed to "${updated.name}".`);
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update category.');
    } finally {
      setIsSaving(false);
    }
  }


  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  }

  const isEditingRow = (id) => editing && editing.id === id;

  return (
    <main className="categories-page page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Separate category sections for expenses and budgets</p>
        </div>
      </header>

      {/* Tabs: Expense | Budget */}
      <div className="cat-tabs" role="tablist" aria-label="Category sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`cat-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setShowForm(false);
              setEditing(null);
            }}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="cat-note">{readonlyMsg()}</p>

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="cat-loading">
          <div className="spinner" />
          <p>Loading categories…</p>
        </div>
      )}

      {error && !loading && (
        <div className="cat-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="cat-list-card">
          {categories.length === 0 && !showForm && (
            <div className="cat-empty">
              <span className="empty-icon">📂</span>
              <p>
                No {activeTab} categories yet. Add one below to get started.
              </p>
            </div>
          )}

          {/* Inline add form */}
          {showForm && (
            <div className="cat-add-row">
              <CategoryForm
                submitLabel={`Add ${activeTab} category`}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isSubmitting={isSaving}
              />
            </div>
          )}

          {/* Category list */}
          <ul className="cat-list">
            {categories.map((cat) => (
              <li key={cat.id} className={`cat-row ${isEditingRow(cat.id) ? 'editing' : ''}`}>
                {isEditingRow(cat.id) ? (
                  <CategoryForm
                    initialName={cat.name}
                    submitLabel="Rename"
                    onSubmit={handleRename}
                    onCancel={() => setEditing(null)}
                    isSubmitting={isSaving}
                  />
                ) : (
                  <>
                    <span className="cat-name" title={cat.name}>{cat.name}</span>
                    <span className="cat-type-badge">{cat.type}</span>
                    <div className="cat-actions">
                      <button
                        className="btn-icon"
                        onClick={() => setEditing(cat)}
                        aria-label={`Edit ${cat.name}`}
                        id={`edit-cat-${cat.id}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => setDeleteTarget(cat)}
                        aria-label={`Delete ${cat.name}`}
                        id={`delete-cat-${cat.id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Add button */}
          {!showForm && (
            <button
              className="btn-add-category"
              onClick={() => setShowForm(true)}
              id="add-category-btn"
            >
              ➕ Add {activeTab} category
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        message={`This will remove it from the ${activeTab} categories list. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isBusy={isDeleting}
      />
    </main>
  );
}