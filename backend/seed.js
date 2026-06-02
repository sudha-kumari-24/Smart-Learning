const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Course = require('./models/Course');
const User = require('./models/User');
const CourseProgress = require('./models/CourseProgress');
const CallRequest = require('./models/CallRequest');
const StudySession = require('./models/StudySession');
const InterviewSession = require('./models/InterviewSession');

dotenv.config();

async function seed() {
  try {
    await connectDB();

    // 1) Clear old data
    await Promise.all([
      Course.deleteMany({}),
      User.deleteMany({}),
      CourseProgress.deleteMany({}),
      CallRequest.deleteMany({}),
      StudySession.deleteMany({}),
      InterviewSession.deleteMany({}),
    ]);


    console.log('Cleared existing collections');


    // Drop index if exists
    try {
      await Course.collection.dropIndex('level_1');
      console.log('✅ Dropped unique index on level field');
    } catch (err) {
      console.log('⚠️ Index level_1 may not exist:', err.message);
    }


    // 2) Insert users
    const users = await User.insertMany([
      {
        fullName: 'Sudha Kumari',
        email: 'sudhakumarichauhan24@gmail.com',
        passwordHash: '$2b$10$MKYay65gGhoDQrVuzqU31O1d2ctSZv5vIozdiC1HrtNHZzgwq6D.K',
        classCourse: 'B.Tech CSE',
        schoolCollege: 'University of Lucknow',
      },
      {
        fullName: 'Shanaya',
        email: 'shanaya@gmail.com',
        passwordHash: '$2b$10$X9VcyKsGfvIgNqwRCGPGYulIRuCtdArha8qobeU0SUchBonKv8iEK',
        classCourse: 'B.Tech',
        schoolCollege: 'Demo College',
      },
    ]);

    console.log(`Inserted ${users.length} users`);

    // 3) Insert courses
    const coursesData = [
      {
        title: 'Data Structures Essentials',
        level: 'Beginner',
        durationHours: 8,
        tags: ['DSA', 'CS Fundamentals'],
        description: 'Master essential data structures',
        category: 'Computer Science',
        enrolled: 12500,
        completionRate: '92%',
        certificate: true,
        instructor: 'Industry Expert',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          { title: "Arrays", embedUrl: "https://www.youtube.com/embed/AT14lCXuMKI" },
          { title: "Linked List", embedUrl: "https://www.youtube.com/embed/njTh_OwMljA" }
        ]
      },
      {
        title: 'Machine Learning for Students',
        level: 'Intermediate',
        durationHours: 10,
        tags: ['ML', 'AI', 'Python'],
        description: 'Learn ML concepts with practical projects',
        category: 'Data Science',
        enrolled: 8900,
        completionRate: '88%',
        certificate: true,
        instructor: 'Industry Expert',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          { title: "ML Basics", embedUrl: "https://www.youtube.com/embed/i_LwzRVP7bg" },
          { title: "ML Advance", embedUrl: "https://www.youtube.com/embed/hR-tMLTMw0s" }
        ]
      },
      {
        title: 'Communication Skills for Techies',
        level: 'All',
        durationHours: 4,
        tags: ['Soft Skills', 'Communication', 'Interview'],
        description: 'Improve your communication for interviews',
        category: 'Soft Skills',
        enrolled: 5400,
        completionRate: '95%',
        certificate: true,
        instructor: 'Industry Expert',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          { title: "Personality Development", embedUrl: "https://www.youtube.com/embed/nwlPIoFhNc0" },
          { title: "Spoken English", embedUrl: "https://www.youtube.com/embed/AmHS2GrmWXI" }
        ]
      },
      {
        title: 'Full Stack Web Development',
        level: 'Intermediate',
        durationHours: 12,
        tags: ['Web', 'React', 'Node.js', 'MongoDB'],
        description: 'Build modern web applications',
        category: 'Development',
        enrolled: 15000,
        completionRate: '85%',
        certificate: true,
        instructor: 'Senior Developer',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          { title: "Become a Fullstack Developer", embedUrl: "https://www.youtube.com/embed/LzMnsfqjzkA" },
          { title: "React Fundamentals", embedUrl: "https://www.youtube.com/embed/SqcY0GlETPk" },
          { title: "Node.js & Express API", embedUrl: "https://www.youtube.com/embed/0IciwnJ6PJI" },
          { title: "Connecting Frontend to Backend", embedUrl: "https://www.youtube.com/embed/WY0TFUPu40s" }
        ]
      }
    ];

    const courses = [];
    for (const c of coursesData) {
      const course = await Course.findOneAndUpdate(
        { title: c.title },
        { $set: c },
        { new: true, upsert: true }
      );
      courses.push(course);
    }
    console.log(`Inserted ${courses.length} courses`);

    // 4) Insert some course progress for demo user
    const demoUser = users[0];
    await CourseProgress.updateOne(
      { user: demoUser._id, course: courses[0]._id },
      { 
        $set: { 
          progressPercent: 40, 
          completed: false,
          watchedVideos: [0, 1, 2, 3],
          lastVideoIndex: 3
        } 
      },
      { upsert: true }
    );
    console.log('Inserted course progress records');

    // 5) Insert study sessions (timer data)
    await StudySession.insertMany([
      { user: demoUser._id, date: '2025-01-01', minutesStudied: 30, sessionType: 'timer' },
      { user: demoUser._id, date: '2025-01-02', minutesStudied: 45, sessionType: 'timer' },
      { user: demoUser._id, date: '2025-01-03', minutesStudied: 20, sessionType: 'posture' },
    ]);
    console.log('Inserted study sessions');

    // 6) Insert demo call request
    await CallRequest.create({
      user: demoUser._id,
      topic: 'stress',
      note: 'Need help balancing study and project work.',
    });
    console.log('Inserted sample call request');

    // 7) Insert interview sessions
    await InterviewSession.insertMany([
      {
        userId: demoUser._id,
        interviewType: 'software',
        duration: 15,
        videoFilename: 'software_user123_15min_sample.webm',
        videoPath: 'frontend/src/assets/users_interview/software_user123_15min_sample.webm',
        status: 'recorded',
        createdAt: new Date('2025-01-10')
      },
      {
        userId: demoUser._id,
        interviewType: 'general',
        duration: 10,
        videoFilename: 'general_user123_10min_sample.webm',
        videoPath: 'frontend/src/assets/users_interview/general_user123_10min_sample.webm',
        status: 'reviewed',
        reviewedAt: new Date('2025-01-11'),
        createdAt: new Date('2025-01-09')
      }
    ]);
    console.log('Inserted sample interview sessions');

    console.log('Seeding completed ✅');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();