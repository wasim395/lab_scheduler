import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resourcesAPI } from '../services/api';

const CreateResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingResource, setFetchingResource] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchResource();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const fetchResource = async () => {
    try {
      setFetchingResource(true);
      const response = await resourcesAPI.getById(id);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        capacity: response.data.capacity.toString()
      });
    } catch (err) {
      setError('Failed to load resource details');
      console.error('Error fetching resource:', err);
    } finally {
      setFetchingResource(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Resource name is required');
      return;
    }

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 50) {
      setError('Capacity must be a number between 1 and 50');
      return;
    }

    setLoading(true);

    try {
      const resourceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        capacity: capacity
      };

      if (isEditing) {
        await resourcesAPI.update(id, resourceData);
      } else {
        await resourcesAPI.create(resourceData);
      }

      navigate('/admin/resources');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} resource`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingResource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading resource...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container-custom max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Link
            to="/admin/resources"
            className="inline-flex items-center text-gray-400 hover:text-primary-400 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Panel
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/30">
              <span className="text-3xl">{isEditing ? '✏️' : '➕'}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                {isEditing ? 'Edit Resource' : 'Create New Resource'}
              </h1>
              <p className="text-gray-400 text-lg">
                {isEditing ? 'Update resource information' : 'Add a new laboratory resource'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          {error && (
            <div className="alert alert-error mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="name" className="label">
                Resource Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g., 3D Printer, Microscope, Laser Cutter"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">A descriptive name for the resource</p>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="label">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input pl-10 min-h-[120px] resize-y"
                  placeholder="Provide details about the resource, specifications, or usage guidelines..."
                  rows={4}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Optional description (max 500 characters)</p>
            </div>

            <div className="form-group">
              <label htmlFor="capacity" className="label">
                Capacity *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g., 5"
                  min="1"
                  max="50"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Number of simultaneous bookings allowed (1-50)
              </p>
            </div>

            {/* Example Card */}
            <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-primary-300 mb-1">Example</h4>
                  <p className="text-sm text-gray-400">
                    A microscope with capacity of 2 means 2 users can book the same time slot simultaneously. 
                    Additional users will be added to a waitlist.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEditing ? 'Update Resource' : 'Create Resource'}
                  </>
                )}
              </button>
              <Link
                to="/admin/resources"
                className="flex-1 btn btn-secondary btn-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateResource;
