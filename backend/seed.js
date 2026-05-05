const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Course = require('./models/Course');
const User = require('./models/User');
const Progress = require('./models/Progress');
const CallRequest = require('./models/CallRequest');
const DailyProgress = require('./models/DailyProgress');

const InterviewSession = require('./models/InterviewSession');


dotenv.config();

async function seed() {
  try {
    await connectDB();

    // 1) Clear old data
    await Promise.all([
      Course.deleteMany({}),
      User.deleteMany({}),
      Progress.deleteMany({}),
      CallRequest.deleteMany({}),
      DailyProgress.deleteMany({}),
      InterviewSession.deleteMany({}),

    ]);

    console.log('Cleared existing collections');


    try {
      await Course.collection.dropIndex('level_1');
      console.log('✅ Dropped unique index on level field');
    } catch (err) {
      console.log('⚠️ Index level_1 may not exist:', err.message);
    }

    // 2) Insert raw users
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
          {
            title: "Arrays",
            embedUrl: "https://www.youtube.com/embed/AT14lCXuMKI"
          },
          {
            title: "Linked List",
            embedUrl: "https://www.youtube.com/embed/njTh_OwMljA"
          }
        ]
      },
      {
        title: 'Machine Learning for Students',
        level: 'Intermediate',
        durationHours: 10,
        tags: ['ML', 'AI', 'Python'],
        description: 'Learn ML concepts with practical projects and real-world applications',
        category: 'Data Science',
        enrolled: 8900,
        completionRate: '88%',
        certificate: true,
        instructor: 'Industry Expert',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          {
            title: "ML Basics",
            embedUrl: "https://www.youtube.com/embed/i_LwzRVP7bg"
          },
          {
            title: "ML Advance",
            embedUrl: "https://www.youtube.com/embed/hR-tMLTMw0s"
          }
        ]
      },
      {
        title: 'Communication Skills for Techies',
        level: 'All',
        durationHours: 4,
        tags: ['Soft Skills', 'Communication', 'Interview'],
        description: 'Improve your communication for interviews and workplace success',
        category: 'Soft Skills',
        enrolled: 5400,
        completionRate: '95%',
        certificate: true,
        instructor: 'Industry Expert',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          {
            title: "Personality Development",
            embedUrl: "https://www.youtube.com/embed/nwlPIoFhNc0"
          },
          {
            title: "Spoken English",
            embedUrl: "https://www.youtube.com/embed/AmHS2GrmWXI"
          }
        ]
      },
      {
        title: 'Full Stack Web Development',
        level: 'Intermediate',
        durationHours: 12,
        tags: ['Web', 'React', 'Node.js', 'MongoDB'],
        description: 'Build modern web applications from frontend to backend',
        category: 'Development',
        enrolled: 15000,
        completionRate: '85%',
        certificate: true,
        instructor: 'Senior Developer',
        language: 'English',
        isActive: true,
        price: 0,
        videos: [
          { title: "Become a Fullstack Developer from Scratch", embedUrl: "https://www.youtube.com/embed/LzMnsfqjzkA" },
          { title: "React Fundamentals", embedUrl: "https://www.youtube.com/embed/SqcY0GlETPk" },
          { title: "Node.js & Express API", embedUrl: "https://www.youtube.com/embed/0IciwnJ6PJI" },
          { title: "Connecting Frontend to Backend", embedUrl: "https://www.youtube.com/embed/WY0TFUPu40s" }
        ]
      }
    ];

    const courses = [];

    for (const c of coursesData) {
      const course = await Course.findOneAndUpdate(
        { title: c.title },   // 🔑 unique
        { $set: c },
        { new: true, upsert: true }
      );
      courses.push(course);
    }


    console.log(`Inserted ${courses.length} courses`);

    // 4) Insert some progress for demo user[0]
    const demoUser = users[0];

    for (const p of [
      {
        user: users[0]._id,
        course: courses[0]._id,
        completedLessons: 4,
        totalLessons: 10,
        completionPercentage: 40,
        status: 'in_progress'
      }
    ]) {
      await Progress.updateOne(
        { user: p.user, course: p.course }, // 🔑 unique combo
        { $set: p },
        { upsert: true }
      );
    }

    console.log('Inserted progress records');

    // 5) Insert demo call request
    await CallRequest.create({
      user: demoUser._id,
      topic: 'stress',
      note: 'Need help balancing study and project work.',
    });

    console.log('Inserted sample call request');

    // 6) Insert daily progress
    await DailyProgress.insertMany([
      {
        user: demoUser._id,
        course: courses[0]._id,
        date: new Date('2025-01-01'),
        minutesStudied: 30,
      },
      {
        user: demoUser._id,
        course: courses[0]._id,
        date: new Date('2025-01-02'),
        minutesStudied: 45,
      },
      {
        user: demoUser._id,
        course: courses[1]._id,
        date: new Date('2025-01-02'),
        minutesStudied: 20,
      },
    ]);

    console.log('Inserted daily progress records');





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