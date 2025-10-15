import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourcesAPI } from '../services/api';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAll();
      setResources(response.data);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId, resourceName) => {
    if (!window.confirm(`Are you sure you want to delete "${resourceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(resourceId);
      await resourcesAPI.delete(resourceId);
      setResources(resources.filter(r => r._id !== resourceId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setDeletingId(null);
    }
  };

  const getResourceIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('printer') || lowerName.includes('3d')) return '🖨️';
    if (lowerName.includes('microscope')) return '🔬';
    if (lowerName.includes('laser')) return '⚡';
    if (lowerName.includes('centrifuge')) return '🌀';
    if (lowerName.includes('incubator')) return '🧫';
    if (lowerName.includes('computer')) return '💻';
    if (lowerName.includes('scanner')) return '📊';
    return '🔧';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center shadow-xl shadow-accent-500/30">
                <span className="text-3xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">Admin Panel</h1>
                <p className="text-gray-400 text-lg">Manage laboratory resources</p>
              </div>
            </div>
            <Link to="/admin/resources/new" className="btn btn-primary btn-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Resource
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6 animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold gradient-text">{resources.length}</div>
                <div className="text-sm text-gray-400 mt-1">Total Resources</div>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">
                  {resources.reduce((sum, r) => sum + r.capacity, 0)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Total Capacity</div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-accent-400">
                  {resources.length > 0 ? (resources.reduce((sum, r) => sum + r.capacity, 0) / resources.length).toFixed(1) : 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">Avg. Capacity</div>
              </div>
              <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Table/Grid */}
        {resources.length === 0 ? (
          <div className="card p-12 text-center animate-slide-up">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Resources Yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first lab resource to get started
            </p>
            <Link to="/admin/resources/new" className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Resource
            </Link>
          </div>
        ) : (
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Description</th>
                    <th className="text-center">Capacity</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource, index) => (
                    <tr
                      key={resource._id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center text-xl border border-primary-500/30">
                            {getResourceIcon(resource.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{resource.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-400 max-w-md">
                          {resource.description || 'No description'}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-info">
                          {resource.capacity} {resource.capacity === 1 ? 'slot' : 'slots'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/resources/${resource._id}/schedule`}
                            className="btn btn-ghost btn-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          <Link
                            to={`/admin/resources/${resource._id}/edit`}
                            className="btn btn-secondary btn-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(resource._id, resource.name)}
                            disabled={deletingId === resource._id}
                            className="btn btn-danger btn-sm"
                          >
                            {deletingId === resource._id ? (
                              <>
                                <span className="spinner spinner-sm"></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResources;
