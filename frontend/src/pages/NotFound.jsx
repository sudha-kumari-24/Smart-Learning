import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <section className="page notfound-page">
      <h2>Page not found</h2>
      <p>The page you are looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary-sm">Back to Home</Link>
    </section>
  );
}

export default NotFound;
