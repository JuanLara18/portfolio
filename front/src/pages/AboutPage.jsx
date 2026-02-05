import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
  Box
} from 'lucide-react';
import { HoverMotion } from '../components/layout';
import { ScrollIndicator, OptimizedImage } from '../components/ui';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const fadeInRight = motionVariants.fadeInRight();
const fadeInLeft = motionVariants.fadeInLeft();
const staggerContainer = motionVariants.stagger();

// Skill component with animated progress bar
const SkillBar = ({ name, level, icon: Icon, color = "blue" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Convert level (0-5) to percentage
  const percentage = (level / 5) * 100;
  
  // Color mappings for different UI elements
  const colorClasses = {
    blue: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconText: "text-blue-600 dark:text-blue-400",
      progressBar: "bg-blue-600 dark:bg-blue-500"
    },
    indigo: {
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconText: "text-indigo-600 dark:text-indigo-400",
      progressBar: "bg-indigo-600 dark:bg-indigo-500"
    },
    green: {
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconText: "text-green-600 dark:text-green-400",
      progressBar: "bg-green-600 dark:bg-green-500"
    },
    red: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconText: "text-red-600 dark:text-red-400",
      progressBar: "bg-red-600 dark:bg-red-500"
    },
    yellow: {
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconText: "text-yellow-600 dark:text-yellow-400",
      progressBar: "bg-yellow-600 dark:bg-yellow-500"
    },
    teal: {
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      iconText: "text-teal-600 dark:text-teal-400",
      progressBar: "bg-teal-600 dark:bg-teal-500"
    },
    orange: {
      iconBg: "bg-orange-100 dark:bg-orange-900/30", 
      iconText: "text-orange-600 dark:text-orange-400",
      progressBar: "bg-orange-600 dark:bg-orange-500"
    },
    purple: {
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconText: "text-purple-600 dark:text-purple-400",
      progressBar: "bg-purple-600 dark:bg-purple-500"
    }
  };
  
  // Get color classes or fallback to blue if color is not in our mapping
  const classes = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className="mb-6" ref={ref}>
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 rounded-md ${classes.iconBg} flex items-center justify-center mr-3`}>
          <Icon size={18} className={classes.iconText} />
        </div>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{name}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${classes.progressBar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${percentage}%` : 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
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
  logo 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10 border border-gray-100 dark:border-gray-700 relative overflow-hidden group mobile-card-large"
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
        
        {responsibilities && (
          <div className="mb-4">
            <h4 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold mb-2 mobile-card-subtitle">Key Responsibilities</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {responsibilities.map((item, index) => (
                <li key={index} className="leading-relaxed">{item}</li>
              ))}
            </ul>
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden mobile-card-large"
    >
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50/50 dark:bg-blue-900/10 rounded-full -ml-20 -mb-20 z-0"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
          <div className="w-28 h-20 md:w-32 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white p-2 shadow-md flex items-center justify-center">
            <OptimizedImage 
              src={`/images/institutions/${logo}`} 
              alt={`${institution} institutional logo`}
              objectFit="contain"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mobile-card-title">{degree}</h3>
            <div className="text-lg text-blue-600 dark:text-blue-400">{institution}</div>
            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 mt-1 gap-2">
              <span>{period}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span>{location}</span>
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mobile-card-title">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">{provider}</div>
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
        
        {description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 card-description">{description}</p>
        )}
        
        {topics && topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {topics.map((topic, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
        
        {certificateLink && (
          <div className="mt-auto pt-2">
            <a 
              href={certificateLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm hover:underline gap-1 group"
            >
              <span>Verify Certificate {certificateId && `(ID: ${certificateId})`}</span>
              <ExternalLink size={12} className="transform group-hover:translate-x-1 transition-transform duration-150" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function AboutPage() {
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
      "Develop computer vision and deep learning solutions for real-time operational monitoring, managing the full ML lifecycle from data collection and model training to production deployment preparation on GCP infrastructure.",
    responsibilities: [
      "Build data processing pipelines integrating OCR engines, anomaly detection models, and cloud data warehouses, enabling automated extraction and quality validation across large-scale operational datasets.",
      "Design ML system integrations connecting modern AI capabilities with legacy enterprise platforms, implementing scalable data flows that bridge existing infrastructure with production-ready machine learning services.",
      "Architect end-to-end solutions for logistics optimization using computer vision and deep learning techniques on Google Cloud Platform."
    ],
    skills: ["Computer Vision", "Deep Learning", "GCP", "OCR", "Anomaly Detection", "Data Pipelines"],
    logo: "falabella-logo.png"
  },
  {
    role: "LLM/ML Specialist",
    company: "GenomAI",
    period: "June 2025 - December 2025",
    location: "Danville, USA (Remote)",
    description:
      "Architected AI-powered clinical decision support systems integrating RAG pipelines with vector databases and LLM fine-tuning techniques to deliver real-time, evidence-based treatment recommendations for healthcare professionals.",
    responsibilities: [
      "Developed HIPAA-compliant generative AI solutions using advanced prompt engineering and retrieval-augmented generation to process multimodal medical data while ensuring regulatory compliance and patient privacy protection.",
      "Built and optimized ML deployment pipelines with Docker containerization and CI/CD automation, implementing scalable cloud infrastructure that supports production healthcare applications with sub-second response requirements.",
      "Led cross-functional collaboration with clinical teams to translate complex medical workflows into scalable AI architectures that enhance diagnostic accuracy and treatment personalization."
    ],
    skills: ["LLM Fine-tuning", "RAG Systems", "Vector Databases", "HIPAA Compliance", "Healthcare AI", "Docker"],
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
    title: "Curso de LangChain",
    provider: "Platzi",
    date: "July 2025",
    description: "Comprehensive training on LangChain framework for building applications with large language models and AI agents.",
    certificateLink: "https://platzi.com/p/larajuan/curso/dd0e8538-8e8f-4ed9-acae-5192ba8faf18",
    certificateId: "dd0e8538-8e8f-4ed9-acae-5192ba8faf18",
    topics: ["LangChain", "LLM Applications", "AI Agents"],
    logo: "platzi-logo.png"
  },
  {
    title: "Curso de NLP con Python",
    provider: "Platzi",
    date: "July 2025",
    description: "Training on natural language processing with Python, covering transformers and modern NLP techniques.",
    certificateLink: "https://platzi.com/p/larajuan/curso/520eb925-05d2-4298-ae08-187d5a2bae0a",
    certificateId: "520eb925-05d2-4298-ae08-187d5a2bae0a",
    topics: ["NLP", "Python", "Transformers"],
    logo: "platzi-logo.png"
  },
  {
    title: "Fundamentals of MCP",
    provider: "Hugging Face",
    date: "May 2025",
    description: "Training on Model Customization and Production fundamentals using Hugging Face tools and frameworks.",
    certificateLink: "https://huggingface.co/datasets/mcp-course/certificates/resolve/main/certificates/juanlara/2025-05-01.png",
    certificateId: "juanlara",
    topics: ["Model Customization", "Production ML", "Hugging Face"],
    logo: "hugging_face-logo.png"
  },
  {
    title: "Bases de datos SQL",
    provider: "Platzi",
    date: "April 2025",
    description: "Training on SQL database fundamentals and practical implementation.",
    certificateLink: "https://platzi.com/p/larajuan/learning-path/13458-datos-sql/diploma/detalle/",
    certificateId: "539844d2-3b5e-43e9-ae00-d68331327f26",
    topics: ["SQL", "Database Design", "Data Management"],
    logo: "platzi-logo.png"
  },
  {
    title: "Artificial Intelligence Professional Certificate (CAIPC)",
    provider: "Certiprof",
    date: "November 2024",
    description: "Professional-level certification in artificial intelligence covering machine learning and practical AI applications.",
    certificateLink: "https://www.credly.com/badges/JLRKFTTLUSP-WTHHHBBCH-YQSTJTBBBR",
    certificateId: "JLRKFTTLUSP-WTHHHBBCH-YQSTJTBBBR",
    topics: ["AI", "Machine Learning", "Professional Certification"],
    logo: "certiprof_CAIPC-logo.png"
  },
    {
      title: "AI Agents Fundamentals",
      provider: "Hugging Face",
      date: "February 2025",
      description: "Training on foundational concepts and practical implementation of AI agents using Hugging Face tools and frameworks.",
      certificateLink: "https://huggingface.co/datasets/agents-course/certificates/resolve/main/certificates/juanlara/2025-02-19.png",
      certificateId: "juanlara",
      topics: ["AI Agents", "Multi-agent Systems", "Transformers"],
      logo: "hugging_face-logo.png"
    },
    {
      title: "Artificial Intelligence Expert Certificate (CAIEC)",
      provider: "Certiprof",
      date: "November 2024",
      description: "Advanced-level certification focusing on artificial intelligence concepts, methodologies, and best practices.",
      certificateLink: "https://www.credly.com/badges/TLZVDQTVTGG-XWHHHQPTQ-RDJFLDLRK",
      certificateId: "TLZVDQTVTGG-XWHHHQPTQ-RDJFLDLRK",
      topics: ["AI", "Neural Networks", "Machine Learning"],
      logo: "certiprof_CAIEC-logo.png"
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
      title: "Algorithmic Toolbox",
      provider: "Coursera",
      date: "2023",
      description: "Course focused on algorithm design and implementation techniques for solving computational problems efficiently.",
      certificateLink: "https://www.coursera.org/account/accomplishments/certificate/8GR62BCT499V",
      certificateId: "8GR62BCT499V",
      topics: ["Algorithms", "Data Structures", "Problem Solving"],
      logo: "coursera-logo.png"
    },
    {
      title: "Linux and Bash for Data Engineering",
      provider: "Coursera",
      date: "2023",
      description: "Practical course on Linux systems administration and Bash scripting for data engineering workflows.",
      certificateLink: "https://www.coursera.org/account/accomplishments/certificate/CAZUJPW6D4BP",
      certificateId: "CAZUJPW6D4BP",
      topics: ["Linux", "Bash", "Automation"],
      logo: "coursera-logo.png"
    },
    {
      title: "Python and Pandas for Data Engineering",
      provider: "Coursera",
      date: "2023",
      description: "In-depth training on Python programming and Pandas library for data manipulation and analysis in data engineering contexts.",
      certificateLink: "https://www.coursera.org/account/accomplishments/certificate/72QS5JSBC67L",
      certificateId: "72QS5JSBC67L",
      topics: ["Python", "Pandas", "Data Analysis"],
      logo: "coursera-logo.png"
    }
  ];
  
  return (
    <>
      <SEO
        title="About | Juan Lara"
        description="AI & ML Engineer with 3+ years building production AI systems. Currently at Falabella developing computer vision solutions. M.S. in AI candidate at Universidad de los Andes."
        canonical="https://juanlara18.github.io/Portfolio/#/about"
        keywords={[
          'Juan Lara',
          'Computer Science',
          'Mathematics',
          'AI Engineer',
          'Falabella',
          'Computer Vision',
          'Machine Learning',
          'Deep Learning',
          'MLOps',
          'GCP'
        ]}
      />
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      
      {/* Hero Section + Scroll Indicator Container */}
      <div className="h-[calc(100dvh-5.5rem)] flex flex-col">
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="hero-section relative flex-1 flex items-center justify-center overflow-hidden pt-0"
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
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 sm:gap-4 lg:gap-6 mb-0">
            {/* Content Column */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:w-3/5 text-center lg:text-left"
            >
              {/* Enhanced badge */}
              <motion.div variants={fadeInRight} className="mb-3">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 text-sm font-medium backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30 shadow-sm touch-target">
                  <Code size={14} className="mr-2" /> About Me
                </div>
              </motion.div>
              
              {/* Enhanced name heading with animated underline */}
              <motion.div variants={fadeInRight} className="relative mb-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400">
                    Juan Lara
                  </span>
                </h1>
                <motion.div 
                  className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full mx-auto lg:mx-0"
                  animate={{ 
                    width: ["0%", "18%", "16%"],
                    opacity: [0, 1, 0.9]
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: 0.5 
                  }}
                />
              </motion.div>
              
              {/* Enhanced subtitle with better styling */}
              <motion.h2 
                variants={fadeInRight}
                className="text-lg xs:text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-200 mb-3 xs:mb-4 font-medium"
              >
                Computer Scientist & Mathematician
              </motion.h2>
              
              {/* Content paragraphs with enhanced styling */}
              <motion.div 
                variants={fadeInRight}
                className="space-y-2 xs:space-y-3 text-sm xs:text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl"
              >
                <p className="text-sm xs:text-base sm:text-lg">
                  <span className="font-medium text-blue-600 dark:text-blue-400">AI & ML Engineer</span> with 3+ years building production AI systems across healthcare, retail, and research domains. Currently developing computer vision and deep learning solutions at <span className="font-medium text-blue-600 dark:text-blue-400">Falabella</span>, with previous experience at <span className="font-medium text-indigo-600 dark:text-indigo-400">GenomAI</span> and <span className="font-medium text-indigo-600 dark:text-indigo-400">Harvard University</span>.
                </p>

                <div className="py-1 border-l-2 border-blue-500/30 dark:border-blue-700/50 pl-4">
                  <p>
                    Specializing in the complete AI engineering stack: computer vision, anomaly detection, LLM fine-tuning, RAG architectures, and cloud deployment on GCP. Currently pursuing an M.S. in Artificial Intelligence at Universidad de los Andes to deepen expertise in reinforcement learning and advanced AI systems.
                  </p>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Enhanced profile card with better proportions and mobile optimization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-2/5 flex justify-center lg:justify-end px-4 sm:px-0"
            >
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-none">
                {/* Modern profile card with mobile-optimized dimensions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm mobile-card-optimized">
                  {/* Profile image - responsive sizing */}
                  <div className="relative w-36 h-36 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto mb-4 sm:mb-6">
                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-2 sm:border-4 border-white dark:border-gray-600 shadow-xl">
                      <OptimizedImage 
                        src="/images/Profile.jpeg" 
                        alt="Juan Lara - Computer Scientist and Mathematician"
                        eager={true}
                      />
                      {/* Subtle professional overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/5 via-transparent to-transparent dark:from-blue-900/10"></div>
                    </div>
                    {/* Professional status indicator - smaller on mobile */}
                    <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-500 border-2 sm:border-4 border-white dark:border-gray-800 rounded-full shadow-lg">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Professional information - mobile optimized */}
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">Juan Lara</h3>
                      <p className="text-base sm:text-lg text-blue-600 dark:text-blue-400 font-semibold mb-1">AI Engineer</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Falabella</p>
                    </div>
                    
                    {/* Status badge - responsive sizing */}
                    <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium rounded-full border border-green-200 dark:border-green-800/50">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                      Available for projects
                    </div>
                    
                    {/* Quick stats - mobile optimized */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">3+</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Years Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">16+</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        </motion.section>
        
        {/* Scroll indicator */}
        <ScrollIndicator 
          fadeOutStart={0} 
          fadeOutEnd={300}
          className="hidden sm:flex flex-shrink-0"
        />
      </div>
      
      {/* Skills Section */}
      <section className="pt-8 pb-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
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
              className="grid gap-x-8 gap-y-8 lg:grid-cols-2"
            >
              {/* LLM & RAG Systems */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  LLM & RAG Systems
                </h3>
                <SkillBar
                  name="Large Language Models"
                  level={4.5}
                  icon={BrainCircuit}
                  color="blue"
                />
                <SkillBar
                  name="RAG & Vector Databases"
                  level={4.5}
                  icon={Database}
                  color="green"
                />
                <SkillBar
                  name="PEFT & Fine-tuning"
                  level={4}
                  icon={Code}
                  color="indigo"
                />
              </div>

              {/* ML Engineering & MLOps */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  ML Engineering & MLOps
                </h3>
                <SkillBar
                  name="ML Frameworks"
                  level={4.3}
                  icon={Terminal}
                  color="purple"
                />
                <SkillBar
                  name="Model Deployment"
                  level={3.9}
                  icon={Server}
                  color="red"
                />
                <SkillBar
                  name="CI/CD & Automation"
                  level={3.8}
                  icon={Github}
                  color="orange"
                />
              </div>

              {/* Cloud & Infrastructure */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Cloud & Infrastructure
                </h3>
                <SkillBar
                  name="Cloud Platforms"
                  level={4}
                  icon={Cloud}
                  color="teal"
                />
                <SkillBar
                  name="Container Orchestration"
                  level={3.5}
                  icon={Box}
                  color="yellow"
                />
                <SkillBar
                  name="Distributed Systems"
                  level={3.3}
                  icon={Layers}
                  color="indigo"
                />
              </div>

              {/* Development & Applications */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Development & Applications
                </h3>
                <SkillBar
                  name="Python & SQL"
                  level={4.7}
                  icon={Code}
                  color="blue"
                />
                <SkillBar
                  name="API Development"
                  level={4.2}
                  icon={Globe}
                  color="green"
                />
                <SkillBar
                  name="Data Visualization"
                  level={3.9}
                  icon={BarChart}
                  color="purple"
                />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      
      {/* Experience Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center mb-10"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4">
                <Briefcase className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Professional Experience</h2>
            </motion.div>
            
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200 dark:bg-blue-800 z-0 hidden lg:block"></div>
              
              <div className="relative z-10">
                {experiences.map((exp, index) => (
                  <ExperienceCard key={index} {...exp} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Education Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center mb-10"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4">
                <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Education</h2>
            </motion.div>
            
            <div>
              {education.map((edu, index) => (
                <EducationCard key={index} {...edu} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Awards & Recognition Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center mb-10"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-4">
                <Award className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Awards & Recognition</h2>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0 flex items-center justify-center mr-4">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Total Ops Star Employee - LATAM</h3>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Ipsos • April 2024</div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Recognized for developing TextInsight, demonstrating exceptional initiative, technical expertise, and commitment to operational excellence across Latin American operations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0 flex items-center justify-center mr-4">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Best Averages Scholarship</h3>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Universidad Nacional de Colombia • 2018-2023</div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Awarded for 10 consecutive semesters to the top 15 students with highest academic performance in the program, maintaining excellence throughout my academic career.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Courses & Certifications Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center mb-10"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                <BookOpen className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Additional Training</h2>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            >
              {courses.map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Languages Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center mb-10"
            >
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mr-4">
                <Globe className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Languages</h2>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">ES</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Spanish</h3>
                    <p className="text-teal-600 dark:text-teal-400">Native</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">EN</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">English</h3>
                    <p className="text-teal-600 dark:text-teal-400">Advanced</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-900 dark:bg-gray-950">
        <div className="container mx-auto px-6 mobile-card-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Let's Work Together
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Open to discussing innovative projects, research collaborations, and the frontiers of AI engineering. If you're looking for an AI Engineer with expertise in computer vision, deep learning, and production ML systems, let's connect!
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a 
                href="mailto:larajuand@outlook.com"
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg"
              >
                <Mail size={18} />
                <span>Contact Me</span>
              </a>
              
              <a 
                href={`${process.env.PUBLIC_URL}/documents/CV___EN.pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium shadow-lg"
              >
                <svg 
                  className="w-5 h-5" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                </svg>
                <span>Download Resume</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
    </div>
    </>
  );
}