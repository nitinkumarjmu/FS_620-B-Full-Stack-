import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Plus, Loader } from 'lucide-react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data.sort((a,b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('Failed to load todos', err);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    const payload = { text: newTodo.trim() };
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await res.json();
      setTodos([created, ...todos]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo. Please try again.');
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t._id === id || t.id === id);
    if (!todo) return;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      const updated = await res.json();
      setTodos(todos.map(t => (t._id === id || t.id === id) ? updated : t));
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo._id || todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    if (editText.trim() === '') {
      cancelEdit();
      return;
    }
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() })
      });
      const updated = await res.json();
      setTodos(todos.map(t => (t._id === id || t.id === id) ? updated : t));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => !(t._id === id || t.id === id)));
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo Application</h1>
          <p className="text-gray-600">Manage your tasks with full CRUD operations</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button onClick={addTodo} className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'active', 'completed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 px-4 rounded-md font-medium ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">
                {filter === 'all' ? 'No todos yet. Add one above to get started!' : `No ${filter} todos.`}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div key={todo._id || todo.id} className="bg-white rounded-lg shadow-md p-4">
                {editingId === (todo._id || todo.id) ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo._id || todo.id)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(todo._id || todo.id)} className="bg-green-600 text-white p-2 rounded">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={cancelEdit} className="bg-gray-500 text-white p-2 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo._id || todo.id)} />
                    <span className={`flex-1 text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {todo.text}
                    </span>
                    <button onClick={() => startEditing(todo)} title="Edit"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => deleteTodo(todo._id || todo.id)} title="Delete"><Trash2 className="w-5 h-5" /></button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Data persists via the backend API connected to MongoDB</p>
        </div>
      </div>
    </div>
  );
}
