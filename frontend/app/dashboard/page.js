'use client';

import { useEffect, useState } from 'react';
import CandidateCard from '../../components/CandidateCard';
import { Download, Search, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/upload/candidates');
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all resumes? This cannot be undone.')) return;
    try {
      const res = await fetch('http://localhost:5000/api/upload/candidates', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Failed to delete all:', error);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/upload/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCandidates(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete candidate:', error);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    if (candidates.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Name,Score,Matching Skills,Missing Skills\n";
    
    candidates.forEach((c, index) => {
      const row = [
        index + 1,
        `"${c.name}"`,
        c.match_score,
        `"${(c.matching_skills || []).join(', ')}"`,
        `"${(c.missing_skills || []).join(', ')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidate_rankings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.matching_skills && c.matching_skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Results Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Top candidates ranked by AI analysis</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name or skill..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.6rem 1rem 0.6rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                width: '250px'
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={18} style={{ marginRight: '0.5rem' }} />
            Export CSV
          </button>
          <button 
            className="btn" 
            style={{ backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} 
            onClick={handleDeleteAll}
            disabled={candidates.length === 0}
          >
            <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
            Delete All
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="spinner"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>No candidates found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Upload resumes and a Job Description to see ranked candidates.</p>
          <a href="/" className="btn btn-primary">Go to Upload</a>
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredCandidates.map((candidate, index) => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate} 
              rank={index + 1}
              onDelete={() => handleDeleteSingle(candidate.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
