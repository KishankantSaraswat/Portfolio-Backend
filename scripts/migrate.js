const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const Profile = require('../models/Profile');
const Service = require('../models/Service');
const Client = require('../models/Client');
const ResumeItem = require('../models/ResumeItem');
const Skill = require('../models/Skill');
const Certificate = require('../models/Certificate');
const SidebarInfo = require('../models/SidebarInfo');
const Category = require('../models/Category');

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

// -- 1. PROJECTS --
const projects = [
    { title: 'GLAMIS-- AI MOCK Interviewer', category: 'Application', image: '/assets/images/GLAMIS.png', link: 'http://glamis.in/' },
    { title: 'Deliver360-AI & IOT Integrated Smart Delivery kit', category: 'Application', image: '/assets/images/Deliver360.png', link: 'https://deliver360.onrender.com/' },
    { title: 'AI & IOT Integrated Yoga_Mat', category: 'Application', image: '/assets/images/AI_Yoga_Mat.png', link: 'https://zenmat-ai-yoga-mat.onrender.com' },
    { title: 'AI-Intreviewer "MockMate"', category: 'Application', image: '/assets/images/project-11.png', link: 'https://live-yduf.onrender.com/' },
    { title: 'Invoice-Automation Agent', category: 'RPA', image: '/assets/images/UIPATH.png', link: 'https://github.com/KishankantSaraswat/UIPATH-Automation/' },
    { title: 'Kidney Dialysis Appointment App', category: 'Application', image: '/assets/images/KidneyDialysisApp.jpg', link: 'https://play.google.com/store/apps/details?id=com.diassence.app' },
    { title: 'RAG PDF QA-Conversation', category: 'Generative AI', image: '/assets/images/project-10.png', link: 'https://github.com/KishankantSaraswat/KishankantSaraswat-GenrativeAI-AgenticAI/tree/main/RAG-QA-Conversation' },
    { title: 'CustomerCare-AIAgent', category: 'Agentic AI', image: '/assets/images/flowchart.png', link: 'https://github.com/KishankantSaraswat/KishankantSaraswat-GenrativeAI-AgenticAI/tree/main/AgenticAI_CustomerCare' },
    { title: 'Modern Portfolio', category: 'Application', image: '/assets/images/project-1.jpg', link: '#' },
    { title: 'AI Code Reviewer', category: 'Generative AI', image: '/assets/images/Ai-codeReveiwer.png', link: 'https://ai-codereviewerfrontend-1.onrender.com/' },
    { title: 'ChatSQL', category: 'Generative AI', image: '/assets/images/ChatSQL.png', link: 'https://kishankantsaraswat-kishankantsaraswat-genrati-chatsqlapp-8lkwtk.streamlit.app/' },
    { title: 'GenDrive+', category: 'Generative AI', image: '/assets/images/GenDrive+.png', link: 'https://github.com/KishankantSaraswat/GenDrive-' },
    { title: 'Fluid-Flow-Dynamics', category: 'AIML', image: '/assets/images/fluid.png', link: 'https://github.com/sanskrati-3079/Fluid-flow-dynamics' },
    { title: 'Zyra-Autonomous-Fleet-Management-System', category: 'Application', image: '/assets/images/Zyra.png', link: 'https://github.com/KishankantSaraswat/Zyra-Autonomous-fleet_management-Using-RL/' },
    { title: 'Ayurveda Chatbot-Software', category: 'Application', image: '/assets/images/project-5.jpg', link: '#' },
    { title: 'Fashion Recommendation System', category: 'AIML', image: '/assets/images/project-8.png', link: '#' },
    { title: 'Netflix Recommendation System', category: 'AIML', image: '/assets/images/project-6.jpg', link: '#' },
    { title: 'Resume Ranker', category: 'AIML', image: '/assets/images/project-7.png', link: '#' },
    { title: 'Face Recognition Attendance System Software', category: 'Application', image: '/assets/images/project-6.png', link: 'https://drive.google.com/uc?export=download&id=1r1Y25deREKIkDuWByHs3EjWFmPWSex32' },
    { title: 'IPL Analysis using SQL & PowerBI', category: 'Data Analytics', image: '/assets/images/project-9.png', link: '#' },
    { title: 'Diwali Sales Data Analysis using Python', category: 'Data Analytics', image: '/assets/images/banner.jpg', link: 'https://github.com/KishankantSaraswat/Data-Analytics/blob/main/Diwali_Sales_Analysis/Diwali_Sales_Analysis.ipynb' },
    { title: 'Netflix Stock Data Analysis using Python', category: 'Data Analytics', image: '/assets/images/Netfix Stock Analysis.jpg', link: 'https://github.com/KishankantSaraswat/Data-Analytics/blob/main/Project_Netflix_stock_Analysis.ipynb' },
    { title: 'Generative ChatApp', category: 'Generative AI', image: '/assets/images/project-10.png', link: '#' }
];

// -- 1.5 CATEGORIES --
const initialCategories = [
    { name: 'Application' },
    { name: 'AIML' },
    { name: 'Generative AI' },
    { name: 'Agentic AI' },
    { name: 'RPA' },
    { name: 'Data Analytics' }
];

// -- 2. TESTIMONIALS --
const testimonials = [
    { name: "Daniel lewis", date: "14 June, 2021", avatar: "/assets/images/avatar-1.png", text: "Krishankant Saraswat's ability to transform complex data into actionable insights was crucial in enhancing our operational efficiency. His collaborative approach and attention to detail ensured that our project goals were met on time and exceeded expectations." },
    { name: "Jessica miller", date: "14 June, 2021", avatar: "/assets/images/avatar-2.png", text: "Krishankant Saraswat was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client." },
    { name: "Emily evans", date: "14 June, 2021", avatar: "/assets/images/avatar-3.png", text: "Krishankant Saraswat was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client." },
    { name: "Shiven Rastogi", date: "14 June, 2021", avatar: "/assets/images/avatar-4.png", text: "Krishankant Saraswat's dedication to continuous learning and innovation was evident in his approach to optimizing our data visualization strategies. His insights helped us uncover valuable insights that transformed how we approach data-driven decision-making." }
];

// -- 3. PROFILE (About Me) --
const profileText = "I am a highly motivated AIML undergraduate student at GLA University with a strong passion for developing innovative AI-driven solutions. My expertise includes Python, React, and AI/ML techniques, demonstrated through impactful projects like the AI Mock Interview Portal and ZenMat, a Smart Yoga Mat that secured first place in the 2024 Smart India Hackathon. I excel in problem-solving, effective communication, and team collaboration, with recognition among the top 4% of coders on LeetCode. I actively engage in hackathons and workshops, continually enhancing my technical and professional skills.";

// -- 4. SERVICES --
const services = [
    { title: "Data Analysis", text: "Transforming complex data into actionable insights.", icon: "/assets/images/data-analysis-svgrepo-com.svg" },
    { title: "Machine Learning", text: "Developing efficient and scalable machine learning models.", icon: "/assets/images/machine-learning.png" },
    { title: "AI Solutions", text: "Creating AI-driven applications that solve real-time problems.", icon: "/assets/images/ai-svgrepo-com.svg" },
    { title: "Collaboration", text: "Partnering with renowned brands to enhance their operations.", icon: "/assets/images/collaboration-team-svgrepo-com.svg" },
    { title: "Continuous Learning", text: "Advancing my expertise in data science and AI to stay ahead.", icon: "/assets/images/learning-school-studies-svgrepo-com.svg" },
    { title: "Web Development", text: "High-quality development of data-driven websites and applications.", icon: "/assets/images/icon-dev.svg" },
    { title: "Data Visualization", text: "Creating compelling visual representations of data.", icon: "/assets/images/combo-chart-svgrepo-com.svg" }
];

// -- 5. CLIENTS --
const clients = [
    { name: "IBM Hackathons", image: "/assets/images/Designer.png", link: "https://ibmhackathons.theax.in/" },
    { name: "SIH", image: "/assets/images/sih.png", link: "#" },
    { name: "Primathon", image: "/assets/images/Primathon-removebg-preview.png", link: "#" },
    { name: "GFG", image: "/assets/images/gfg_logo1.png", link: "#" }
];

// -- 6. RESUME ITEMS --
const resumeItems = [
    // Education
    { type: "Education", title: "Bachelor of Technology in Computer Science (AIML), GLA University", duration: "2022 — 2026", description: "Pursuing B.Tech in Computer Science with a current aggregate of 79% (6th Semester). Actively engaged in AI/ML-driven projects." },
    { type: "Education", title: "12th Grade CBSE Board Examination, Saraswati Vidhya Mandir, Agra", duration: "2021 — 2022", description: "Scored 87% overall with 90% in PCM, reflecting strong academic performance and subject proficiency." },
    { type: "Education", title: "10th Grade CBSE Board Examination, Heritage Public School, Agra", duration: "2019 — 2020", description: "Secured 84% overall, with an emphasis on Mathematics and Science." },
    // Experience
    { type: "Experience", title: "AI Mock Interview Portal Development Intern, GLA University", duration: "September 2024 — Present", description: "Developed an AI mock interview portal using MERN stack & ChatGPT-4. Implemented grammar/communication/cheating evaluation with real-time feedback." },
    { type: "Experience", title: "Job-Oriented Value-Added Course Trainee, GLA University", duration: "June 2024 — July 2024", description: "Built a platform integrating voice & face emotion recognition for interview analysis. Developed a real-time virtual meeting emotion detection system. Learned React (frontend) and Python (backend)." },
    { type: "Experience", title: "App Developer Intern, Diassence Healthcare Pvt. Ltd", duration: "January 2024 — March 2024", description: "Built Kidney Dialysis App using React Native, Django, and REST APIs. Led full-stack development for patient management." },
    // Achievements (In Resume tab)
    { type: "Achievement", title: "First Prize at NIT Kurukshetra Hackathon 2024", duration: "2024", description: "Secured first position among 1,600+ teams for innovative project solutions." },
    { type: "Achievement", title: "Finalist at Smart India Hackathon 2024", duration: "2024", description: "Qualified for the finale in the hardware category." },
    { type: "Achievement", title: "First Rank in Internal SIH 2024", duration: "2024", description: "Secured first position in the hardware category at GLA University's Internal Smart India Hackathon." },
    { type: "Achievement", title: "Winner of Data Dash 2025", duration: "2025", description: "Achieved first position in Power BI & Excel Dashboard competition." },
    { type: "Achievement", title: "First Position at United Hackathon 3.0, UCER", duration: "2025", description: "Secured first place in the United Hackathon 3.0 competition at UCER." },
    { type: "Achievement", title: "Second Place at Project Expo, GLA University", duration: "2025", description: "Achieved second position in the Project Expo competition at GLA University." },
    { type: "Achievement", title: "Udemy Certification - Complete ML & NLP Bootcamp", duration: "2025", description: "Completed comprehensive ML & NLP Bootcamp covering MLOps & Deployment (June 2025)." }
];

// -- 7. SKILLS --
const skills = [
    // Bars
    { category: "Bar", title: "Programming Languages", percentage: 90, icon: "code-slash-outline" },
    { category: "Bar", title: "Web Development", percentage: 85, icon: "globe-outline" },
    { category: "Bar", title: "Machine Learning & AI", percentage: 85, icon: "brain-outline" },
    { category: "Bar", title: "Data Science & Analysis", percentage: 85, icon: "analytics-outline" },
    { category: "Bar", title: "Mobile Development", percentage: 80, icon: "phone-portrait-outline" },
    { category: "Bar", title: "DevOps & Tools", percentage: 75, icon: "server-outline" },
    // Tags
    { category: "Tag", title: "Languages", icon: "code-working-outline", tags: ['Java', 'Python', 'SQL', 'PostgreSQL', 'JavaScript', 'HTML/CSS'] },
    { category: "Tag", title: "Frameworks", icon: "construct-outline", tags: ['React.js', 'React Native', 'Node.js', 'Flask', 'Django'] },
    { category: "Tag", title: "ML/AI", icon: "brain-outline", tags: ['TensorFlow', 'Scikit-learn', 'Computer Vision', 'NLP', 'Deep Learning'] },
    { category: "Tag", title: "Data Tools", icon: "bar-chart-outline", tags: ['pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Power BI'] },
    { category: "Tag", title: "DevOps", icon: "cloud-outline", tags: ['Docker', 'Git', 'GCP', 'AWS'] },
    { category: "Tag", title: "Concepts", icon: "library-outline", tags: ['DSA', 'OOP', 'Neural Networks', 'Time Series', 'Big Data'] }
];

// -- 8. CERTIFICATES --
const certificates = [
    { title: "Complete Data Science, ML, DL, NLP Bootcamp", category: "Udemy Certification", date: "June 22, 2025", image: "/assets/Certificate/Udemy-Course.png", description: "Completed a 99-hour intensive bootcamp by Krish Naik and KRISHAI Technologies, gaining hands-on skills in Data Science, Machine Learning, Deep Learning, and Natural Language Processing.", link: "https://www.udemy.com/certificate/UC-66203ad1-4183-486b-80f1-764da1571d16/" },
    { title: "ZenMat: AI-Integrated Smart Yoga Mat", category: "NIT KURUKSHETRA HACKATHON WINNERS", date: "2024", image: "/assets/Certificate/NIT.png", description: "Won at the NIT Kurukshetra Hackathon for ZenMat, a smart yoga mat leveraging AI and IoT to improve posture tracking, health monitoring, and environmental awareness.", link: "https://drive.google.com/file/d/152uMcFGaM_jQOxX-dnjKgabsLhXNDXXh/view?usp=sharing" },
    { title: "ZenMat: AI-Integrated Smart Yoga Mat", category: "SIH 2024 WINNERS", date: "2024", image: "/assets/Certificate/internalSIH2024winner.png", description: "Secured First Rank in the Hardware Category at GLA University's Internal Smart India Hackathon 2024. Features include real-time posture tracking, health monitoring, and environmental intelligence.", link: "https://drive.google.com/file/d/15JnecFRQYVubsRUTF2IyvcAyghOJWyCj/view?usp=sharing" },
    { title: "IoT-Enabled Ecosystem for Delivery Workforce", category: "SIH 2024 FINALE FINALISTS", date: "2024", image: "/assets/Certificate/sih finalist.png", description: "Finalists at Smart India Hackathon 2024 Hardware Edition for developing an innovative IoT-enabled ecosystem to address the challenges faced by the delivery workforce.", link: "https://drive.google.com/file/d/15T8qa5CSnlvqBzrM__9l34xBNjaynaEy/view?usp=sharing" },
    { title: "Finalists Out of 2661 Teams", category: "MNIT HACKATHON 2024 FINALISTS", date: "2024", image: "/assets/Certificate/MNIT.png", description: "Selected as finalists in the MNIT Hackathon 2024, emerging among 2661 competing teams for an innovative project that highlights creativity, technical expertise, and impactful solutions.", link: "https://drive.google.com/file/d/15RYVCvjem0UgYJhkCfKCdhm0AQ9S5AbI/view?usp=sharing" },
    { title: "Participation in Glathon Campus Hackathon", category: "GLATHON CAMPUS HACKATHON PARTICIPANT", date: "2024", image: "/assets/Certificate/Glathon.png", description: "Successfully participated in Glathon Campus Hackathon, demonstrating problem-solving, teamwork, and innovative thinking in a competitive environment.", link: "https://drive.google.com/file/d/15I3HWDRQuRTr2f6B1uYEKC-GDzzu_q4Y/view?usp=sharing" },
    { title: "Participation in Flipkart Grid Level 1", category: "FLIPKART GRID LEVEL 1 PARTICIPANT", date: "2024", image: "/assets/Certificate/flipkart.png", description: "Successfully participated in Flipkart Grid Level 1, showcasing skills in problem-solving, innovation, and technical challenges in a highly competitive platform.", link: "https://drive.google.com/file/d/15SON9oyRvZmf19qTl70jZ95pXOXcwokh/view?usp=sharing" },
    { title: "Agra Vigyan Mahotsav Participation", category: "SCHOOL-LEVEL PARTICIPATION", date: "2022", image: "/assets/Certificate/agra.png", description: "Participated in the Agra District Level Agra Vigyan Mahotsav at the school level, showcasing a passion for technology and innovation from a young age.", link: "https://drive.google.com/file/d/14w43I0_GOEOsDUSZ0FPHD8RlIPeExxmy/view?usp=sharing" },
    { title: "Participation in Internal SIH 2023", category: "INTERNAL SIH 2023 PARTICIPANT", date: "2023", image: "/assets/Certificate/sih internal 2023.png", description: "Actively participated in the Internal Smart India Hackathon 2023, showcasing innovative problem-solving skills and a passion for technology.", link: "https://drive.google.com/file/d/15AZoK_NQXh2s0tdYecig_tesjFEQBKrc/view?usp=sharing" },
    { title: "Micro Experience™ Program for Operations Analyst", category: "MICRO EXPERIENCE CERTIFICATE", date: "2023", image: "/assets/pdf/images/bluetick.png", description: "Building a Model for Identifying Inaccurate Weight and Volume Measurements in ECommerce Box Pick-up", link: "https://drive.google.com/file/d/1NqgZLvkTymLtVL2lZGdyFaAj8OxwWBU1/view?usp=sharing" },
    { title: "Python Project for Data Science", category: "Python Project DataScience Certificate (Coursera)", date: "2023", image: "/assets/pdf/images/ProjectDataScience.png", description: "In the Python Data Science course, you'll work on a real-world project, using Python, Pandas, Beautiful Soup, and Plotly to clean, analyze, visualize data, and build an interactive dashboard in Jupyter notebook", link: "https://drive.google.com/file/d/1nNAWiiBcm_g9lqt_WotZMDA5abc03iQk/view?usp=sharing" }
];

// -- 9. SIDEBAR INFO --
const sidebarInfo = {
    name: "Krishankant Saraswat",
    title: "Full Stack Data Scientist",
    avatar: "/assets/images/my-avatar.png",
    email: "krishnkantsaraswat830@gmail.com",
    phone: "8923834362",
    birthday: "August 23, 2003",
    location: "Agra, Uttar Pradesh, INDIA",
    socials: {
        twitter: "https://x.com/Krishankan40051",
        leetcode: "https://leetcode.com/u/krishankant_2003/",
        github: "https://github.com/KishankantSaraswat",
        linkedin: "https://www.linkedin.com/in/krishnkantsaraswat830/"
    }
};

const migrateData = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB, starting mega-migration...');

        // Clear existing
        await Project.deleteMany({});
        await Testimonial.deleteMany({});
        await Profile.deleteMany({});
        await Service.deleteMany({});
        await Client.deleteMany({});
        await ResumeItem.deleteMany({});
        await Skill.deleteMany({});
        await Certificate.deleteMany({});
        await SidebarInfo.deleteMany({});
        await Category.deleteMany({});
        console.log('Cleared existing collections');

        // Insert ALL
        await Project.insertMany(projects.map((p, i) => ({ ...p, order: i })));
        await Testimonial.insertMany(testimonials);
        await Profile.create({ text: profileText });
        await Service.insertMany(services);
        await Client.insertMany(clients);
        await ResumeItem.insertMany(resumeItems);
        await Skill.insertMany(skills);
        await Certificate.insertMany(certificates);
        await SidebarInfo.create(sidebarInfo);
        await Category.insertMany(initialCategories);
        console.log(`Successfully inserted legacy data into MongoDB:`);
        console.log(`- ${projects.length} Projects`);
        console.log(`- ${testimonials.length} Testimonials`);
        console.log(`- 1 Profile`);
        console.log(`- ${services.length} Services`);
        console.log(`- ${clients.length} Clients`);
        console.log(`- ${resumeItems.length} Resume Items`);
        console.log(`- ${skills.length} Skills`);
        console.log(`- ${certificates.length} Certificates`);
        console.log(`- 1 Sidebar Info`);
        console.log(`- ${initialCategories.length} Categories`);

        process.exit(0);
    } catch (err) {
        console.error('Error migrating data:', err);
        process.exit(1);
    }
};

migrateData();
