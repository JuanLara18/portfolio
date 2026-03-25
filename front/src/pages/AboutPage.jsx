import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SEO } from '../components/common/SEO';
import { variants as motionVariants, defaultViewportSettings, earlyViewportSettings } from '../utils';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code, 
  Database, 
  BookOpen, 
  Server, 
  BrainCircuit, 
  LineChart, 
  Globe, 
  Mail, 
  Phone,
  MapPin,
  Github,
  BarChart,
  Terminal,
  Cloud,
  Layers,
  Box,
  Cpu
} from 'lucide-react';
import { HoverMotion } from '../components/layout';
import { ScrollIndicator, OptimizedImage } from '../components/ui';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const fadeInRight = motionVariants.fadeInRight();
const fadeInLeft = motionVariants.fadeInLeft();
const staggerContainer = motionVariants.stagger();

// Skill component
const SkillItem = ({ name, icon: Icon, color = "blue" }) => {
  // Color mappings for different UI elements
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/30",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30",
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/30",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/30",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30"
  };
  
  const classes = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`flex items-center p-2 xl:p-3 rounded-lg border ${classes} transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5`}>
      <Icon className="w-4 h-4 xl:w-5 xl:h-5 mr-2 xl:mr-3 flex-shrink-0" />
      <span className="font-medium text-[13px] lg:text-xs xl:text-sm whitespace-nowrap tracking-tight">{name}</span>
    </div>
  );
};

// Experience card component
const ExperienceCard = ({ 
  role, 
  company, 
  period, 
  location, 
  description, 
  responsibilities, 
  skills, 
  logo,
  isExpanded,
  onToggle
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const [localExpanded, setLocalExpanded] = useState(false);
  
  const expanded = isExpanded !== undefined ? isExpanded : localExpanded;
  const toggle = () => {
    if (onToggle) onToggle();
    else setLocalExpanded(!localExpanded);
  };
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sm:p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group mobile-card-large hover:shadow-md transition-shadow"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 dark:bg-blue-900/10 rounded-full -mr-20 -mt-20 z-0 transform group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center mb-4 gap-4">
          <div className="w-28 h-20 md:w-32 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white p-2 shadow-md flex items-center justify-center">
            <OptimizedImage 
              src={`/images/company-logos/${logo}`} 
              alt={`${company} company logo`}
              objectFit="contain"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mobile-card-title">{role}</h3>
            <div className="text-lg text-blue-600 dark:text-blue-400 font-medium">{company}</div>
            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 mt-1 gap-2">
              <span>{period}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span>{location}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed mobile-card-text">{description}</p>
        
        {responsibilities && responsibilities.length > 0 && (
          <div className="mb-4">
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold mb-2 mobile-card-subtitle">Key Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mb-2">
                    {responsibilities.map((item, index) => (
                      <li key={index} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={toggle}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium cursor-pointer"
            >
              {expanded ? 'Show less \u2191' : 'Key responsibilities \u2193'}
            </button>
          </div>
        )}
        
        {skills && (
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Education card component
const EducationCard = ({ 
  degree, 
  institution, 
  period, 
  location, 
  focus, 
  gpa, 
  certificateLink, 
  logo 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 relative overflow-hidden mobile-card-large hover:shadow-md transition-shadow"
    >
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50/50 dark:bg-blue-900/10 rounded-full -ml-20 -mb-20 z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-5 gap-3 sm:gap-4">
          <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1.5 shadow-sm flex items-center justify-center">
            <OptimizedImage 
              src={`/images/institutions/${logo}`} 
              alt={`${institution} institutional logo`}
              objectFit="contain"
            />
          </div>
          
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mobile-card-title leading-tight mb-0.5 tracking-tight">{degree}</h3>
            <div className="text-sm sm:text-[15px] text-blue-600 dark:text-blue-400 font-medium leading-tight tracking-tight whitespace-nowrap">{institution}</div>
            <div className="flex flex-wrap items-center text-xs text-gray-600 dark:text-gray-400 mt-1.5 gap-1.5">
              <span className="whitespace-nowrap">{period}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0"></span>
              <span className="whitespace-nowrap">{location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {focus && (
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md text-sm flex items-center">
              <BookOpen size={14} className="mr-1.5" />
              <span>Focus: {focus}</span>
            </div>
          )}
          
          {gpa && (
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm flex items-center">
              <Award size={14} className="mr-1.5" />
              <span>GPA: {gpa}</span>
            </div>
          )}
        </div>
        
        {certificateLink && (
          <a 
            href={certificateLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline gap-1 group"
          >
            <span>View Certificate</span>
            <ExternalLink size={14} className="transform group-hover:translate-x-1 transition-transform duration-150" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

// Course/Training card component
const CourseCard = ({ 
  title, 
  provider, 
  date, 
  duration,
  description, 
  certificateLink, 
  certificateId,
  topics,
  logo 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700 h-full relative overflow-hidden group mobile-card"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full -mr-12 -mt-12 z-0 transform group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1.5 shadow-sm flex items-center justify-center">
            <OptimizedImage 
              src={`/images/institutions/${logo}`} 
              alt={`${provider} training provider logo`}
              objectFit="contain"
            />
          </div>
          
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mobile-card-title leading-snug">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{provider}</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <span className="card-tag inline-flex items-center">
            {date}
          </span>
          
          {duration && (
            <span className="card-tag inline-flex items-center">
              {duration}
            </span>
          )}
        </div>
        
        {/* Description hidden for visual density — data preserved in course objects */}
        {false && description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 card-description">{description}</p>
        )}
        
        {certificateLink && (
          <div className="mt-auto pt-2">
            <a 
              href={certificateLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm hover:underline gap-1 group"
            >
              <span>Verify Certificate</span>
              <ExternalLink size={12} className="transform group-hover:translate-x-1 transition-transform duration-150" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function AboutPage() {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expandedExperienceId, setExpandedExperienceId] = useState(null);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef);
  
  // Transform values based on scroll position
  const heroOpacity = useTransform(scrollY, [260, 800], [1, 0.98]);
  const heroScale = useTransform(scrollY, [260, 800], [1, 0.995]);
  
// Experience data
const experiences = [
  {
    role: "AI Engineer",
    company: "Falabella",
    period: "November 2025 - Present",
    location: "Bogotá D.C., Colombia (Hybrid)",
    description:
      "Develop end-to-end ML solutions for large-scale logistics operations, managing the full lifecycle from data processing and model development to production deployment on GCP infrastructure. Work spans anomaly detection, OCR pipelines, and optimization systems across millions of operational records.",
    responsibilities: [
      "Build data processing pipelines integrating OCR engines, anomaly detection models, and cloud data warehouses, enabling automated extraction and quality validation across large-scale operational datasets.",
      "Design ML system integrations connecting modern AI capabilities with legacy enterprise platforms, implementing scalable data flows that bridge existing infrastructure with production-ready machine learning services.",
      "Architect end-to-end ML solutions for logistics optimization, integrating anomaly detection, document processing, and data-driven decision systems on Google Cloud Platform."
    ],
    skills: ["ML Systems", "Anomaly Detection", "OCR", "GCP", "Data Pipelines", "Python"],
    logo: "falabella-logo.png"
  },
  {
    role: "LLM/ML Specialist",
    company: "GenomAI",
    period: "June 2025 - December 2025",
    location: "Danville, USA (Remote)",
    description:
      "Architected production AI systems integrating RAG pipelines with vector databases and LLM fine-tuning techniques, building end-to-end generative AI solutions with strict compliance requirements and real-time performance demands.",
    responsibilities: [
      "Developed compliance-grade generative AI solutions using advanced prompt engineering and retrieval-augmented generation to process multimodal data, implementing strict data governance and privacy frameworks.",
      "Built and optimized ML deployment pipelines with Docker containerization and CI/CD automation, implementing scalable cloud infrastructure that supports production healthcare applications with sub-second response requirements.",
      "Led cross-functional collaboration to translate complex domain workflows into scalable AI architectures, bridging subject-matter expertise with production-grade ML systems."
    ],
    skills: ["LLM Fine-tuning", "RAG Systems", "Vector Databases", "Compliance & Governance", "Prompt Engineering", "Docker"],
    logo: "genomai-logo.png"
  },
  {
    role: "Research Associate | ML Specialist",
    company: "Harvard University",
    period: "Sep 2022 - July 2025",
    location: "Boston, USA (Remote)",
    description:
      "Built end-to-end ML pipelines integrating clustering algorithms, XGBoost models, and NLP techniques to analyze large-scale organizational datasets, revealing key insights on firm learning strategies and technology adoption patterns.",
    responsibilities: [
      "Designed scalable data processing frameworks for modeling complex organizational systems, implementing validation pipelines and automated testing that ensured reproducibility across large-scale simulations.",
      "Automated research workflows that accelerated data-driven insight generation for firm behavior analysis, translating quantitative research into actionable recommendations for reskilling strategies.",
      "Collaborated with interdisciplinary teams to transform economic theories into scalable ML applications, ensuring research objectives align with practical business applications."
    ],
    skills: ["Python", "XGBoost", "NLP", "Clustering", "Mathematical Modeling", "Research Automation"],
    logo: "harvard-logo.png"
  },
  {
    role: "Data Scientist",
    company: "Ipsos",
    period: "Feb 2024 - Jan 2025",
    location: "Bogotá D.C., Colombia (Hybrid)",
    description:
      "Engineered production-ready applications for geospatial analysis and segmentation using ML models and robust data-processing pipelines on Google Cloud Platform, enhancing operational efficiency across multiple data sources.",
    responsibilities: [
      "Led the design and implementation of TextInsight, a Python library for automated multilingual text analysis using LLMs and advanced NetworkX visualizations, reducing text processing time from hours to minutes and earning Total Ops Star Employee recognition across LATAM regions.",
      "Streamlined analytical workflows through automated Python pipelines, significantly reducing manual processing while enabling dynamic real-time reporting and cross-functional analytics.",
      "Integrated scalable cloud workflows with advanced data management systems, supporting large-scale batch processing and reproducible research methodologies."
    ],
    skills: ["Python", "Google Cloud Platform", "TextInsight", "Geospatial Analysis", "NLP", "Data Pipelines"],
    logo: "ipsos-logo.jpg"
  }
];

  
  // Education data
  const education = [
    {
      degree: "M.S. in Artificial Intelligence (In Progress)",
      institution: "Universidad de los Andes",
      period: "Jan 2026 - Nov 2027",
      location: "Bogotá D.C.",
      focus: "Reinforcement Learning",
      logo: "uniandes-logo.png"
    },
    {
      degree: "B.S. in Computer Science",
      institution: "Universidad Nacional de Colombia",
      period: "Feb 2019 - Nov 2023",
      location: "Bogotá D.C.",
      focus: "Machine Learning",
      gpa: "4.7/5.0",
      certificateLink: "https://drive.google.com/file/d/1bp6QKeEqpOeCBIBKsst0IwQpr48nmjoi/view?usp=sharing",
      logo: "unal-logo.png"
    },
    {
      degree: "B.S. in Mathematics",
      institution: "Universidad Nacional de Colombia",
      period: "Feb 2018 - Jun 2022",
      location: "Bogotá D.C.",
      focus: "Applied Mathematics",
      gpa: "4.7/5.0",
      certificateLink: "https://drive.google.com/file/d/1RW4Q3Kca8rfMUJpejdwlmtTTiA5YgYwU/view?usp=sharing",
      logo: "unal-logo.png"
    }
  ];
  
  // Courses/Training data
const courses = [
  {
    title: "Deep Learning Specialization",
    provider: "DeepLearning.AI",
    date: "January 2026",
    description: "Five-course specialization covering neural networks, hyperparameter tuning, convolutional and recurrent networks, and sequence models for deep learning applications.",
    certificateLink: "https://www.coursera.org/account/accomplishments/specialization/CNQ1BJKHIT2D",
    certificateId: "CNQ1BJKHIT2D",
    topics: ["Deep Learning", "Neural Networks", "CNNs", "RNNs"],
    logo: "deeplearningai-logo.png"
  },
  {
    title: "Machine Learning Specialization",
    provider: "DeepLearning.AI",
    date: "January 2026",
    description: "Three-course specialization covering supervised and unsupervised learning, recommender systems, and reinforcement learning with practical implementations.",
    certificateLink: "https://www.coursera.org/account/accomplishments/specialization/L7YEEUW8IR5X",
    certificateId: "L7YEEUW8IR5X",
    topics: ["Machine Learning", "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"],
    logo: "deeplearningai-logo.png"
  },
  {
    title: "AI Engineer for Developers Associate",
    provider: "DataCamp",
    date: "July 2025",
    description: "Advanced certification in AI engineering for developers, focusing on large language models and retrieval-augmented generation systems.",
    certificateLink: "https://www.datacamp.com/certificate/AIEDA0019827293059",
    certificateId: "AIEDA0019827293059",
    topics: ["LLM Engineering", "RAG Systems", "AI Development"],
    logo: "datacamp-logo.png"
  },
  {
    title: "Artificial Intelligence Expert Certificate (CAIEC)",
    provider: "Certiprof",
    date: "November 2024",
    description: "Advanced-level certification focusing on artificial intelligence concepts, methodologies, and best practices.",
    certificateLink: "https://www.credly.com/badges/TLZVDQTVTGG-XWHHHQPTQ-RDJFLDLRK",
    certificateId: "TLZVDQTVTGG-XWHHHQPTQ-RDJFLDLRK",
    topics: ["AI", "Neural Networks", "Machine Learning"],
    logo: "certiprof-partner-logo.webp"
  },
  {
    title: "DevOps Certification",
    provider: "Platzi",
    date: "October 2024",
    description: "Program covering Docker, Swarm, GitHub Actions, GitLab, Jenkins, Azure DevOps, and MLOps practices for continuous integration and deployment.",
    certificateLink: "https://platzi.com/p/larajuan/learning-path/8353-cloud-devops/diploma/detalle/",
    certificateId: "cc4cfe8a-d78a-4883-8a75-ca90931151f6",
    topics: ["Docker", "GitHub Actions", "MLOps"],
    logo: "platzi-logo.png"
  },
  {
    title: "Artificial Intelligence Bootcamp",
    provider: "Talento Tech Cymetria",
    date: "May-October 2024",
    duration: "159 hours",
    description: "Intensive training in AI and machine learning, covering cutting-edge algorithms and deep learning model construction.",
    certificateLink: "https://certificados.talentotech.co/?cert=2518458921#pdf",
    certificateId: "2518458921",
    topics: ["Deep Learning", "Neural Networks", "PyTorch"],
    logo: "cymetria-logo.png"
  }
];
  
  return (
    <>
      <SEO
        title="About | Juan Lara"
        description="AI Engineer with a research mindset — building LLM systems, NLP pipelines, and production ML across research, healthcare, and enterprise domains. CS + Mathematics dual degree, M.S. AI candidate at Universidad de los Andes."
        canonical="https://juanlara18.github.io/portfolio/#/about"
        keywords={[
          'Juan Lara',
          'Computer Science',
          'Mathematics',
          'AI Engineer',
          'LLM Systems',
          'NLP',
          'RAG',
          'Production ML',
          'Applied Research',
          'GenAI'
        ]}
      />
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      
      {/* Hero Section */}
      <div className="pt-8 pb-12 sm:pt-16 sm:pb-20 flex flex-col relative overflow-hidden">
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative flex-1 flex items-center justify-center pt-0"
        >
        {/* Enhanced background with multiple layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-50/80 to-white dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-900 -z-10"></div>
        
        {/* Animated decorative elements */}
        <motion.div 
          className="absolute top-20 right-0 w-80 h-80 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl -z-10"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.6, 0.5]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute -bottom-10 left-10 w-96 h-96 rounded-full bg-indigo-100/40 dark:bg-indigo-900/20 blur-3xl -z-10"
          animate={{ 
            scale: [1, 0.95, 1],
            opacity: [0.4, 0.5, 0.4]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        ></motion.div>
        
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-green-100/30 dark:bg-green-900/10 blur-2xl -z-10"
          animate={{ 
            y: [-10, 10, -10],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-xl -z-10"
          animate={{ 
            y: [5, -5, 5],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        ></motion.div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-grid-pattern -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12"
          >
            {/* Profile Image */}
            <motion.div 
              variants={fadeInRight}
              className="w-40 h-48 sm:w-48 sm:h-56 md:w-56 md:h-72 flex-shrink-0 mx-auto md:mx-0"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                <OptimizedImage 
                  src="/images/Profile.jpeg" 
                  alt="Juan Lara"
                  className="object-cover w-full h-full"
                  eager={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </motion.div>

            {/* Content Column */}
            <motion.div 
              variants={fadeInRight}
              className="flex-1 text-center md:text-left"
            >
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-4">
                <Code size={14} className="mr-2" /> About Me
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-2 leading-tight text-gray-900 dark:text-white tracking-tight">
                Juan Lara
              </h1>
              
              <h2 className="text-lg sm:text-xl md:text-2xl text-blue-600 dark:text-blue-400 font-medium mb-4">
                Computer Scientist · Mathematician · AI Researcher
              </h2>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                <p>
                  <span className="font-medium text-gray-900 dark:text-gray-100">AI Engineer</span> with 3+ years building production AI systems across research, healthcare, and enterprise domains. Focused on LLM systems, NLP, and taking ML from concept to deployment — with experience spanning <span className="font-medium text-indigo-600 dark:text-indigo-400">Harvard University</span>, <span className="font-medium text-indigo-600 dark:text-indigo-400">GenomAI</span>, and <span className="font-medium text-blue-600 dark:text-blue-400">Falabella</span>.
                </p>

                <AnimatePresence>
                  {bioExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pt-2">
                        Specializing in LLM fine-tuning, RAG architectures, NLP pipelines, and production ML systems on cloud infrastructure. Currently pursuing an M.S. in Artificial Intelligence at Universidad de los Andes, combining a dual foundation in Computer Science and Mathematics (4.7/5.0) with a drive to push AI research into real-world applications.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium cursor-pointer inline-flex items-center mx-auto md:mx-0"
                >
                  {bioExpanded ? 'Show less \u2191' : 'Read more \u2193'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        </motion.section>
      </div>
      
      {/* Skills Section */}
      <section className="pt-8 pb-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="w-full mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200"
            >
              Technical Proficiency
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="italic text-center mb-10 text-gray-600 dark:text-gray-400"
            >
              The core technologies and frameworks driving my production-grade AI systems
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {/* Generative AI & NLP */}
              <div className="bg-white dark:bg-gray-900 p-4 xl:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-[15px] xl:text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center whitespace-nowrap tracking-tight">
                  <BrainCircuit className="mr-2 text-blue-500 flex-shrink-0" size={18} />
                  Generative AI & NLP
                </h3>
                {/* Use grid-cols-1 to ensure text never wraps to two lines, even on small screens */}
                <div className="grid grid-cols-1 gap-3">
                  <SkillItem
                    name="RAG Architectures"
                    icon={Database}
                    color="blue"
                  />
                  <SkillItem
                    name="LLM Fine-Tuning & PEFT"
                    icon={Code}
                    color="indigo"
                  />
                  <SkillItem
                    name="Agentic Workflows"
                    icon={Layers}
                    color="green"
                  />
                  <SkillItem
                    name="Advanced NLP Pipelines"
                    icon={BrainCircuit}
                    color="purple"
                  />
                </div>
              </div>

              {/* ML Engineering & MLOps */}
              <div className="bg-white dark:bg-gray-900 p-4 xl:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-[15px] xl:text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center whitespace-nowrap tracking-tight">
                  <Server className="mr-2 text-purple-500 flex-shrink-0" size={18} />
                  Production ML & MLOps
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <SkillItem
                    name="Model Serving & Endpoints"
                    icon={Globe}
                    color="purple"
                  />
                  <SkillItem
                    name="CI/CD & Deployment"
                    icon={Github}
                    color="red"
                  />
                  <SkillItem
                    name="Scalable System Architecture"
                    icon={Box}
                    color="orange"
                  />
                  <SkillItem
                    name="Model Drift & Monitoring"
                    icon={LineChart}
                    color="teal"
                  />
                </div>
              </div>

              {/* Cloud & Data Engineering */}
              <div className="bg-white dark:bg-gray-900 p-4 xl:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-[15px] xl:text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center whitespace-nowrap tracking-tight">
                  <Cloud className="mr-2 text-teal-500 flex-shrink-0" size={18} />
                  Cloud & Data Engineering
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <SkillItem
                    name="GCP & AWS"
                    icon={Cloud}
                    color="teal"
                  />
                  <SkillItem
                    name="Distributed Computing"
                    icon={Layers}
                    color="indigo"
                  />
                  <SkillItem
                    name="Containerization (Docker)"
                    icon={Box}
                    color="yellow"
                  />
                  <SkillItem
                    name="ETL & Data Pipelines"
                    icon={Database}
                    color="blue"
                  />
                </div>
              </div>

              {/* Core ML & Research */}
              <div className="bg-white dark:bg-gray-900 p-4 xl:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-[15px] xl:text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center whitespace-nowrap tracking-tight">
                  <Code className="mr-2 text-green-500 flex-shrink-0" size={18} />
                  Core ML & Research
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <SkillItem
                    name="Deep Learning Foundations"
                    icon={BrainCircuit}
                    color="blue"
                  />
                  <SkillItem
                    name="Mathematical Modeling"
                    icon={BarChart}
                    color="green"
                  />
                  <SkillItem
                    name="Predictive Analytics"
                    icon={LineChart}
                    color="purple"
                  />
                  <SkillItem
                    name="Reinforcement Learning"
                    icon={Cpu}
                    color="red"
                  />
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      
      {/* Unified Professional Section (Grid Layout) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12">
            
            {/* Left Column: Experience */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-12">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="flex items-center mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 shadow-sm">
                    <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Professional Experience</h2>
                </motion.div>
                
                <div className="relative">
                  {/* Subtle timeline line for desktop */}
                  <div className="absolute left-[3.5rem] top-8 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-100 to-transparent dark:from-blue-800 dark:via-blue-900/50 dark:to-transparent z-0 hidden md:block"></div>
                  
                  <div className="relative z-10 space-y-8">
                    {experiences.map((exp, index) => (
                      <ExperienceCard 
                        key={index} 
                        {...exp} 
                        isExpanded={expandedExperienceId === index}
                        onToggle={() => setExpandedExperienceId(expandedExperienceId === index ? null : index)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Education, Awards, Languages */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-12">
              
              {/* Education */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4 shadow-sm">
                    <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Education</h2>
                </motion.div>
                
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <EducationCard key={index} {...edu} />
                  ))}
                </div>
              </motion.div>

              {/* Awards */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-4 shadow-sm">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Awards & Recognition</h2>
                </motion.div>
                
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                    <div className="flex items-start">
                      <Award className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">Total Ops Star Employee - LATAM</h3>
                        <div className="text-[11px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">Ipsos • April 2024</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Awarded for developing TextInsight and driving technical impact across LATAM.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                    <div className="flex items-start">
                      <Award className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">Best Averages Scholarship</h3>
                        <div className="text-[11px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">Universidad Nacional de Colombia • 2018-2023</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Awarded 10 consecutive semesters for ranking in the top 15 students.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Languages */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mr-4 shadow-sm">
                    <Globe className="text-teal-600 dark:text-teal-400" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Languages</h2>
                </motion.div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex-shrink-0 flex items-center justify-center">
                        <span className="text-base font-bold text-teal-700 dark:text-teal-400">ES</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Spanish</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400">Native</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex-shrink-0 flex items-center justify-center">
                        <span className="text-base font-bold text-teal-700 dark:text-teal-400">EN</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">English</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400">Advanced</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Additional Training Section (Full Width) */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center mb-10">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4 shadow-sm">
                <BookOpen className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Additional Training</h2>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {courses.map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
    </div>
    </>
  );
}