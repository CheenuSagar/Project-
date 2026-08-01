import React, { useState, useEffect } from 'react';
import { BookOpen, Search, CheckCircle, Circle, Award, Sparkles, Filter, ChevronRight, Layers, FileText, Check, X, Bookmark, Percent, Laptop, Code, Cpu } from 'lucide-react';

// Official MCA 3rd Semester Syllabus Data extracted from syllabus document
const MCA_SEM3_SYLLABUS = [
  {
    id: '25ca301',
    code: '25CA301',
    title: 'Design and Analysis of Algorithms (DAA)',
    credits: 4,
    type: 'Academic Core (Theory)',
    hours: '3L + 1T + 0P',
    description: 'Advanced algorithmic paradigms, STL set/map complexities, Dynamic Programming, Greedy strategies, Backtracking, Branch & Bound, and String Matching.',
    textbooks: [
      'Introduction to Algorithms by Cormen, Leiserson, Rivest & Stein (CLRS), 3rd Edition',
      'Design and Analysis of Algorithms by Parag Himanshu Dave, Himanshu Bhalchandra Dave, Pearson India',
      'The Algorithm Design Manual by Steven S. Skiena, 3rd Edition, Springer'
    ],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Set & Map Data Structures (C++ STL)', 
        topics: 'Ordered & Unordered Set/Map definitions and differences, STL Operations: insert(), erase(), size(), find(), count(), accumulate(), union, intersection, set difference. Time complexity analysis for ordered vs unordered structures.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Dynamic Programming & Shortest Paths', 
        topics: 'Introduction to Dynamic Programming, Climbing Stairs problem, Coin Change problem, Counting Bits, House Robber Problem, Bellman-Ford Algorithm, All-Pairs Shortest Path (Floyd-Warshall), Traveling Salesperson Problem (TSP).' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Greedy Algorithms & Optimization', 
        topics: 'Greedy strategy principles, Activity Selection Problem, Fractional Knapsack, Job Sequencing with Deadlines, Minimum Cost Spanning Trees (Kruskal and Prim Algorithms), Single Source Shortest Path (Dijkstra Algorithm).' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Backtracking & Mathematical Algorithms', 
        topics: 'N-Queens Problem, Hamiltonian Circuit Problem, Subset-Sum Problem, Graph Coloring Problem. Math topics: Bit Manipulation, Modular Arithmetic, Euclid Algorithm, Extended Euclid, Modular Exponentiation, Matrix Exponentiation.' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Branch & Bound and String Matching', 
        topics: 'Branch and Bound strategy, 0/1 Knapsack using Branch & Bound, String Matching Algorithms (Naive, Knuth-Morris-Pratt KMP, Rabin-Karp), Trie Data Structure, Suffix Trees & String Processing applications.' 
      }
    ]
  },
  {
    id: '25ca302',
    code: '25CA302',
    title: 'Agile S/w Development & S/w Testing',
    credits: 4,
    type: 'Academic Core (Theory)',
    hours: '3L + 1T + 0P',
    description: 'Software development life cycle models, Agile manifesto, Scrum framework, story points estimation, black box/white box testing, and test automation.',
    textbooks: [
      'Software Engineering: A Practitioner Approach by Roger S. Pressman',
      'Agile Software Development: Principles, Patterns, and Practices by Robert C. Martin',
      'Software Testing: Principles and Practices by Srinivasan Desikan and Gopalaswamy Ramesh'
    ],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Software Development & Agile Fundamentals', 
        topics: 'Overview of Software Engineering, SDLC models (Waterfall, Incremental, Spiral), limitations of plan-driven models, Agile manifesto & principles, requirement management in Agile, Product Backlog, User Stories, Iteration & Release Planning.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Scrum Framework & Agile Practices', 
        topics: 'Scrum Roles (Product Owner, Scrum Master, Development Team), Scrum Artifacts & Events (Sprint Planning, Daily Standup, Review, Retrospective), Kanban Board, Prototyping, Wireframing, Agile Design & Tools.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Agile Methodologies & Project Estimation', 
        topics: 'Extreme Programming (XP) practices, Feature Driven Development (FDD), DSDM, Story Points estimation, Velocity tracking, COCOMO model, Quality practices in Agile, Scaled Agile Framework (SAFe) introduction.' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Software Testing Principles & Techniques', 
        topics: 'Verification vs Validation, Black-Box Testing (Equivalence Partitioning, Boundary Value Analysis), White-Box Testing (Statement, Branch, Path Coverage), Unit Testing, Integration Testing, System Testing.' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Test Management, Automation & CI/CD', 
        topics: 'Defect Life Cycle & Tracking (Jira/Bugzilla), Test Automation Frameworks (Selenium, JUnit/TestNG), Continuous Integration & Continuous Deployment (CI/CD Pipelines), Quality Assurance metrics.' 
      }
    ]
  },
  {
    id: '25ca303',
    code: '25CA303',
    title: 'Computer Networks',
    credits: 4,
    type: 'Academic Core (Theory)',
    hours: '3L + 1T + 0P',
    description: 'Data communication architectures, OSI & TCP/IP models, error control (CRC), IP addressing/subnetting, routing protocols, TCP/UDP, and network security.',
    textbooks: [
      'Computer Networks by Andrew S. Tanenbaum and David J. Wetherall, 5th Edition',
      'Data Communications and Networking by Behrouz A. Forouzan',
      'Cryptography and Network Security by William Stallings'
    ],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Data Communication & Network Architectures', 
        topics: 'Data communication components, Data Flow (Simplex, Half-Duplex, Full-Duplex), LAN, MAN, WAN, Topologies, Bandwidth, Throughput, Latency, OSI 7-Layer Model, TCP/IP Model, Transmission Media, Switches, Routers, Gateways.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Data Link Layer & MAC Protocols', 
        topics: 'Framing, Error Detection & Correction (VRC, LRC, Checksum, CRC, Hamming Code), Flow Control (Stop & Wait, Sliding Window ARQ), MAC Protocols (ALOHA, CSMA/CD, Token Ring), Switching Techniques.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Network Layer & IP Addressing', 
        topics: 'IPv4 & IPv6 Addressing schemes, Subnetting & CIDR, ARP, RARP, ICMP, IGMP, Routing Algorithms (Shortest Path, Flooding, Distance Vector Routing, Link State Routing OSPF/BGP).' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Transport Layer & Congestion Control', 
        topics: 'Process-to-Process delivery, User Datagram Protocol (UDP), Transmission Control Protocol (TCP), Port Addressing, TCP 3-Way Handshake, Congestion Control Algorithms, Quality of Service (QoS).' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Application Layer & Cryptography Security', 
        topics: 'HTTP/HTTPS, DNS, DHCP, FTP, SMTP, Network Security Primitives, Symmetric & Asymmetric Encryption (DES, AES, RSA), Digital Signatures, Firewalls, SSL/TLS Protocols.' 
      }
    ]
  },
  {
    id: '25de001',
    code: '25DE001 / 002 / 003',
    title: 'Departmental Elective: Blockchain / Data Analytics / Cyber Security',
    credits: 3,
    type: 'Departmental Elective (Theory)',
    hours: '2L + 1T + 0P',
    description: 'Distributed ledger technology, cryptographic consensus mechanisms, smart contracts, data analytics tools, and cybersecurity threat mitigation.',
    textbooks: [
      'Mastering Blockchain by Imran Bashir',
      'Data Analytics with Python by Wes McKinney',
      'Cybersecurity Essentials by Charles J. Brooks'
    ],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Blockchain Fundamentals & Distributed Ledgers', 
        topics: 'Digital Money to Distributed Ledgers, Blockchain architecture & features, Cryptographic Primitives (SHA-256, Hash Chains, Digital Signatures), Consensus Mechanisms (PoW, PoS), Public/Private/Hybrid Blockchains.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Smart Contracts & Ethereum Platform', 
        topics: 'Ethereum Virtual Machine (EVM), Smart Contracts development using Solidity, Gas Mechanics, Decentralized Applications (DApps), Web3.js & Wallet Integration.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Enterprise Blockchain & Hyperledger', 
        topics: 'Hyperledger Fabric architecture, Permissioned Ledgers, Channels, Chaincode development, Peer Nodes & Ordering Service, Enterprise Use Cases.' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Data Analytics & Big Data Foundations', 
        topics: 'Data Cleaning, Exploratory Data Analysis (EDA), Statistical Modeling, Intro to Hadoop HDFS, MapReduce, Apache Spark fundamentals for Data Analytics.' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Cyber Security & Vulnerability Assessment', 
        topics: 'Cyber Threat Landscape, CIA Triad, Network Attacks (DoS/DDoS, Spoofing, Phishing), Vulnerability Assessment, Penetration Testing Basics, Incident Response.' 
      }
    ]
  },
  {
    id: '25ca304_e1',
    code: '25CA304_E1 / E2',
    title: 'Domain Elective: Advance Machine Learning / Cloud Technology-II',
    credits: 3,
    type: 'Domain Elective (Theory)',
    hours: '3L + 0T + 0P',
    description: 'Neural networks, Deep Learning CNNs, Transformers, Natural Language Processing, Generative AI (LLMs), RAG, Vector Databases, and AI Agents.',
    textbooks: [
      'Deep Learning by Ian Goodfellow, Yoshua Bengio, and Aaron Courville',
      'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow by Aurélien Géron',
      'Natural Language Processing with Transformers by Lewis Tunstall'
    ],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Artificial Neural Networks & Deep Learning Core', 
        topics: 'Principles and implementation of ANN, Perceptrons, Multi-Layer Perceptrons, Activation Functions (Sigmoid, Tanh, ReLU, Softmax), Backpropagation Algorithm, Gradient Descent Optimizers (Adam, RMSprop).' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Convolutional Neural Networks (CNN)', 
        topics: 'CNN Architecture, Convolutional Layers, Pooling Layers, Feature Maps, Image Classification & Object Detection Models (ResNet, VGG, YOLO), Transfer Learning.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Sequential Models & Natural Language Processing', 
        topics: 'Recurrent Neural Networks (RNN), Long Short-Term Memory (LSTM), GRU, Sequence-to-Sequence Models, Text Preprocessing, Tokenization, Word Embeddings (Word2Vec, GloVe).' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Transformers & Large Language Models (LLMs)', 
        topics: 'Attention Mechanism, Self-Attention, Transformer Encoder-Decoder Architecture, BERT, GPT Models, Prompt Engineering, Fine-Tuning LLMs.' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Generative AI, RAG & Autonomous AI Agents', 
        topics: 'Generative AI Technologies, Retrieval-Augmented Generation (RAG), Vector Databases (Pinecone, ChromaDB), Autonomous AI Agents, Ethical & Responsible AI Practices.' 
      }
    ]
  },
  {
    id: '25ca351',
    code: '25CA351',
    title: 'Design and Analysis of Algorithm Lab',
    credits: 2,
    type: 'Academic Core (Practical)',
    hours: '0L + 0T + 4P',
    description: 'Hands-on C++ STL implementation of Sets/Maps, Dynamic Programming algorithms, Greedy optimization problems, Backtracking, and String Matching.',
    textbooks: ['C++ Standard Template Library Guide by Nicolai M. Josuttis', 'Algorithms Lab Manual by Pearson India'],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: C++ STL Set & Map Lab Experiments', 
        topics: 'Practical implementation of ordered and unordered sets & maps in C++. Execution time measurement and benchmarking of insert(), find(), and erase() operations.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Dynamic Programming Lab Assignments', 
        topics: 'Implementation of Climbing Stairs, Coin Change Problem, House Robber, 0/1 Knapsack, Floyd-Warshall All-Pairs Shortest Path algorithm.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Greedy Algorithm Lab Implementations', 
        topics: 'Implementation of Activity Selection Problem, Fractional Knapsack, Dijkstra Shortest Path Algorithm, Kruskal and Prim Minimum Spanning Trees.' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Backtracking & Graph Algorithms', 
        topics: 'Solving N-Queens Problem, Subset-Sum Problem, Hamiltonian Cycle Detection, Graph Coloring using Backtracking in C++/Python.' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: String Matching & Trie Data Structure', 
        topics: 'Implementation of Naive Pattern Searching, KMP String Matching Algorithm, Trie Data Structure insertion and search operations.' 
      }
    ]
  },
  {
    id: '25vc352',
    code: '25VC352',
    title: 'Internship Assessment (Full Stack / Emerging Technology)',
    credits: 2,
    type: 'Innovation & Industry Connect (Practical)',
    hours: '0L + 0T + 4P',
    description: 'Practical industrial training, real-world full-stack development, tech stack configuration, deployment pipelines, and industrial training defense.',
    textbooks: ['Industry Project Development & Full-Stack Deployment Guidelines'],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Internship Domain & Requirement Engineering', 
        topics: 'Selection of emerging technology domain (Full-Stack, Cloud, AI/ML, DevOps), industry project charter formulation, and SRS documentation.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: Architecture Design & Tech Stack Setup', 
        topics: 'Database Schema normalization, API architecture, frontend component setup, GitHub version control & team collaboration workflow.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Full Stack Development & Integration', 
        topics: 'Frontend UI/UX integration, Backend REST API service development, Database connectivity, and Third-party API authentication.' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: Testing, Profiling & Deployment', 
        topics: 'Unit testing, Integration testing, performance profiling, security vulnerability check, and live cloud deployment (AWS/Vercel/Docker).' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Internship Dissertation & Viva Evaluation', 
        topics: 'Industrial training completion certificate submission, formal project dissertation report compilation, and viva-voce defense before industry panel.' 
      }
    ]
  },
  {
    id: '25ca353',
    code: '25CA353',
    title: 'Mini Project',
    credits: 3,
    type: 'Innovation & Industry Connect (Practical)',
    hours: '0L + 0T + 6P',
    description: 'Comprehensive software application development covering problem formulation, design, coding, testing, cloud deployment, and viva defense.',
    textbooks: ['Software Project Management and IEEE Guidelines'],
    units: [
      { 
        id: 'u1', 
        name: 'Unit I: Project Proposal & Problem Definition', 
        topics: 'Selection of innovative mini-project topic, requirement gathering, SRS document creation, feasibility analysis, and milestone planning.' 
      },
      { 
        id: 'u2', 
        name: 'Unit II: System Design & UI/UX Wireframing', 
        topics: 'ER Diagram design, Data Flow Diagrams (DFD), System Architecture Diagram, UI/UX Wireframe mockups, and DB table schemas.' 
      },
      { 
        id: 'u3', 
        name: 'Unit III: Project Implementation & Coding', 
        topics: 'Core logic programming, database integration, UI component development, API routing, and state management.' 
      },
      { 
        id: 'u4', 
        name: 'Unit IV: System Testing & Cloud Deployment', 
        topics: 'Functional testing, bug fixes, responsiveness verification, build optimization, and hosting on live web/cloud platform.' 
      },
      { 
        id: 'u5', 
        name: 'Unit V: Project Report & Final Viva Defense', 
        topics: 'Compilation of final Mini Project Report, PowerPoint slides preparation, live application demonstration, and external viva evaluation.' 
      }
    ]
  }
];

export default function SyllabusPortal() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectModal, setActiveSubjectModal] = useState(null);
  
  // Progress tracker state saved in localStorage
  const [completedUnits, setCompletedUnits] = useState(() => {
    try {
      const saved = localStorage.getItem('lecalert_syllabus_progress_sem3');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lecalert_syllabus_progress_sem3', JSON.stringify(completedUnits));
    } catch (e) {
      console.error('Failed to save syllabus progress:', e);
    }
  }, [completedUnits]);

  const toggleUnitCompletion = (unitKey) => {
    setCompletedUnits(prev => ({
      ...prev,
      [unitKey]: !prev[unitKey]
    }));
  };

  const getSubjectProgress = (subject) => {
    if (!subject || !subject.units || subject.units.length === 0) return 0;
    const total = subject.units.length;
    let done = 0;
    subject.units.forEach(u => {
      if (completedUnits[`${subject.id}-${u.id}`]) {
        done++;
      }
    });
    return Math.round((done / total) * 100);
  };

  // Compute total semester overall completion percentage
  const getOverallSemProgress = () => {
    let totalUnitsCount = 0;
    let totalDoneCount = 0;
    MCA_SEM3_SYLLABUS.forEach(sub => {
      sub.units.forEach(u => {
        totalUnitsCount++;
        if (completedUnits[`${sub.id}-${u.id}`]) {
          totalDoneCount++;
        }
      });
    });
    return totalUnitsCount === 0 ? 0 : Math.round((totalDoneCount / totalUnitsCount) * 100);
  };

  const filteredSubjects = MCA_SEM3_SYLLABUS.filter(sub => {
    // Category Filter
    if (filterType === 'theory' && !sub.type.includes('Theory')) return false;
    if (filterType === 'practical' && !sub.type.includes('Practical')) return false;

    // Search Filter
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sub.title.toLowerCase().includes(q) ||
      sub.code.toLowerCase().includes(q) ||
      sub.description.toLowerCase().includes(q) ||
      sub.units.some(u => u.name.toLowerCase().includes(q) || u.topics.toLowerCase().includes(q))
    );
  });

  const overallProgress = getOverallSemProgress();

  return (
    <div className="syllabus-portal animate-fade-in">
      {/* Header Banner */}
      <div className="syllabus-hero glass">
        <div className="syllabus-hero-content">
          <div className="syllabus-badge">
            <Sparkles size={16} />
            <span>ABES Academix • MCA 3rd Semester Official Syllabus Scheme</span>
          </div>
          <h1 className="syllabus-title">MCA Semester III Syllabus Portal</h1>
          <p className="syllabus-subtitle">
            Explore complete unit-by-unit syllabus topics for Design & Analysis of Algorithms, Computer Networks, Agile Testing, Electives, and Labs. Track your unit completion progress in real time.
          </p>

          {/* Semester Overview Cards */}
          <div className="sem3-overview-pills">
            <div className="sem3-stat-pill">
              <Award size={18} className="stat-icon" />
              <div>
                <span className="stat-val">25 Credits</span>
                <span className="stat-lbl">Total Semester Credit</span>
              </div>
            </div>
            <div className="sem3-stat-pill">
              <BookOpen size={18} className="stat-icon" />
              <div>
                <span className="stat-val">8 Subjects</span>
                <span className="stat-lbl">5 Theory + 3 Labs/Projects</span>
              </div>
            </div>
            <div className="sem3-stat-pill">
              <Percent size={18} className="stat-icon" />
              <div>
                <span className="stat-val">{overallProgress}% Done</span>
                <span className="stat-lbl">Overall Sem Progress</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="syllabus-search-box" style={{ marginTop: '20px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search MCA 3rd Sem subjects or topics (e.g. DAA, Dynamic Programming, Networks, Agile, Blockchain)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="sem-tabs-bar">
        <button 
          className={`sem-tab ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          <BookOpen size={16} />
          <span>All 3rd Sem Subjects (8)</span>
        </button>
        <button 
          className={`sem-tab ${filterType === 'theory' ? 'active' : ''}`}
          onClick={() => setFilterType('theory')}
        >
          <FileText size={16} />
          <span>Theory Courses (5)</span>
        </button>
        <button 
          className={`sem-tab ${filterType === 'practical' ? 'active' : ''}`}
          onClick={() => setFilterType('practical')}
        >
          <Laptop size={16} />
          <span>Practical & Projects (3)</span>
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div className="subjects-grid">
        {filteredSubjects.length === 0 ? (
          <div className="empty-syllabus-state glass">
            <BookOpen size={48} className="empty-icon" />
            <h3>No subjects found matching "{searchQuery}"</h3>
            <p>Try searching for a different keyword or select another filter option.</p>
          </div>
        ) : (
          filteredSubjects.map(sub => {
            const progress = getSubjectProgress(sub);
            return (
              <div key={sub.id} className="subject-card glass">
                <div className="subject-card-header">
                  <span className="subject-code-badge">{sub.code}</span>
                  <div className="subject-pills">
                    <span className="type-pill">{sub.type}</span>
                    <span className="credits-pill">{sub.credits} Credits</span>
                  </div>
                </div>

                <h3 className="subject-title">{sub.title}</h3>
                <p className="subject-desc">{sub.description}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  ⏰ Scheme Hours: {sub.hours}
                </div>

                {/* Progress Bar */}
                <div className="subject-progress-wrapper">
                  <div className="progress-label">
                    <span>Unit Progress</span>
                    <span className="progress-percent">{progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${progress}%`,
                        background: progress === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'var(--primary-gradient)'
                      }}
                    />
                  </div>
                </div>

                <div className="subject-card-footer">
                  <button 
                    className="view-syllabus-btn"
                    onClick={() => setActiveSubjectModal(sub)}
                  >
                    <BookOpen size={16} />
                    <span>View Unit Breakdown</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Unit Reader & Checklist Modal */}
      {activeSubjectModal && (
        <div className="modal-overlay" onClick={() => setActiveSubjectModal(null)}>
          <div className="modal-content glass syllabus-reader-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-code-tag">{activeSubjectModal.code} • MCA 3rd Semester</span>
                <h2 className="modal-title">{activeSubjectModal.title}</h2>
              </div>
              <button className="btn-close" onClick={() => setActiveSubjectModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="syllabus-modal-body">
              {/* Overall Subject Progress Banner */}
              <div className="modal-progress-banner glass">
                <div className="banner-left">
                  <Percent size={20} className="text-primary" />
                  <div>
                    <div className="banner-title">Completion Status</div>
                    <div className="banner-sub">
                      {getSubjectProgress(activeSubjectModal)}% Units Completed
                    </div>
                  </div>
                </div>
                <div className="banner-badge">
                  {getSubjectProgress(activeSubjectModal) === 100 ? '✅ 100% Completed' : 'In Progress'}
                </div>
              </div>

              {/* Units Checklist */}
              <div className="units-list-wrapper">
                <h4 className="section-heading">
                  <Layers size={16} /> Unit Breakdown & Topics Checklist
                </h4>

                <div className="units-list">
                  {activeSubjectModal.units.map(unit => {
                    const unitKey = `${activeSubjectModal.id}-${unit.id}`;
                    const isChecked = !!completedUnits[unitKey];

                    return (
                      <div 
                        key={unit.id} 
                        className={`unit-item-card ${isChecked ? 'unit-completed' : ''}`}
                        onClick={() => toggleUnitCompletion(unitKey)}
                      >
                        <div className="unit-checkbox-wrapper">
                          {isChecked ? (
                            <CheckCircle size={22} className="check-icon-active" />
                          ) : (
                            <Circle size={22} className="check-icon-idle" />
                          )}
                        </div>

                        <div className="unit-content">
                          <h5 className="unit-name">{unit.name}</h5>
                          <p className="unit-topics">{unit.topics}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Textbooks & References */}
              {activeSubjectModal.textbooks && (
                <div className="textbooks-section">
                  <h4 className="section-heading">
                    <FileText size={16} /> Recommended Textbooks & References
                  </h4>
                  <ul className="textbook-list">
                    {activeSubjectModal.textbooks.map((tb, idx) => (
                      <li key={idx}>
                        <Bookmark size={14} className="tb-icon" />
                        <span>{tb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setActiveSubjectModal(null)}>
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

































