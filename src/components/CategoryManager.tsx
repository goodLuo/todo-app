import { useState } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { Category, TodoItem } from '../types';

interface Props {
  categories: Category[];
  todos: TodoItem[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Category>) => void;
  onSelectCategory: (id: string | null) => void;
  selectedCategoryId: string | null;
}

const colorOptions = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#6366F1',
  '#14B8A6', '#F97316', '#84CC16', '#64748B',
];

export default function CategoryManager({
  categories, todos, onAdd, onDelete, onUpdate, onSelectCategory, selectedCategoryId
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim(), color);
      setName('');
      setColor(colorOptions[0]);
      setIsAdding(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
  };

  const handleSaveEdit = (id: string) => {
    if (name.trim()) {
      onUpdate(id, { name: name.trim(), color });
      setEditingId(null);
      setName('');
    }
  };

  const countTodos = (catId: string) => todos.filter(t => t.categoryId === catId).length;
  const countActive = (catId: string) => todos.filter(t => t.categoryId === catId && !t.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">分类管理</h2>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setName(''); setColor(colorOptions[0]); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} /> 新建
        </button>
      </div>

      {/* All filter */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`w-full text-left p-4 rounded-2xl transition-all border ${
          !selectedCategoryId
            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">全部</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{todos.length} 项</span>
        </div>
      </button>

      {/* Add form */}
      {isAdding && (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3 shadow-lg">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="分类名称..."
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
              确认
            </button>
            <button onClick={() => setIsAdding(false)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200">
              取消
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 space-y-3 shadow-lg">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit(cat.id)}
                />
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(cat.id)} className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium">
                    保存
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSelectCategory(selectedCategoryId === cat.id ? null : cat.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border group ${
                  selectedCategoryId === cat.id
                    ? 'border-blue-200 dark:border-blue-700 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200'
                }`}
                style={selectedCategoryId === cat.id ? { backgroundColor: `${cat.color}10` } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {countActive(cat.id)} 待办 / {countTodos(cat.id)} 总计
                    </span>
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); handleEdit(cat); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit3 size={14} className="text-gray-400" />
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={e => { e.stopPropagation(); onDelete(cat.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                    {/* Mobile edit/delete */}
                    <div className="sm:hidden flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); handleEdit(cat); }}
                        className="p-1.5 rounded-lg"
                      >
                        <Edit3 size={14} className="text-gray-400" />
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={e => { e.stopPropagation(); onDelete(cat.id); }}
                          className="p-1.5 rounded-lg"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
