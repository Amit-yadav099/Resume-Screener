import FileUpload from '../components/FileUpload';

export default function Home() {
  return (
    <div className="container">
      <h1 className="page-title">Find the <span className="text-gradient">Perfect Match</span></h1>
      <p className="page-subtitle">
        Automate your hiring process. Upload resumes and a job description to instantly score and rank candidates based on skills, experience, and overall fit.
      </p>
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <FileUpload />
      </div>
    </div>
  );
}
