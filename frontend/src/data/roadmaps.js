/**
 * Study roadmaps. Plain data so contributors can extend a track with a PR.
 *
 * Shape: track → phases (months or weeks) → items (checkable topics).
 * `note` is a target or deliverable for that phase; `goal` closes the track.
 */

export const TRACKS = [
  {
    id: 'dsa',
    title: 'Striver A2Z DSA',
    duration: '6 months',
    unit: 'Month',
    tag: 'Interview Core',
    summary: 'The full DSA path, ordered so each topic builds on the last.',
    goal: '~450–600 quality problems',
    phases: [
      {
        title: 'Foundations + Arrays',
        note: 'Practice: 100+ problems',
        items: ['C++ basics / STL', 'Time & space complexity', 'Basic maths', 'Recursion basics', 'Arrays', 'Hashing', 'Sorting'],
      },
      {
        title: 'Binary Search + Strings',
        note: 'Practice: 80–100 problems',
        items: ['Binary search', 'Binary search on answer', 'Strings', 'Two pointers', 'Sliding window', 'Prefix / suffix techniques'],
      },
      {
        title: 'Linked List + Recursion',
        note: 'Practice: 70–90 problems',
        items: ['Singly / doubly linked list', 'Fast & slow pointer', 'Recursion', 'Backtracking', 'Bit manipulation'],
      },
      {
        title: 'Stack + Queue + Heap',
        note: 'Practice: 70–90 problems',
        items: ['Stack', 'Queue', 'Monotonic stack', 'Sliding window', 'Priority queue', 'Heap', 'Greedy basics'],
      },
      {
        title: 'Trees + Graphs',
        items: ['Binary trees', 'BST', 'Tree traversals', 'LCA', 'Graph representation', 'BFS / DFS', 'Topological sort', 'DSU'],
      },
      {
        title: 'Graph + DP + Revision',
        items: ['Shortest path', 'MST', 'Advanced graphs', '1D / 2D DP', 'Subsequences', 'DP on trees', 'Greedy', 'Mixed revision'],
      },
    ],
  },
  {
    id: 'hld',
    title: 'HLD / System Design',
    duration: '3 months',
    unit: 'Month',
    tag: 'Interview Core',
    summary: 'Designing systems that scale, and being able to defend the choices.',
    goal: '10–15 complete system designs',
    phases: [
      {
        title: 'Fundamentals',
        note: 'Practice designs: URL Shortener · Rate Limiter · Pastebin · File Storage',
        items: ['Scalability', 'Availability', 'Reliability', 'Latency', 'Throughput', 'CAP theorem', 'Consistency', 'Load balancing', 'Caching', 'Database scaling', 'Replication', 'Sharding', 'CDN', 'Message queues'],
      },
      {
        title: 'Distributed Systems',
        note: 'Design: WhatsApp · YouTube · Instagram · Uber · Netflix',
        items: ['Redis', 'Kafka', 'RabbitMQ', 'Elasticsearch', 'API gateway', 'Service discovery', 'Microservices', 'Event-driven architecture', 'Database partitioning', 'Distributed transactions', 'Idempotency', 'Fault tolerance', 'Observability'],
      },
      {
        title: 'Interview-Level Design',
        note: 'Run every system through the full sequence',
        items: ['Requirements', 'Estimation', 'APIs', 'Database', 'Architecture', 'Scaling', 'Bottlenecks', 'Failure handling'],
      },
    ],
  },
  {
    id: 'lld',
    title: 'LLD / Low-Level Design',
    duration: '3 months',
    unit: 'Month',
    tag: 'Interview Core',
    summary: 'Object modelling and design patterns — clean, extensible code.',
    goal: 'Clean extensible code, not just diagrams',
    phases: [
      {
        title: 'OOP + Design Principles',
        note: 'Design: Parking Lot · Library Management · Tic-Tac-Toe',
        items: ['Classes / objects', 'Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism', 'SOLID', 'Composition vs inheritance', 'Interfaces', 'UML basics'],
      },
      {
        title: 'Design Patterns',
        items: ['Factory', 'Abstract factory', 'Builder', 'Singleton', 'Strategy', 'Observer', 'Adapter', 'Decorator', 'Command', 'State', 'Template method'],
      },
      {
        title: 'Interview Practice',
        note: 'Build each one end to end',
        items: ['Chess', 'Splitwise', 'Snake & Ladder', 'ATM', 'Cab booking', 'Movie ticket booking', 'Elevator'],
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL',
    duration: '1 month',
    unit: 'Week',
    tag: 'Interview Core',
    summary: 'From SELECT to query optimisation in four weeks.',
    goal: '100+ SQL problems',
    phases: [
      { title: 'Query Basics', items: ['SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'DISTINCT', 'LIMIT', 'Aggregate functions'] },
      { title: 'Joins & Subqueries', items: ['Joins', 'Subqueries', 'CTEs', 'CASE', 'UNION', 'EXISTS'] },
      { title: 'Window Functions', items: ['Window functions', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LEAD', 'LAG', 'Running totals', 'Advanced queries'] },
      { title: 'Performance & Design', items: ['Indexes', 'Transactions', 'ACID', 'Normalization', 'Views', 'Query optimization'] },
    ],
  },
  {
    id: 'oop',
    title: 'OOP',
    duration: '1 month',
    unit: 'Week',
    tag: 'Interview Core',
    summary: 'Object-oriented thinking, applied to real designs.',
    goal: 'Explain why you chose a design, not just definitions',
    phases: [
      { title: 'Core Concepts', items: ['Class / object', 'Constructor', 'Destructor', 'Access modifiers', 'Encapsulation'] },
      { title: 'Inheritance & Polymorphism', items: ['Inheritance', 'Polymorphism', 'Function overloading', 'Function overriding', 'Virtual functions', 'Abstract classes'] },
      { title: 'Relationships & Principles', items: ['Composition', 'Aggregation', 'Association', 'Interfaces', 'SOLID'] },
      { title: 'Apply It', note: 'Model each system properly', items: ['Parking Lot', 'Library', 'Banking system', 'E-commerce', 'Game'] },
    ],
  },
  {
    id: 'web',
    title: 'Web Development / Full Stack',
    duration: '6 months',
    unit: 'Month',
    tag: 'Development',
    summary: 'Frontend through production deployment, ending in a capstone.',
    goal: 'One serious production-style application',
    phases: [
      {
        title: 'HTML + CSS + JavaScript',
        note: 'Build 3–5 small projects',
        items: ['HTML5', 'CSS', 'Flexbox', 'Grid', 'Responsive design', 'JavaScript fundamentals', 'DOM', 'Events', 'ES6+', 'Async JS', 'Fetch / API'],
      },
      {
        title: 'React',
        note: 'Build: dashboard + e-commerce frontend',
        items: ['Components', 'Props', 'State', 'Hooks', 'Forms', 'Routing', 'Context', 'API integration', 'Redux Toolkit', 'Performance'],
      },
      {
        title: 'Backend',
        items: ['Node.js', 'Express', 'REST APIs', 'Authentication', 'JWT', 'OAuth', 'Validation', 'Error handling', 'File uploads', 'PostgreSQL', 'Prisma'],
      },
      {
        title: 'Full-Stack',
        note: 'React → Node/Express → PostgreSQL',
        items: ['Authentication', 'RBAC', 'Pagination', 'Search', 'Filtering', 'File upload', 'Email', 'Payments', 'WebSockets'],
      },
      {
        title: 'Production',
        items: ['Git / GitHub', 'Docker', 'CI/CD', 'Testing', 'Security', 'Caching', 'Logging', 'Monitoring', 'Redis', 'Deployment', 'Cloud basics'],
      },
      {
        title: 'Capstone',
        note: 'SaaS app: auth + dashboard + payments + RBAC + real-time + PostgreSQL + Redis + Docker + CI/CD',
        items: ['Scope and plan it', 'Build it', 'Test it', 'Deploy it', 'Document it'],
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    duration: '3 months',
    unit: 'Month',
    tag: 'Development',
    summary: 'Server-side depth, from first API to production scale.',
    goal: 'Production-grade backend with docs, tests and deployment',
    phases: [
      {
        title: 'Backend Fundamentals',
        items: ['Node.js', 'Express', 'REST', 'HTTP', 'APIs', 'Authentication', 'Authorization', 'PostgreSQL', 'Prisma', 'Transactions', 'Validation', 'Error handling'],
      },
      {
        title: 'Advanced Backend',
        items: ['Redis', 'Caching', 'Queues', 'Background jobs', 'WebSockets', 'Rate limiting', 'Security', 'Logging', 'Testing', 'Performance', 'Database optimization'],
      },
      {
        title: 'Production Backend',
        items: ['Docker', 'CI/CD', 'Microservices', 'Kafka', 'API gateway', 'Load balancing', 'Observability', 'Scaling', 'Cloud deployment'],
      },
    ],
  },
  {
    id: 'aiml',
    title: 'AI / ML',
    duration: '6 months',
    unit: 'Month',
    tag: 'Data & AI',
    summary: 'Maths through deployed models, ending with GenAI and MLOps.',
    goal: '5–6 serious projects',
    phases: [
      { title: 'Mathematics + Python', items: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Probability', 'Statistics', 'Linear algebra', 'Calculus basics'] },
      {
        title: 'Classical ML',
        note: 'Plus: train/test split · cross-validation · bias-variance · overfitting · feature engineering · metrics',
        items: ['Linear regression', 'Logistic regression', 'KNN', 'Decision trees', 'Random forest', 'SVM', 'Naive Bayes'],
      },
      { title: 'Advanced ML', items: ['XGBoost', 'LightGBM', 'Clustering', 'PCA', 'Ensemble methods', 'Hyperparameter tuning', 'Pipelines'] },
      { title: 'Deep Learning', items: ['Neural networks', 'Backpropagation', 'PyTorch', 'CNN', 'RNN', 'LSTM', 'Transformers basics'] },
      { title: 'GenAI', items: ['Transformers', 'LLMs', 'Embeddings', 'Vector databases', 'RAG', 'Fine-tuning basics', 'Prompt engineering', 'AI agents', 'Evaluation'] },
      { title: 'ML Engineering', items: ['FastAPI', 'Model serving', 'Docker', 'MLflow', 'Model monitoring', 'Data pipelines', 'Cloud basics'] },
    ],
  },
  {
    id: 'ds',
    title: 'Data Science',
    duration: '6 months',
    unit: 'Month',
    tag: 'Data & AI',
    summary: 'Statistics, analysis and modelling, ending in a portfolio.',
    goal: 'Six portfolio projects including one end-to-end',
    phases: [
      { title: 'Python + Statistics', items: ['Python', 'NumPy', 'Pandas', 'Statistics', 'Probability', 'Distributions', 'Hypothesis testing'] },
      {
        title: 'Data Analysis',
        note: 'Tools: Pandas · Matplotlib · Seaborn · Plotly',
        items: ['Data cleaning', 'EDA', 'Missing values', 'Outliers', 'Feature engineering', 'Visualization'],
      },
      { title: 'Machine Learning', items: ['Regression', 'Classification', 'Clustering', 'Decision trees', 'Random forest', 'XGBoost', 'Model evaluation'] },
      { title: 'Advanced DS', items: ['Feature selection', 'Dimensionality reduction', 'Time series', 'Recommendation systems', 'Experimentation / A-B testing'] },
      { title: 'Advanced ML / AI', items: ['NLP', 'Deep learning', 'Transformers', 'LLM basics', 'Generative AI'] },
      { title: 'Portfolio', items: ['Sales prediction', 'Customer churn', 'Recommendation system', 'Fraud detection', 'Time-series forecasting', 'One end-to-end ML project'] },
    ],
  },
  {
    id: 'analytics',
    title: 'Data Analytics',
    duration: '6 months',
    unit: 'Month',
    tag: 'Data & AI',
    summary: 'Excel through business dashboards that answer real questions.',
    goal: '5–8 business dashboards',
    phases: [
      { title: 'Excel', items: ['Formulas', 'XLOOKUP', 'INDEX / MATCH', 'Pivot tables', 'Charts', 'Conditional formatting', 'Power Query'] },
      { title: 'SQL', items: ['Joins', 'Aggregations', 'CTEs', 'Subqueries', 'Window functions', 'Business queries'] },
      { title: 'Statistics + Python', items: ['Descriptive statistics', 'Probability', 'Hypothesis testing', 'Pandas', 'NumPy', 'Visualization'] },
      { title: 'Power BI', items: ['Data modeling', 'Relationships', 'DAX', 'Measures', 'KPIs', 'Dashboards', 'Power Query'] },
      {
        title: 'Business Analytics',
        note: 'What happened? → Why? → What will happen? → What should we do?',
        items: ['Sales analytics', 'Customer analytics', 'Marketing analytics', 'Product analytics', 'Financial analytics'],
      },
      { title: 'Portfolio', items: ['E-commerce dashboard', 'Sales dashboard', 'HR analytics', 'Customer churn', 'Marketing campaign analysis', 'Financial dashboard'] },
    ],
  },
];

/**
 * The part that doesn't end when a track does. Learning is a cadence, not a
 * queue you finish.
 */
export const CADENCE = [
  { every: 'Every day', items: ['1–3 DSA problems'] },
  { every: 'Every week', items: ['1 coding contest', '1 system-design problem', '1 SQL session', 'Build or improve something'] },
  { every: 'Every month', items: ['1 substantial project or feature', 'Revise old DSA', 'Revise CS fundamentals', 'Read real engineering code and articles'] },
  { every: 'Every 6 months', items: ['Revisit: DSA → OOP → DBMS/SQL → OS → CN → LLD → HLD → Development'] },
];

export const TAGS = ['All', 'Interview Core', 'Development', 'Data & AI'];
