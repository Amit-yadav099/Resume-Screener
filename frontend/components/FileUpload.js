'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, FileText, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FileUpload() {
  const [resumes, setResumes] = useState([]);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdMode, setJdMode] = useState('text'); // 'text' or 'file'
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const router = useRouter();
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf' || 
      file.name.endsWith('.docx') || 
      file.name.endsWith('.doc')
    );
    setResumes(prev => [...prev, ...newFiles]);
  };

  const removeResume = (index) => {
    setResumes(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (resumes.length === 0) {
      alert("Please upload at least one resume.");
      return;
    }
    if (jdMode === 'text' && !jdText.trim()) {
      alert("Please enter a Job Description.");
      return;
    }
    if (jdMode === 'file' && !jdFile) {
      alert("Please upload a Job Description file.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    resumes.forEach(resume => {
      formData.append('resume', resume);
    });

    if (jdMode === 'text') {
      formData.append('jdText', jdText);
    } else if (jdFile) {
      formData.append('jd', jdFile);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to dashboard on success
        router.push('/dashboard');
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Error connecting to server. Is the backend running?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Resumes */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Upload Resumes</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Supported formats: PDF, DOCX (Max 10 files)
          </p>
          
          <div 
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="dropzone-icon" />
            <div>
              <p style={{ fontWeight: 500 }}>Drag & drop resumes here</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>or click to browse files</p>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              style={{ display: 'none' }}
              onChange={handleChange}
            />
          </div>

          {resumes.length > 0 && (
            <div className="file-list">
              {resumes.map((file, idx) => (
                <div key={idx} className="file-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                  </div>
                  <button className="file-remove" onClick={() => removeResume(idx)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Job Description */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-main)' }}>Job Description</h3>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--background)', padding: '0.25rem', borderRadius: '8px' }}>
              <button 
                onClick={() => setJdMode('text')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  background: jdMode === 'text' ? 'var(--surface-hover)' : 'transparent',
                  border: 'none', color: jdMode === 'text' ? 'var(--text-main)' : 'var(--text-muted)',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem'
                }}
              >Text</button>
              <button 
                onClick={() => setJdMode('file')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  background: jdMode === 'file' ? 'var(--surface-hover)' : 'transparent',
                  border: 'none', color: jdMode === 'file' ? 'var(--text-main)' : 'var(--text-muted)',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem'
                }}
              >File</button>
            </div>
          </div>

          {jdMode === 'text' ? (
            <div className="form-group">
              <textarea 
                className="form-textarea" 
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <div 
                className="dropzone"
                style={{ padding: '2rem 1rem' }}
                onClick={() => document.getElementById('jd-upload').click()}
              >
                <UploadCloud className="dropzone-icon" />
                <p style={{ fontSize: '0.875rem' }}>Click to upload JD (.pdf, .docx, .txt)</p>
                <input 
                  id="jd-upload"
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if(e.target.files && e.target.files[0]) {
                      setJdFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              {jdFile && (
                <div className="file-item" style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="var(--success)" />
                    <span style={{ fontSize: '0.875rem' }}>{jdFile.name}</span>
                  </div>
                  <button className="file-remove" onClick={() => setJdFile(null)}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          disabled={resumes.length === 0 || (jdMode === 'text' && !jdText) || (jdMode === 'file' && !jdFile) || isUploading}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          {isUploading ? 'Analyzing with AI...' : 'Analyze & Score Candidates'}
        </button>
      </div>

      {isUploading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <h2 style={{ color: 'white' }}>Processing Documents...</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Our AI is evaluating the candidates against the JD.</p>
        </div>
      )}
    </div>
  );
}
