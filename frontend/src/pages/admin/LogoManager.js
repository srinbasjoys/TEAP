import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, History, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const LogoManager = () => {
  const navigate = useNavigate();
  const [currentLogo, setCurrentLogo] = useState(null);
  const [logoHistory, setLogoHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCurrentLogo();
    fetchLogoHistory();
  }, [navigate]);

  const fetchCurrentLogo = async () => {
    try {
      const response = await axios.get(`${API}/logo/current`);
      setCurrentLogo(response.data);
    } catch (error) {
      console.error('Error fetching current logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogoHistory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/logo/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogoHistory(response.data);
    } catch (error) {
      console.error('Error fetching logo history:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API}/logo/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Logo uploaded successfully! It may take a moment to update.');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchCurrentLogo();
      fetchLogoHistory();
      
      // Force reload after 1 second to show new logo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Logo Manager</h1>
          <p className="text-slate-600">Upload and manage your site logo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Logo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-900">Current Logo</h2>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 flex items-center justify-center">
              {currentLogo ? (
                <img 
                  src={`${currentLogo.path}?t=${Date.now()}`}
                  alt="Current Logo" 
                  className="max-h-32 w-auto"
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <ImageIcon size={48} className="mx-auto mb-2" />
                  <p>No logo uploaded yet</p>
                </div>
              )}
            </div>

            {currentLogo && (
              <div className="mt-4 text-sm text-slate-600">
                <p><strong>Filename:</strong> {currentLogo.filename || 'logo.png'}</p>
                {currentLogo.uploaded_at && (
                  <p><strong>Last Updated:</strong> {formatDate(currentLogo.uploaded_at)}</p>
                )}
                {currentLogo.uploaded_by && (
                  <p><strong>Uploaded By:</strong> {currentLogo.uploaded_by}</p>
                )}
              </div>
            )}
          </div>

          {/* Upload New Logo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="text-teal-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-900">Upload New Logo</h2>
            </div>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                onClick={() => document.getElementById('logoInput').click()}
              >
                <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-400">PNG, JPG, SVG up to 5MB</p>
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="border-2 border-indigo-500 rounded-xl p-8 bg-indigo-50 mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-32 w-auto mx-auto"
                  />
                </div>

                <div className="mb-4 text-sm text-slate-600">
                  <p><strong>Filename:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p><strong>Type:</strong> {selectedFile.type}</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        <span>Upload Logo</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={uploading}
                    className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Logo Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Use PNG for transparent backgrounds</li>
                    <li>Recommended size: 200x50 to 400x100 pixels</li>
                    <li>Keep file size under 5MB</li>
                    <li>Logo will appear in the navigation bar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo History */}
        {logoHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <History className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-900">Upload History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Filename</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Uploaded By</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logoHistory.map((logo, idx) => (
                    <tr key={logo.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{logo.filename}</td>
                      <td className="py-3 px-4 text-slate-600">{logo.uploaded_by}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(logo.uploaded_at)}</td>
                      <td className="py-3 px-4">
                        {idx === 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={14} className="mr-1" />
                            Current
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">Previous</span>
                        )}
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

export default LogoManager;
