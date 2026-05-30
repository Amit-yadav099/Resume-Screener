import './globals.css';

export const metadata = {
  title: 'AI Resume Screener',
  description: 'Automate resume screening and ranking using AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container nav-content">
            <h1 className="logo">Recruit<span className="text-gradient">AI</span></h1>
            <div className="nav-links">
              <a href="/">Upload</a>
              <a href="/dashboard">Dashboard</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
