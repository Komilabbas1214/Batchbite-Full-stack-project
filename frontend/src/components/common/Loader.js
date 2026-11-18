import React from 'react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="text-center p-4">
      <div className="spinner-border text-danger" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-muted fw-semibold">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
