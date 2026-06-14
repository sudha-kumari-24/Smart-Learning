import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import CertificatePDF from './CertificatePDF';  // Add this import
import './CourseDetail.css';


function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [progress, setProgress] = useState(0);

  const getUserId = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('sl_auth'));
      return auth?.user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    async function loadData() {
      try {

        const userId = getUserId();
        console.log("USER ID:", userId);
        console.log("COURSE ID:", id);

      
        const res = await fetch(`http://localhost:5000/api/courses/${id}`);

        if (!res.ok) {
          console.error("Course fetch failed");
          setCourse({ videos: [] }); // prevent infinite loading
          return;
        }

        const data = await res.json();
        console.log("COURSE:", data);
        setCourse(data);

       
        if (userId) {
          const res2 = await fetch('http://localhost:5000/api/courses/check-enrollment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId: id })
          });

          if (res2.ok) {
            const data2 = await res2.json();
            setIsEnrolled(data2.enrolled);
            setProgress(data2.progress || 0);
          }
        }

      } catch (err) {
        console.error("LOAD ERROR:", err);

       
        setCourse({ videos: [] });
      }
    }

    loadData();
  }, [id]);

  if (!course) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading course...</p>
    </div>
  );

  if (!course || !course.videos) {

    console.log("COURSE:", course);
    console.log("VIDEOS:", course?.videos);


    return (
      <div className="empty-state">
        <p>No videos available</p>
      </div>
    );
  }

  const currentVideo = course.videos[currentVideoIndex];

  const handleEnroll = () => {
    setIsEnrolled(true);
    
  };


  const downloadCertificate = async () => {
    const auth = JSON.parse(localStorage.getItem('sl_auth'));
    const userId = auth?.user?.id;

    const res = await fetch('http://localhost:5000/api/certificate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, courseId: id })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate.pdf';
    a.click();


  };



const handleCertificate = async () => {
  try {
    console.log("1. Starting certificate generation...");
    
    const auth = JSON.parse(localStorage.getItem('sl_auth'));
    const userId = auth?.user?.id;
    
    console.log("2. User ID:", userId);
    console.log("3. Course ID:", id);

    
    console.log("4. Fetching certificate data from backend...");
    const res = await fetch('http://localhost:5000/api/certificate/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId: id })
    });

    console.log("5. Response status:", res.status);

    if (!res.ok) {
      const error = await res.json();
      console.error("6. Backend error:", error);
      alert(error.message || "Failed to get certificate data");
      return;
    }

    const data = await res.json();
    console.log("7. Certificate data received:", data);

    
    if (!data.userName || !data.courseName || !data.certificateId) {
      console.error("8. Missing data:", data);
      alert("Incomplete certificate data");
      return;
    }

    
    console.log("9. Generating PDF...");
    const pdfBlob = await pdf(
      <CertificatePDF 
        userName={data.userName}
        courseName={data.courseName}
        certificateId={data.certificateId}
        issueDate={data.issueDate}
        qrCode={data.qrCode}
      />
    ).toBlob();

    console.log("10. PDF generated, size:", pdfBlob.size);

    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${data.certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("11. Download started successfully");
    
  } catch (err) {
    console.error("Certificate error:", err);
    alert(`Failed to generate certificate: ${err.message}`);
  }
};



  return (
    <div className="course-detail">
      <div className="course-layout">
       
        <div className="video-primary">
          <div className="video-player-wrapper">
            <iframe
              className="video-player"
              src={currentVideo.embedUrl}
              title={currentVideo.title}
              allowFullScreen
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          <button
            onClick={async () => {
              const auth = JSON.parse(localStorage.getItem('sl_auth'));

              const res = await fetch('http://localhost:5000/api/courses/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: auth.user.id,
                  courseId: id,
                  videoIndex: currentVideoIndex
                })
              });

              const data = await res.json();

              setProgress(data.progressPercent); 
            }}
          >
            ✅ Mark as Watched
          </button>

          <div className="video-info">
            <h2 className="video-title">{currentVideo.title}</h2>
            <div className="video-meta">
              <span className="video-counter">
                Video {currentVideoIndex + 1} of {course.videos.length}
              </span>
              {!isEnrolled && (
                <button className="enroll-btn-small" onClick={handleEnroll}>
                  Enroll to track progress
                </button>
              )}
            </div>
          </div>

          
          <details className="course-description">
            <summary>About this course</summary>
            <p>{course.description || "No description available."}</p>
          </details>
        </div>

       
        <div className="playlist-sidebar">
          <div className="playlist-header">
            <h3>Course Content</h3>
            <span className="playlist-count">{course.videos.length} videos</span>
          </div>

          <div className="playlist-videos">
            {course.videos.map((video, i) => (
              <div
                key={i}
                className={`playlist-item ${i === currentVideoIndex ? 'active' : ''}`}
                onClick={() => setCurrentVideoIndex(i)}
              >
                <div className="playlist-thumbnail">
                  {i === currentVideoIndex ? (
                    <span className="playing-indicator">▶</span>
                  ) : (
                    <span className="video-index">{String(i + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <div className="playlist-info">
                  <div className="playlist-title">{video.title}</div>
                  <div className="playlist-duration">
                    {video.duration || '--:--'}
                  </div>
                </div>
                {i === currentVideoIndex && (
                  <div className="now-playing-badge">Now Playing</div>
                )}
              </div>
            ))}
          </div>

          
          <div className="playlist-nav-mobile">
            <button
              className="nav-btn prev"
              disabled={currentVideoIndex === 0}
              onClick={() => setCurrentVideoIndex(prev => prev - 1)}
            >
              ← Previous
            </button>
            <button
              className="nav-btn next"
              disabled={currentVideoIndex === course.videos.length - 1}
              onClick={() => setCurrentVideoIndex(prev => prev + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

     
      {isEnrolled && progress === 100 && (
        <div className="certificate-section">
          <button className="cert-btn" onClick={handleCertificate}>
            🎓 Download Certificate
          </button>
        </div>
      )}

    </div>
  );
}

export default CourseDetail;