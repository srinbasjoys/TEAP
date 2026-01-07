import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const KeywordTracker = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    page: '',
    ranking: '',
    search_volume: '',
    difficulty: ''
  });
  const navigate = useNavigate();

  const pages = ['home', 'about', 'services', 'contact', 'blog'];
  const difficulties = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      const response = await axios.get(`${API}/keywords`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeywords(response.data);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!formData.keyword || !formData.page) {
      toast.error('Please fill in keyword and page');
      return;
    }

    const token = localStorage.getItem('techresona_admin_token');
    const payload = {
      keyword: formData.keyword,
      page: formData.page,
      ranking: formData.ranking ? parseInt(formData.ranking) : null,
      search_volume: formData.search_volume ? parseInt(formData.search_volume) : null,
      difficulty: formData.difficulty || null
    };

    try {
      await axios.post(`${API}/keywords`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Keyword added successfully');
      setIsDialogOpen(false);
      setFormData({
        keyword: '',
        page: '',
        ranking: '',
        search_volume: '',
        difficulty: ''
      });
      fetchKeywords();
    } catch (error) {
      toast.error('Failed to add keyword');
      console.error(error);
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    if (!window.confirm('Are you sure you want to delete this keyword?')) return;
    
    const token = localStorage.getItem('techresona_admin_token');
    try {
      await axios.delete(`${API}/keywords/${keywordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Keyword deleted successfully');
      fetchKeywords();
    } catch (error) {
      toast.error('Failed to delete keyword');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="keyword-tracker-loading">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          <p className="mt-4 text-slate-600">Loading keywords...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100" data-testid="keyword-tracker">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 font-heading" data-testid="keyword-tracker-title">Keyword Tracker</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-keyword-button">
                <Plus size={18} className="mr-2" />
                Track Keyword
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Track New Keyword</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="keyword">Keyword *</Label>
                  <Input
                    id="keyword"
                    value={formData.keyword}
                    onChange={(e) => setFormData({...formData, keyword: e.target.value})}
                    placeholder="cloud solutions india"
                    data-testid="keyword-input"
                  />
                </div>

                <div>
                  <Label htmlFor="page">Page *</Label>
                  <Select value={formData.page} onValueChange={(value) => setFormData({...formData, page: value})}>
                    <SelectTrigger data-testid="page-select">
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map(page => (
                        <SelectItem key={page} value={page}>{page}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ranking">Current Ranking</Label>
                    <Input
                      id="ranking"
                      type="number"
                      value={formData.ranking}
                      onChange={(e) => setFormData({...formData, ranking: e.target.value})}
                      placeholder="10"
                      data-testid="ranking-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="search_volume">Search Volume</Label>
                    <Input
                      id="search_volume"
                      type="number"
                      value={formData.search_volume}
                      onChange={(e) => setFormData({...formData, search_volume: e.target.value})}
                      placeholder="1000"
                      data-testid="search-volume-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                    <SelectTrigger data-testid="difficulty-select">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddKeyword} className="w-full" data-testid="save-keyword-button">
                  Track Keyword
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {keywords.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl" data-testid="no-keywords">
            <p className="text-slate-500">No keywords tracked yet. Start tracking your keywords!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="keywords-table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Keyword</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ranking</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Search Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {keywords.map((kw) => (
                    <tr key={kw.id} className="hover:bg-slate-50" data-testid={`keyword-row-${kw.id}`}>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{kw.keyword}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{kw.page}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{kw.ranking || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{kw.search_volume ? kw.search_volume.toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {kw.difficulty ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            kw.difficulty === 'Low' ? 'bg-green-100 text-green-700' :
                            kw.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {kw.difficulty}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteKeyword(kw.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-keyword-${kw.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
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

export default KeywordTracker;