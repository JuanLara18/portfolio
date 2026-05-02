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
import { OptimizedImage } from '../components/ui';
import { STRAP_LINE } from '../data/brand';

// Animation variants
const fadeInUp = motionVariants.fadeInUp();
const fadeInRight = motionVariants.fadeInRight();
const fadeInLeft = motionVariants.fadeInLeft();
const staggerContainer = motionVariants.stagger();

// Skill component — editorial: clean list line, no pill/border/bg.
const SkillItem = ({ name, icon: Icon }) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-cyan-700 dark:text-brand-accent flex-shrink-0" />
      <span className="text-sm text-gray-700 dark:text-brand-fg-muted">{name}</span>
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
      className="py-10 border-b border-gray-200/60 dark:border-white/[0.08] last:border-b-0"
    >
      <div className="flex items-start gap-5 mb-4">
        <div className="w-24 h-16 sm:w-28 sm:h-20 md:w-32 md:h-20 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white dark:bg-white/95 p-2 sm:p-3 rounded-sm">
          <OptimizedImage
            src={`/images/company-logos/${logo}`}
            alt={`${company} company logo`}
            objectFit="contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-2xl tracking-tight text-gray-900 dark:text-brand-fg leading-tight mb-1">{role}</h3>
          <div className="font-mono text-sm tracking-wide text-cyan-700 dark:text-brand-accent mb-1">{company}</div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-brand-fg-muted">
            {period} <span className="mx-1.5 opacity-60">|</span> {location}
          </div>
        </div>
      </div>

      <p className="text-sm sm:text-[15px] text-gray-600 dark:text-brand-fg-muted mb-4 leading-relaxed max-w-2xl">{description}</p>

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
                <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-700 dark:text-brand-accent font-semibold mb-2">Key Responsibilities</h4>
                <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm sm:text-[15px] text-gray-600 dark:text-brand-fg-muted mb-2 max-w-2xl">
                  {responsibilities.map((item, index) => (
                    <li key={index} className="leading-relaxed pl-1">{item}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggle}
            className="text-sm text-cyan-700 dark:text-brand-accent hover:text-cyan-800 dark:hover:text-brand-accent-soft transition-colors duration-200 font-medium cursor-pointer"
          >
            {expanded ? 'Show less \u2191' : 'Key responsibilities \u2193'}
          </button>
        </div>
      )}

      {skills && skills.length > 0 && (
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-gray-600 dark:text-brand-fg/70 mt-4 leading-relaxed">
          {skills.join(' \u00b7 ')}
        </p>
      )}
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
      className="py-8 border-b border-gray-200/60 dark:border-white/[0.08] last:border-b-0"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="w-16 h-12 sm:w-20 sm:h-14 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white dark:bg-white/95 p-1.5 sm:p-2 rounded-sm">
          <OptimizedImage
            src={`/images/institutions/${logo}`}
            alt={`${institution} institutional logo`}
            objectFit="contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg tracking-tight text-gray-900 dark:text-brand-fg leading-tight mb-0.5">{degree}</h3>
          <div className="font-mono text-sm tracking-wide text-cyan-700 dark:text-brand-accent leading-tight">{institution}</div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-brand-fg-muted mt-1">
            {period} <span className="mx-1 opacity-60">·</span> {location}
          </div>
        </div>
      </div>

      {(focus || gpa) && (
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-600 dark:text-brand-fg/70 mb-3">
          {focus && <span>Focus <span className="opacity-60">·</span> {focus}</span>}
          {focus && gpa && <span className="mx-3 opacity-40">|</span>}
          {gpa && <span>GPA <span className="opacity-60">·</span> {gpa}</span>}
        </p>
      )}

      {certificateLink && (
        <a
          href={certificateLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm text-cyan-700 dark:text-brand-accent hover:text-cyan-800 dark:hover:text-brand-accent-soft hover:underline gap-1 group transition-colors"
        >
          <span>View Certificate</span>
          <ExternalLink size={13} className="transform group-hover:translate-x-1 transition-transform duration-150" />
        </a>
      )}
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
      className="py-6 h-full flex flex-col"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="w-20 h-14 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white dark:bg-white/95 p-2 rounded-sm">
          <OptimizedImage
            src={`/images/institutions/${logo}`}
            alt={`${provider} training provider logo`}
            objectFit="contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base tracking-tight text-gray-900 dark:text-brand-fg leading-snug">{title}</h3>
          <div className="font-mono text-sm tracking-wide text-cyan-700 dark:text-brand-accent mt-0.5">{provider}</div>
        </div>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-brand-fg-muted mb-3">
        {date}{duration && <> <span className="mx-1 opacity-60">·</span> {duration}</>}
      </p>

      {certificateLink && (
        <div className="mt-auto pt-2">
          <a
            href={certificateLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-cyan-700 dark:text-brand-accent hover:text-cyan-800 dark:hover:text-brand-accent-soft text-sm hover:underline gap-1 group transition-colors"
          >
            <span>Verify Certificate</span>
            <ExternalLink size={12} className="transform group-hover:translate-x-1 transition-transform duration-150" />
          </a>
        </div>
      )}
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
    role: "Knowledge Data Engineer | AI First",
    company: "Davivienda",
    period: "April 2026 - Present",
    location: "Bogotá D.C., Colombia",
    description:
      "Building enterprise knowledge and data foundations for an AI-first strategy. Connecting trusted information, metadata, and retrieval-ready datasets with the pipelines and governance patterns that power search, analytics, and generative AI across the organization.",
    responsibilities: [
      "Designing knowledge and data architectures and reusable data products that support semantic discovery, retrieval workflows, and downstream ML and analytics use cases.",
      "Engineering robust ingestion, quality, and documentation practices so knowledge assets and operational data remain fit for AI-driven products and compliance expectations.",
      "Collaborating with product, data, and AI teams to align roadmaps on metadata, access patterns, and scalable delivery as initiatives take shape."
    ],
    skills: ["Knowledge Engineering", "Data Engineering", "AI-First Delivery", "Data Governance", "Python", "Enterprise Search"],
    logo: "davivienda-logo.png"
  },
  {
    role: "AI Engineer",
    company: "Falabella",
    period: "November 2025 - March 2026",
    location: "Bogotá D.C., Colombia (Hybrid)",
    description:
      "Designed and deployed end-to-end ML solutions for logistics optimization at a large-scale distribution center (~4.6M SKUs), boosting OTD, OLT, and throughput.",
    responsibilities: [
      "Built predictive models for demand forecasting and pre-pack allocation, reducing lead times and supporting data-driven fulfillment decisions across the distribution network.",
      "Developed a workforce planning optimization model integrated with a multi-agent reinforcement learning environment to automate optimal staffing levels, timing, and resource allocation across distribution-center areas.",
      "Engineered an intelligent document-processing pipeline using OCR with automated ingestion into BigQuery, streamlining custody-transfer workflows and cutting manual handling overhead.",
      "Deployed real-time anomaly detection systems on Google Cloud Platform that surface operational risks through automated monitoring and reporting for logistics stakeholders."
    ],
    skills: ["Python", "Google Cloud Platform", "BigQuery", "Demand Forecasting", "MARL", "Anomaly Detection", "Document Intelligence"],
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
    logo: "ipsos-logo.png"
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
        title="About · Juan Lara"
        description="Senior AI Engineer building production AI systems at enterprise scale. RAG platforms, agentic architectures, knowledge-grounded LLM applications. Engineering experience across regulated banking, retail logistics, healthcare AI, and Harvard research."
        canonical="https://juanlara18.github.io/portfolio/#/about"
        keywords={[
          'Juan Lara',
          'Senior AI Engineer',
          'Production AI',
          'RAG',
          'Agentic Architectures',
          'Knowledge Systems',
          'LLM Ops',
          'Knowledge Data Engineer',
          'Davivienda'
        ]}
      />
      <div className="bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg min-h-screen">
      
      {/* Hero Section */}
      <div className="pt-8 pb-12 sm:pt-16 sm:pb-20 flex flex-col relative overflow-hidden">
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative flex-1 flex items-center justify-center pt-0"
        >
        {/* Background. Editorial. Single canvas, no decorative blobs. */}
        <div className="absolute inset-0 bg-gray-50 dark:bg-brand-bg -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12"
          >
            {/* Profile Image — editorial portrait, no frame, with a subtle cyan accent line */}
            <motion.div
              variants={fadeInRight}
              className="w-40 h-52 sm:w-48 sm:h-60 md:w-56 md:h-72 flex-shrink-0 mx-auto md:mx-0 relative group"
            >
              {/* Accent line: thin cyan rule offset bottom-right, peeks out from under the photo */}
              <div
                className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-full h-full border-b border-r border-cyan-700 dark:border-brand-accent pointer-events-none transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"
                aria-hidden="true"
              />
              <div className="relative w-full h-full overflow-hidden">
                <OptimizedImage
                  src="/images/Profile.jpeg"
                  alt="Juan Lara"
                  className="object-cover w-full h-full"
                  eager={true}
                />
              </div>
            </motion.div>

            {/* Content Column */}
            <motion.div 
              variants={fadeInRight}
              className="flex-1 text-center md:text-left"
            >
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-4">
                About
              </p>

              <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 leading-[0.95] text-gray-900 dark:text-brand-fg tracking-tight">
                Juan Lara.
              </h1>

              <h2 className="font-mono text-xs sm:text-sm tracking-[0.05em] text-cyan-700 dark:text-brand-accent mb-6">
                {STRAP_LINE}
              </h2>

              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                {/* Pitch. Bold opener, italic industries, colored company names. */}
                <p>
                  <span className="font-semibold text-gray-900 dark:text-white">Senior AI Engineer</span> with 5+ years building production AI across <span className="italic">banking</span>, <span className="italic">retail logistics</span>, <span className="italic">healthcare AI</span>, and <span className="italic">academic research</span>. Currently at <span className="font-semibold text-red-600 dark:text-red-400">Davivienda</span>. Previously at <span className="font-semibold text-blue-600 dark:text-blue-400">Falabella</span>, <span className="font-semibold text-emerald-600 dark:text-emerald-400">GenomAI</span>, and <span className="font-semibold text-amber-600 dark:text-amber-400">Harvard University</span>.
                </p>

                <AnimatePresence>
                  {bioExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* Focus \u2014 moved into Read more so the visible bio stays compact */}
                      <p className="pt-2">
                        My focus is the engineering layer between frontier ML research and enterprise systems. RAG and retrieval platforms. Agentic architectures. Knowledge-grounded LLM applications. The data foundations that make them reliable.
                      </p>
                      <p>
                        Three things meet in my work. Deep familiarity with the latest research. The engineering rigor required to ship under regulated and high-scale constraints. The architectural taste to know which abstractions survive contact with production.
                      </p>
                      <p>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Computer Science + Mathematics</span> dual degree, 4.7/5.0. M.Sc. in Artificial Intelligence in progress at <span className="font-medium text-gray-900 dark:text-gray-100">Universidad de los Andes</span>.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="mt-2 text-sm text-cyan-700 dark:text-brand-accent hover:text-cyan-800 dark:hover:text-brand-accent-soft transition-colors duration-200 font-medium cursor-pointer inline-flex items-center mx-auto md:mx-0"
                >
                  {bioExpanded ? 'Show less \u2191' : 'Read more \u2193'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        </motion.section>
      </div>
      
      {/* Skills Section — editorial column layout, no boxes */}
      <section className="pt-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px" }}
            variants={staggerContainer}
            className="w-full mx-auto"
          >
            <motion.p
              variants={fadeInUp}
              className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2 text-center"
            >
              Stack
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="font-bold text-2xl sm:text-3xl md:text-4xl text-center tracking-tight text-gray-900 dark:text-brand-fg mb-3"
            >
              Technical proficiency<span className="text-cyan-700 dark:text-brand-accent">.</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-center text-sm mb-12 text-gray-600 dark:text-brand-fg-muted"
            >
              The core technologies and frameworks driving my production-grade AI systems.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 gap-x-5 gap-y-8 md:gap-12 lg:grid-cols-4"
            >
              {/* Generative AI & NLP */}
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-3 pb-2.5 border-b border-purple-600/30 dark:border-purple-400/30">
                  <BrainCircuit className="flex-shrink-0" size={18} />
                  Generative AI & NLP
                </h3>
                <div className="space-y-1">
                  <SkillItem name="RAG Architectures" icon={Database} />
                  <SkillItem name="LLM Fine-Tuning & PEFT" icon={Code} />
                  <SkillItem name="Agentic Workflows" icon={Layers} />
                  <SkillItem name="Advanced NLP Pipelines" icon={BrainCircuit} />
                </div>
              </div>

              {/* ML Engineering & MLOps */}
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3 pb-2.5 border-b border-emerald-600/30 dark:border-emerald-400/30">
                  <Server className="flex-shrink-0" size={18} />
                  Production ML & MLOps
                </h3>
                <div className="space-y-1">
                  <SkillItem name="Model Serving & Endpoints" icon={Globe} />
                  <SkillItem name="CI/CD & Deployment" icon={Github} />
                  <SkillItem name="Scalable System Architecture" icon={Box} />
                  <SkillItem name="Model Drift & Monitoring" icon={LineChart} />
                </div>
              </div>

              {/* Cloud & Data Engineering */}
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400 flex items-center gap-2 mb-3 pb-2.5 border-b border-sky-600/30 dark:border-sky-400/30">
                  <Cloud className="flex-shrink-0" size={18} />
                  Cloud & Data Engineering
                </h3>
                <div className="space-y-1">
                  <SkillItem name="GCP & AWS" icon={Cloud} />
                  <SkillItem name="Distributed Computing" icon={Layers} />
                  <SkillItem name="Containerization (Docker)" icon={Box} />
                  <SkillItem name="ETL & Data Pipelines" icon={Database} />
                </div>
              </div>

              {/* Core ML & Research */}
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-3 pb-2.5 border-b border-amber-600/30 dark:border-amber-400/30">
                  <Code className="flex-shrink-0" size={18} />
                  Core ML & Research
                </h3>
                <div className="space-y-1">
                  <SkillItem name="Deep Learning Foundations" icon={BrainCircuit} />
                  <SkillItem name="Mathematical Modeling" icon={BarChart} />
                  <SkillItem name="Predictive Analytics" icon={LineChart} />
                  <SkillItem name="Reinforcement Learning" icon={Cpu} />
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      
      {/* Unified Professional Section (Grid Layout) — editorial flow */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">

            {/* Left Column: Experience */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-12">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="mb-4 pb-4 border-b border-gray-200/60 dark:border-white/[0.08]">
                  <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2">Experience</p>
                  <h2 className="font-bold text-2xl sm:text-3xl tracking-tight text-gray-900 dark:text-brand-fg">What I've shipped<span className="text-cyan-700 dark:text-brand-accent">.</span></h2>
                </motion.div>

                <div>
                  {experiences.map((exp, index) => (
                    <ExperienceCard
                      key={index}
                      {...exp}
                      isExpanded={expandedExperienceId === index}
                      onToggle={() => setExpandedExperienceId(expandedExperienceId === index ? null : index)}
                    />
                  ))}
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
                <motion.div variants={fadeInUp} className="mb-4 pb-4 border-b border-gray-200/60 dark:border-white/[0.08]">
                  <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2">Education</p>
                  <h2 className="font-bold text-2xl sm:text-3xl tracking-tight text-gray-900 dark:text-brand-fg">Where I trained<span className="text-cyan-700 dark:text-brand-accent">.</span></h2>
                </motion.div>

                <div>
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
                <motion.div variants={fadeInUp} className="mb-4 pb-4 border-b border-gray-200/60 dark:border-white/[0.08]">
                  <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2">Awards</p>
                  <h2 className="font-bold text-2xl sm:text-3xl tracking-tight text-gray-900 dark:text-brand-fg">Recognition<span className="text-cyan-700 dark:text-brand-accent">.</span></h2>
                </motion.div>

                <div>
                  <div className="py-6 border-b border-gray-200/60 dark:border-white/[0.08]">
                    <div className="flex items-start gap-3">
                      <Award className="text-cyan-700 dark:text-brand-accent mt-0.5 flex-shrink-0" size={22} />
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg tracking-tight text-gray-900 dark:text-brand-fg leading-tight mb-1">Total Ops Star Employee — LATAM</h3>
                        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan-700 dark:text-brand-accent mb-2">Ipsos <span className="opacity-60">·</span> April 2024</div>
                        <p className="text-sm text-gray-600 dark:text-brand-fg-muted leading-relaxed">
                          Awarded for developing TextInsight and driving technical impact across LATAM.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-6">
                    <div className="flex items-start gap-3">
                      <Award className="text-cyan-700 dark:text-brand-accent mt-0.5 flex-shrink-0" size={22} />
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg tracking-tight text-gray-900 dark:text-brand-fg leading-tight mb-1">Best Averages Scholarship</h3>
                        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan-700 dark:text-brand-accent mb-2">Universidad Nacional de Colombia <span className="opacity-60">·</span> 2018–2023</div>
                        <p className="text-sm text-gray-600 dark:text-brand-fg-muted leading-relaxed">
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
                <motion.div variants={fadeInUp} className="mb-4 pb-4 border-b border-gray-200/60 dark:border-white/[0.08]">
                  <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2">Languages</p>
                  <h2 className="font-bold text-2xl sm:text-3xl tracking-tight text-gray-900 dark:text-brand-fg">How I speak<span className="text-cyan-700 dark:text-brand-accent">.</span></h2>
                </motion.div>

                <div className="py-4 flex gap-10">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-700 dark:text-brand-accent mb-1">Spanish</p>
                    <p className="font-sans text-sm text-gray-700 dark:text-brand-fg-muted">Native</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-700 dark:text-brand-accent mb-1">English</p>
                    <p className="font-sans text-sm text-gray-700 dark:text-brand-fg-muted">Advanced</p>
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
            <motion.div variants={fadeInUp} className="mb-10 text-center">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2">Training</p>
              <h2 className="font-bold text-2xl sm:text-3xl tracking-tight text-gray-900 dark:text-brand-fg">Continuing education<span className="text-cyan-700 dark:text-brand-accent">.</span></h2>
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