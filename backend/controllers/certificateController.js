const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');
const CourseProgress = require('../models/CourseProgress'); // ✅ Changed from Progress

// ===============================
// GENERATE CERTIFICATE
// ===============================
exports.generateCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "Missing userId or courseId" });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    const progress = await CourseProgress.findOne({ user: userId, course: courseId }); // ✅ Changed
    if (!progress || progress.progressPercent < 100) {
      return res.status(400).json({ message: "Complete course to get certificate" });
    }

    const certificateId = "SL-" + Math.floor(Math.random() * 10000000);
    await Certificate.create({ user: userId, course: courseId, certificateId });

    const verificationUrl = `http://localhost:5000/api/certificate/verify/${certificateId}`;
    const qrImage = await QRCode.toDataURL(verificationUrl);

    // ===============================
    // CREATE PDF - NAVY & LIME DESIGN
    // ===============================
    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape',
      margin: 0
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificateId}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Certificate dimensions (centered)
    const certWidth = 750;
    const certHeight = 530;
    const startX = (pageWidth - certWidth) / 2;
    const startY = (pageHeight - certHeight) / 2;

    // === BACKGROUND ===
    doc.rect(0, 0, pageWidth, pageHeight).fill('#f0f2f5');

    // === WHITE CERTIFICATE BACKGROUND ===
    doc.rect(startX, startY, certWidth, certHeight).fill('#ffffff');

    // === DARK OUTER BORDER ===
    doc.lineWidth(12).strokeColor('#333333')
      .rect(startX, startY, certWidth, certHeight).stroke();

    // === GEOMETRIC SHAPES ===
    // Top-left lime green rotated square
    doc.save();
    doc.translate(startX - 30, startY - 30);
    doc.rotate(45);
    doc.rect(0, 0, 180, 180).fill('#9ccc65');
    doc.restore();

    // Bottom-right navy rotated square
    doc.save();
    doc.translate(startX + certWidth - 100, startY + certHeight - 100);
    doc.rotate(45);
    doc.rect(0, 0, 220, 220).fill('#1a237e');
    doc.restore();

    // === INNER BORDER ===
    doc.lineWidth(1.5).strokeColor('#eeeeee')
      .rect(startX + 25, startY + 25, certWidth - 50, certHeight - 50).stroke();

    // === HEADER ===
    const contentStartY = startY + 50;
    
    doc.fontSize(13).fillColor('#1a237e').font('Helvetica-Bold')
      .text('SMARTLEARNING', startX + certWidth/2, contentStartY + 5, { align: 'center' });
    
    doc.fontSize(8).fillColor('#999999')
      .text("India's Trusted Learning Platform", startX + certWidth/2, contentStartY + 22, { align: 'center' });

    // === MAIN TITLE ===
    doc.fontSize(38).fillColor('#1a237e').font('Helvetica-Bold')
      .text('CERTIFICATE', startX + certWidth/2, contentStartY + 60, { align: 'center' });
    
    // Lime green subheader
    const subheaderWidth = 160;
    const subheaderX = startX + certWidth/2 - subheaderWidth/2;
    const subheaderY = contentStartY + 100;
    doc.rect(subheaderX, subheaderY, subheaderWidth, 24).fill('#9ccc65');
    doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
      .text('OF COMPLETION', startX + certWidth/2, subheaderY + 7, { align: 'center' });

    // === RECIPIENT ===
    doc.fontSize(11).fillColor('#555555')
      .text('This certificate is proudly presented to', startX + certWidth/2, subheaderY + 55, { align: 'center' });

    // Student name
    doc.fontSize(42).fillColor('#1a237e').font('Times-Roman')
      .text(user.fullName, startX + certWidth/2, subheaderY + 105, { align: 'center' });

    // Decorative line under name
    const nameWidth = doc.widthOfString(user.fullName, { fontSize: 42 });
    doc.lineWidth(1.5).strokeColor('#1a237e')
      .moveTo(startX + certWidth/2 - nameWidth/2 - 15, subheaderY + 155)
      .lineTo(startX + certWidth/2 + nameWidth/2 + 15, subheaderY + 155)
      .stroke();

    // === COURSE ===
    doc.fontSize(11).fillColor('#333333')
      .text('for successfully completing the course', startX + certWidth/2, subheaderY + 185, { align: 'center' });
    
    doc.fontSize(16).fillColor('#1a237e').font('Helvetica-Bold')
      .text(course.title, startX + certWidth/2, subheaderY + 215, { align: 'center' });

    // === FOOTER ===
    const footerY = startY + certHeight - 90;

    // Left: Signature
    doc.lineWidth(1).strokeColor('#999999')
      .moveTo(startX + 60, footerY + 15)
      .lineTo(startX + 220, footerY + 15).stroke();
    
    doc.fontSize(10).fillColor('#1a237e').font('Helvetica-Bold')
      .text('Sudha Kumari', startX + 60, footerY - 5);
    doc.fontSize(8).fillColor('#666666')
      .text('Founder & CEO', startX + 60, footerY + 5);

    // Center: Certificate Details
    const centerX = startX + certWidth/2;
    doc.fontSize(8).fillColor('#666666')
      .text(`Certificate No: ${certificateId}`, centerX, footerY - 5, { align: 'center' });
    doc.fontSize(8)
      .text(`Issue Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, centerX, footerY + 8, { align: 'center' });

    // Right: QR Code
    const qrSize = 45;
    const qrX = startX + certWidth - 95;
    const qrY = footerY - 25;
    
    doc.image(qrImage, qrX, qrY, { width: qrSize });
    doc.fontSize(7).fillColor('#666666')
      .text('QR Code', qrX + qrSize/2 - 12, qrY + qrSize + 2);
    doc.fontSize(6).fillColor('#888888')
      .text('Scan to Verify', qrX + qrSize/2 - 15, qrY + qrSize + 12);

    // === TOP LEFT BADGE ===
    const badgeX = startX + 35;
    const badgeY = startY + 30;
    doc.circle(badgeX, badgeY, 18).fill('#9ccc65');
    doc.circle(badgeX, badgeY, 13).fill('#ffffff');
    doc.fontSize(13).fillColor('#1a237e').font('Helvetica-Bold')
      .text('✓', badgeX - 4, badgeY - 6);

    // === BOTTOM BANNER TEXT ===
    doc.fontSize(8).fillColor('#999999')
      .text('✨ SmartLearning — Empowering Education, Transforming Lives ✨', 
        startX + certWidth/2, startY + certHeight - 28, { align: 'center' });

    doc.end();

  } catch (err) {
    console.error("CERTIFICATE ERROR:", err);
    res.status(500).json({ message: "Certificate generation failed" });
  }
};

// ===============================
// VERIFY CERTIFICATE
// ===============================
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id }).populate('user course');
    if (!cert) return res.status(404).json({ valid: false });
    res.json({ 
      valid: true, 
      name: cert.user.fullName, 
      course: cert.course.title, 
      issuedAt: cert.createdAt 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false });
  }
};

// ===============================
// GET CERTIFICATE DATA (for react-pdf)
// ===============================
exports.getCertificateData = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    console.log("getCertificateData called:", { userId, courseId });

    if (!userId || !courseId) {
      return res.status(400).json({ message: "Missing userId or courseId" });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    const progress = await CourseProgress.findOne({ user: userId, course: courseId }); // ✅ Changed
    if (!progress || progress.progressPercent < 100) {
      return res.status(400).json({ message: "Complete course to get certificate" });
    }

    // Check if certificate already exists
    let existingCert = await Certificate.findOne({ user: userId, course: courseId });
    let certificateId;
    
    if (existingCert) {
      certificateId = existingCert.certificateId;
    } else {
      certificateId = "SL-" + Math.floor(Math.random() * 10000000);
      await Certificate.create({ user: userId, course: courseId, certificateId });
    }

    const verificationUrl = `http://localhost:5000/api/certificate/verify/${certificateId}`;
    const qrCode = await QRCode.toDataURL(verificationUrl);

    const responseData = {
      userName: user.fullName,
      courseName: course.title,
      certificateId: certificateId,
      issueDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      qrCode: qrCode
    };
    
    console.log("Sending certificate data:", responseData);
    res.json(responseData);

  } catch (err) {
    console.error("CERTIFICATE DATA ERROR:", err);
    res.status(500).json({ message: "Failed to get certificate data", error: err.message });
  }
};