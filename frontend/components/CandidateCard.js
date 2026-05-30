'use client';

import { Check, X, Trash2 } from 'lucide-react';

export default function CandidateCard({ candidate, rank, onDelete }) {
  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="card candidate-card">
      <div className="candidate-header">
        <div>
          <h3 className="candidate-name">{candidate.name}</h3>
          <span className="candidate-rank">Rank #{rank}</span>
        </div>
        <div className={`score-badge ${getScoreClass(candidate.match_score)}`}>
          {candidate.match_score}
        </div>
      </div>
      
      <div className="skills-container">
        {candidate.matching_skills && candidate.matching_skills.length > 0 && (
          <div className="skill-section">
            <h4>Matching Skills</h4>
            <div className="skill-tags">
              {candidate.matching_skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="tag tag-match">
                  <Check size={12} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
                  {skill}
                </span>
              ))}
              {candidate.matching_skills.length > 5 && (
                <span className="tag" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                  +{candidate.matching_skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {candidate.missing_skills && candidate.missing_skills.length > 0 && (
          <div className="skill-section">
            <h4>Missing Skills</h4>
            <div className="skill-tags">
              {candidate.missing_skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="tag tag-missing">
                  <X size={12} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
                  {skill}
                </span>
              ))}
              {candidate.missing_skills.length > 5 && (
                <span className="tag" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                  +{candidate.missing_skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a 
          href={`${process.env.NEXT_PUBLIC_API_URL}/${candidate.resume_path}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
        >
          View Full Resume →
        </a>
        <button 
          onClick={onDelete}
          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Delete Candidate"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
