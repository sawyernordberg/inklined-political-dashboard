'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Header from '../../components/Header';
import ShareButton from '../../components/ShareButton';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Department {
  id: string;
  name: string;
  established: string;
  icon: string;
  secretary: string;
  secretaryTitle: string;
  description: string;
  expandedDescription: string;
  keyAgencies: string[];
  budget: string;
  budgetYear: string;
}

interface FederalEmployeeData {
  date: string;
  value: string;
}

interface FederalEmployeesResponse {
  series_info: Record<string, unknown>;
  observations: {
    observations: FederalEmployeeData[];
  };
}

export default function DepartmentsPage() {
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [federalEmployeesData, setFederalEmployeesData] = useState<FederalEmployeeData[]>([]);
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y'>('1Y');
  const [isLoadingFederalData, setIsLoadingFederalData] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    // Prevent body scroll when sidebar is open
    if (newState) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  };

  const departments: Department[] = [
    {
      id: 'state',
      name: 'Department of State',
      established: 'Established 1789',
      icon: '🌍',
      secretary: 'Marco Rubio',
      secretaryTitle: 'Secretary of State',
      description: 'Leads America\'s foreign policy through diplomatic relations and international negotiations.',
      expandedDescription: 'The State Department serves as the United States\' primary diplomatic arm, managing relationships with nearly 200 countries worldwide. It operates 280 embassies, consulates, and diplomatic missions globally, providing critical services including passport issuance, visa processing, and citizen services abroad.',
      keyAgencies: [
        'Bureau of Diplomatic Security - Protects diplomatic facilities and personnel',
        'Agency for International Development (USAID) - Manages foreign aid programs',
        'Foreign Service Institute - Trains diplomatic personnel',
        'Bureau of Consular Affairs - Handles passports and visas'
      ],
      budget: '$58.1B',
      budgetYear: '2024'
    },
    {
      id: 'treasury',
      name: 'Department of Treasury',
      established: 'Established 1789',
      icon: '💰',
      secretary: 'Scott Bessent',
      secretaryTitle: 'Secretary of Treasury',
      description: 'Manages federal finances, collects taxes, and oversees financial institutions.',
      expandedDescription: 'Treasury serves as the federal government\'s financial manager, collecting over $4 trillion annually in federal taxes and managing the national debt. The department produces all U.S. currency and coins, regulates national banks, and implements economic sanctions.',
      keyAgencies: [
        'Internal Revenue Service (IRS) - Collects federal taxes',
        'U.S. Mint - Produces coins and precious metal products',
        'Bureau of Engraving and Printing - Produces paper currency',
        'Financial Crimes Enforcement Network - Combats money laundering'
      ],
      budget: '$16.4B',
      budgetYear: '2024'
    },
    {
      id: 'defense',
      name: 'Department of Defense',
      established: 'Established 1947',
      icon: '🛡️',
      secretary: 'Pete Hegseth',
      secretaryTitle: 'Secretary of Defense',
      description: 'Coordinates all agencies relating to national security and the U.S. Armed Forces.',
      expandedDescription: 'The Department of Defense is the world\'s largest employer, managing all branches of the U.S. military and overseeing national defense strategy. DOD operates military installations across all 50 states and in over 80 countries worldwide.',
      keyAgencies: [
        'U.S. Army - Land-based military operations',
        'U.S. Navy - Maritime operations and power projection',
        'U.S. Air Force - Aerial warfare and space operations',
        'U.S. Marine Corps - Rapid response and amphibious operations',
        'U.S. Space Force - Space-based defense operations'
      ],
      budget: '$852B',
      budgetYear: '2024'
    },
    {
      id: 'justice',
      name: 'Department of Justice',
      established: 'Established 1870',
      icon: '⚖️',
      secretary: 'Pam Bondi',
      secretaryTitle: 'Attorney General',
      description: 'Enforces federal law and provides legal counsel to the President.',
      expandedDescription: 'The Department of Justice serves as the federal government\'s law enforcement arm, prosecuting federal crimes, defending government interests in court, and ensuring fair enforcement of civil rights laws.',
      keyAgencies: [
        'Federal Bureau of Investigation (FBI) - Federal criminal investigations',
        'Drug Enforcement Administration (DEA) - Combats drug trafficking',
        'Bureau of Alcohol, Tobacco, Firearms and Explosives - Weapons regulation',
        'U.S. Marshals Service - Federal court security and fugitive operations'
      ],
      budget: '$37.5B',
      budgetYear: '2024'
    },
    {
      id: 'interior',
      name: 'Department of Interior',
      established: 'Established 1849',
      icon: '🏔️',
      secretary: 'Doug Burgum',
      secretaryTitle: 'Secretary of Interior',
      description: 'Manages federal lands, natural resources, and cultural heritage.',
      expandedDescription: 'Interior manages over 500 million acres of public lands - about one-fifth of the United States - including national parks, wildlife refuges, and recreational areas.',
      keyAgencies: [
        'National Park Service - Manages 423 national park units',
        'Bureau of Land Management - Oversees 245 million acres of public land',
        'U.S. Fish and Wildlife Service - Protects endangered species',
        'Bureau of Indian Affairs - Manages tribal relations and services'
      ],
      budget: '$18.9B',
      budgetYear: '2024'
    },
    {
      id: 'agriculture',
      name: 'Department of Agriculture',
      established: 'Established 1862',
      icon: '🌾',
      secretary: 'Brooke Rollins',
      secretaryTitle: 'Secretary of Agriculture',
      description: 'Develops policy on farming, forestry, rural communities, and food.',
      expandedDescription: 'USDA touches the lives of all Americans daily through food safety inspections, nutrition programs, and agricultural research. The department administers the Supplemental Nutrition Assistance Program (SNAP) serving 41 million people.',
      keyAgencies: [
        'Food Safety and Inspection Service - Ensures meat, poultry safety',
        'U.S. Forest Service - Manages national forests and grasslands',
        'Food and Nutrition Service - Administers SNAP and school meals',
        'Rural Development - Supports rural communities and businesses'
      ],
      budget: '$242B',
      budgetYear: '2024'
    },
    {
      id: 'commerce',
      name: 'Department of Commerce',
      established: 'Established 1903',
      icon: '📈',
      secretary: 'Howard Lutnick',
      secretaryTitle: 'Secretary of Commerce',
      description: 'Promotes economic growth, job creation, and sustainable development.',
      expandedDescription: 'Commerce drives American economic competitiveness through data collection, trade promotion, and innovation support. The department conducts the constitutionally-mandated census every decade.',
      keyAgencies: [
        'U.S. Census Bureau - Conducts population and economic surveys',
        'National Weather Service - Provides weather forecasts and warnings',
        'Patent and Trademark Office - Protects intellectual property',
        'International Trade Administration - Promotes U.S. exports'
      ],
      budget: '$16.3B',
      budgetYear: '2024'
    },
    {
      id: 'labor',
      name: 'Department of Labor',
      established: 'Established 1913',
      icon: '👷',
      secretary: 'Lori Chavez-DeRemer',
      secretaryTitle: 'Secretary of Labor',
      description: 'Promotes the welfare of wage earners and job seekers.',
      expandedDescription: 'The Labor Department protects workers\' rights, ensures safe working conditions, and provides employment services to millions of Americans. DOL enforces over 180 federal workplace laws.',
      keyAgencies: [
        'Occupational Safety and Health Administration - Ensures workplace safety',
        'Bureau of Labor Statistics - Collects economic and employment data',
        'Wage and Hour Division - Enforces fair labor standards',
        'Employment and Training Administration - Provides job training services'
      ],
      budget: '$97.5B',
      budgetYear: '2024'
    },
    {
      id: 'hhs',
      name: 'Health & Human Services',
      established: 'Established 1953',
      icon: '🏥',
      secretary: 'Robert F. Kennedy Jr.',
      secretaryTitle: 'Secretary of HHS',
      description: 'Protects health and provides essential human services.',
      expandedDescription: 'HHS touches the lives of more Americans than any other federal agency, administering Medicare and Medicaid programs that serve over 140 million people.',
      keyAgencies: [
        'Centers for Disease Control and Prevention - Disease surveillance and prevention',
        'Food and Drug Administration - Regulates food, drugs, and medical devices',
        'National Institutes of Health - Conducts and funds medical research',
        'Centers for Medicare & Medicaid Services - Administers health insurance programs'
      ],
      budget: '$1.772T',
      budgetYear: '2024'
    },
    {
      id: 'hud',
      name: 'Housing & Urban Development',
      established: 'Established 1965',
      icon: '🏠',
      secretary: 'Scott Turner',
      secretaryTitle: 'Secretary of HUD',
      description: 'Develops and implements policies on housing and urban development.',
      expandedDescription: 'HUD works to ensure equal access to housing and promote community development nationwide. The department provides rental assistance to over 5 million low-income families.',
      keyAgencies: [
        'Federal Housing Administration - Provides mortgage insurance',
        'Community Development Block Grants - Funds local development projects',
        'Public Housing Programs - Manages affordable housing initiatives',
        'Office of Fair Housing - Enforces anti-discrimination laws'
      ],
      budget: '$61.7B',
      budgetYear: '2024'
    },
    {
      id: 'transportation',
      name: 'Department of Transportation',
      established: 'Established 1966',
      icon: '🚛',
      secretary: 'Sean Duffy',
      secretaryTitle: 'Secretary of Transportation',
      description: 'Ensures safe, efficient, and accessible transportation systems.',
      expandedDescription: 'DOT oversees the nation\'s transportation infrastructure, including 4 million miles of roads, 600,000 bridges, 140 airports, and 28,000 miles of waterways.',
      keyAgencies: [
        'Federal Aviation Administration - Regulates civil aviation safety',
        'Federal Highway Administration - Manages interstate highway system',
        'National Highway Traffic Safety Administration - Sets vehicle safety standards',
        'Federal Transit Administration - Supports public transportation'
      ],
      budget: '$145B',
      budgetYear: '2024'
    },
    {
      id: 'energy',
      name: 'Department of Energy',
      established: 'Established 1977',
      icon: '⚡',
      secretary: 'Chris Wright',
      secretaryTitle: 'Secretary of Energy',
      description: 'Manages nuclear weapons program and energy-related environmental cleanup.',
      expandedDescription: 'DOE manages the nation\'s nuclear weapons stockpile, operates 17 national laboratories, and leads federal energy research and development efforts.',
      keyAgencies: [
        'Nuclear Weapons Stewardship - Maintains nuclear arsenal safety and security',
        'Energy Research and Development - Funds clean energy innovation',
        'Environmental Cleanup - Remediates contaminated nuclear sites',
        'Strategic Petroleum Reserve - Manages emergency oil supplies'
      ],
      budget: '$45.8B',
      budgetYear: '2024'
    },
    {
      id: 'education',
      name: 'Department of Education',
      established: 'Established 1980',
      icon: '📚',
      secretary: 'Linda McMahon',
      secretaryTitle: 'Secretary of Education',
      description: 'Administers federal assistance to education and ensures equal access.',
      expandedDescription: 'The Education Department distributes over $80 billion annually in federal student aid, helping millions of students access higher education.',
      keyAgencies: [
        'Federal Student Aid - Administers grants, loans, and work-study programs',
        'Title I School Programs - Supports schools with high poverty rates',
        'Special Education Services - Ensures services for students with disabilities',
        'Office for Civil Rights - Enforces anti-discrimination laws in education'
      ],
      budget: '$79.6B',
      budgetYear: '2024'
    },
    {
      id: 'veterans',
      name: 'Department of Veterans Affairs',
      established: 'Established 1989',
      icon: '🎖️',
      secretary: 'Doug Collins',
      secretaryTitle: 'Secretary of Veterans Affairs',
      description: 'Provides vital services to America\'s veterans and their families.',
      expandedDescription: 'VA operates the nation\'s largest integrated healthcare system with over 1,200 facilities serving 9 million veterans annually.',
      keyAgencies: [
        'Veterans Health Administration - Operates medical centers and clinics',
        'Veterans Benefits Administration - Processes disability claims and benefits',
        'National Cemetery Administration - Manages veterans\' burial services',
        'GI Bill Programs - Provides educational benefits to veterans'
      ],
      budget: '$308.5B',
      budgetYear: '2024'
    },
    {
      id: 'dhs',
      name: 'Homeland Security',
      established: 'Established 2002',
      icon: '🔒',
      secretary: 'Kristi Noem',
      secretaryTitle: 'Secretary of DHS',
      description: 'Secures the nation from threats and manages border security.',
      expandedDescription: 'DHS protects the United States from diverse threats through unified national effort. The department manages border security at 328 ports of entry.',
      keyAgencies: [
        'U.S. Customs and Border Protection - Secures borders and facilitates trade',
        'Immigration and Customs Enforcement - Enforces immigration laws',
        'Transportation Security Administration - Secures transportation systems',
        'Cybersecurity and Infrastructure Security Agency - Protects critical infrastructure'
      ],
      budget: '$101.6B',
      budgetYear: '2024'
    }
  ];


  // Fetch federal employees data
  useEffect(() => {
    const fetchFederalEmployeesData = async () => {
      try {
        setIsLoadingFederalData(true);
        const response = await fetch('/data/federal_employees_data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch federal employees data');
        }
        const data: FederalEmployeesResponse = await response.json();
        setFederalEmployeesData(data.observations.observations);
      } catch (error) {
        console.error('Error fetching federal employees data:', error);
      } finally {
        setIsLoadingFederalData(false);
      }
    };

    fetchFederalEmployeesData();
  }, []);

  // Filter data based on time range
  const getFilteredData = () => {
    if (!federalEmployeesData.length) return [];
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '1Y':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '3Y':
        cutoffDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        break;
      case '5Y':
        cutoffDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      default:
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }
    
    return federalEmployeesData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  useEffect(() => {
    // Add/remove modal-open class to body
    if (expandedDepartment) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [expandedDepartment]);

  useEffect(() => {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => observer.observe(section));

    // Scroll progress indicator
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      const progressBar = document.querySelector('.scroll-progress') as HTMLElement;
      if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
      }
    };

    window.addEventListener('scroll', updateScrollProgress);

    // Keyboard support for closing modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedDepartment) {
        setExpandedDepartment(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      sections.forEach(section => observer.unobserve(section));
      window.removeEventListener('scroll', updateScrollProgress);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedDepartment]);


  // Prepare federal employees chart data
  const filteredFederalData = getFilteredData();
  const federalEmployeesChartData = {
    labels: filteredFederalData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Federal Employees',
        data: filteredFederalData.map(item => parseInt(item.value) * 1000),
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#0d9488',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.1,
      },
    ],
  };


  const federalEmployeesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 600,
          },
          color: '#333333',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#0d9488',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context: unknown[]) {
            const dataIndex = (context[0] as Record<string, unknown>).dataIndex as number;
            const item = filteredFederalData[dataIndex];
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            });
          },
          label: function (context: { parsed: { y: number } }) {
            const value = context.parsed.y;
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(2)} million employees`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(0)} thousand employees`;
            } else {
              return `${value.toLocaleString()} employees`;
            }
          },
        },
      },
    },
        scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: number | string) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M';
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'K';
            }
            return numValue.toLocaleString();
          },
          color: '#666666',
          font: {
            size: 12,
          },
        },
        grid: {
          color: '#e5e5e5',
          drawBorder: false,
        },
        title: {
          display: true,
          text: 'Number of Employees',
          color: '#333333',
          font: {
            size: 14,
            weight: 600,
          },
        },
      },
      x: {
        ticks: {
          color: '#666666',
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Time Period',
          color: '#333333',
          font: {
            size: 14,
            weight: 600,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
  };

  const expandDepartment = (deptId: string) => {
    setExpandedDepartment(expandedDepartment === deptId ? null : deptId);
  };

  return (
    <>
      <Header breadcrumb={{
        items: [
          { label: 'Home', href: '/' },
          { label: 'Federal Departments' }
        ]
      }} onMobileMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Fade-in Animation Styles */
        .section {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.25s ease-out;
        }
        .section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .scroll-indicator {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #f0f0f0;
          z-index: 1000;
        }

        .scroll-progress {
          height: 100%;
          background: #333;
          width: 0%;
          transition: width 0.1s ease;
        }

        /* Typography */
        body {
          font-family: system-ui, 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
          color: #333;
          background: #fff;
          line-height: 1.6;
          min-height: 100vh;
        }

        body.modal-open {
          overflow: hidden;
        }

        h1, h2, h3, .section-header h2 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #111;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        /* Layout & Spacing */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 80px;
          padding: 60px 0;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: #1a1a1a;
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        .page-header p {
          font-size: 1.1rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
          font-style: italic;
        }

        .section {
          margin-bottom: 70px;
          padding-bottom: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: none;
          padding-bottom: 0;
        }

        .section-header h2 {
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 15px;
          font-weight: 300;
          letter-spacing: -0.3px;
        }

        .section-header .section-description {
          font-size: 1rem;
          color: #888;
          font-style: italic;
        }

        /* Department Grid */
        .department-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .department-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e5e7eb;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }

        .department-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }


        .department-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .department-icon {
          width: 50px;
          height: 50px;
          background: #0d9488;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 15px;
        }

        .department-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 5px;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .department-established {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .department-description {
          font-size: 0.95rem;
          color: #374151;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .department-stats {
          display: flex;
          justify-content: center;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0d9488;
          display: block;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999;
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .modal-overlay.active {
          opacity: 1;
        }

        /* Modal Content */
        .modal-content {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          max-width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 1000;
          background: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 2rem;
        }

        /* Close Button */
        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #e5e5e5;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #d1d5db;
        }

        /* Chart Styles */
        .chart-container {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
          position: relative;
          height: 400px;
        }

        /* Dropdown hover effects */
        .dropdown-parent:hover .dropdown-menu {
          display: block !important;
        }
        
        /* Dropdown link hover effects */
        .dropdown-parent:hover .dropdown-menu a:hover {
          background: #f8f9fa;
          color: #0d9488;
          padding-left: 2rem;
        }
        
        /* Dropdown arrow effects */
        .dropdown-parent:hover .dropdown-menu a::before {
          content: "→";
          opacity: 1;
          margin-right: 0.5rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .department-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px 10px;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .department-card {
            padding: 20px;
          }
        }
      `}</style>

      {/* Scroll Progress Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-progress"></div>
      </div>

      {/* Modal Overlay */}
      {expandedDepartment && (
        <div 
          className="modal-overlay active"
          onClick={() => setExpandedDepartment(null)}
        />
      )}

      {/* Modal Content */}
      {expandedDepartment && (
        <div className="modal-content">
          <button
            onClick={() => setExpandedDepartment(null)}
            className="close-button"
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: '#e5e5e5',
              border: 'none',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 1001
            }}
          >
            ×
          </button>
          {(() => {
            const dept = departments.find(d => d.id === expandedDepartment);
            if (!dept) return null;
            
            return (
              <div>
                <div className="department-header">
                  <div className="department-icon">
                    {dept.icon}
                  </div>
                  <div>
                    <h3 className="department-title">
                      {dept.name}
                    </h3>
                    <div className="department-established">
                      {dept.established}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem'
                  }}>
                    {dept.secretaryTitle}
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1a1a1a'
                  }}>
                    {dept.secretary}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '0.95rem',
                  color: '#555555',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  {dept.expandedDescription}
                </div>
                
                <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Key Agencies & Functions:</h4>
                <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                  {dept.keyAgencies.map((agency, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{agency}</li>
                  ))}
                </ul>

                <div className="department-stats">
                  <div className="stat-item">
                    <span className="stat-value">{dept.budget}</span>
                    <div className="stat-label">{dept.budgetYear} Annual Budget</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}


      <Navigation currentPath="/departments" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu}>
      {/* Scroll Progress Indicator */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: '#f0f0f0',
        zIndex: 1000
      }}>
        <div id="scrollProgress" style={{
          height: '100%',
          background: '#333',
          width: '0%',
          transition: 'width 0.1s ease'
        }}></div>
      </div>

      <main role="main">
        <div className="container">
          {/* Header Content */}
          <header className="page-header" style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              zIndex: 10
            }}>
              <ShareButton
                title="Federal Departments & Agencies"
                description="Interactive exploration of the Executive Branch structure, cabinet-level departments, and the officials who lead America's vast federal bureaucracy"
                url="https://theinklined.com/departments"
              />
            </div>
            <h1>Federal Departments & Agencies</h1>
            <p>Interactive exploration of the Executive Branch structure, cabinet-level departments, and the officials who lead America&apos;s vast federal bureaucracy. Analyze organizational hierarchies, budgets, and operational mandates.</p>
            <div style={{
              marginTop: '30px',
              fontSize: '0.9rem',
              color: '#888'
            }}>
              Executive Branch Analysis
            </div>
          </header>

          {/* Executive Leadership Overview */}
          <section className="section">
            <div className="section-header">
              <h2>Executive Branch Leadership</h2>
              <div className="section-description">Current administration leadership structure</div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: '3rem',
              alignItems: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#f8f9fa',
                border: '1px solid #e5e5e5',
                transition: 'all 0.3s ease',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.5rem'
                }}>
                  Chief of Staff
                </div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  marginBottom: '1rem'
                }}>
                  Susie Wiles
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#555555',
                  lineHeight: '1.5'
                }}>
                  Senior White House Official and Presidential Advisor
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#fff',
                border: '2px solid #0d9488',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.1)',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.5rem'
                }}>
                  President
                </div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  marginBottom: '1rem'
                }}>
                  Donald J. Trump
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#555555',
                  lineHeight: '1.5'
                }}>
                  Chief Executive and Commander in Chief
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#f8f9fa',
                border: '1px solid #e5e5e5',
                transition: 'all 0.3s ease',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.5rem'
                }}>
                  Vice President
                </div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  marginBottom: '1rem'
                }}>
                  J.D. Vance
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#555555',
                  lineHeight: '1.5'
                }}>
                  President of the Senate and Constitutional Successor
                </div>
              </div>
            </div>
          </section>


          {/* Federal Workforce Size Chart */}
          <section className="section">
            <div className="section-header">
              <h2>Federal Workforce Size Over Time</h2>
              <div className="section-description">Total number of federal employees across all departments and agencies</div>
            </div>
            
            {/* Time Range Selector */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem',
              gap: '0.5rem'
            }}>
              {(['1Y', '3Y', '5Y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    border: timeRange === range ? '2px solid #0d9488' : '2px solid #e5e5e5',
                    background: timeRange === range ? '#0d9488' : '#ffffff',
                    color: timeRange === range ? '#ffffff' : '#666666',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    if (timeRange !== range) {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.color = '#0d9488';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeRange !== range) {
                      e.currentTarget.style.borderColor = '#e5e5e5';
                      e.currentTarget.style.color = '#666666';
                    }
                  }}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="chart-container">
              {isLoadingFederalData ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px',
                  fontSize: '1.1rem',
                  color: '#666666'
                }}>
                  Loading federal workforce data...
                </div>
              ) : (
                <Line data={federalEmployeesChartData} options={federalEmployeesChartOptions} />
              )}
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem',
                color: '#333333'
              }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  background: '#0d9488'
                }}></span>
                <span>Total federal employees</span>
              </div>
              <p style={{
                fontSize: '0.85rem',
                color: '#666666',
                textAlign: 'center',
                maxWidth: '700px',
                lineHeight: '1.5',
                margin: '0'
              }}>
                <strong>Data Source:</strong> U.S. Bureau of Labor Statistics via FRED (Federal Reserve Economic Data). 
                Data represents monthly employment figures for all federal government employees, including civilian and military personnel.
              </p>
            </div>
          </section>

          {/* Department Overview Dashboard */}
          <section className="section">
            <div className="section-header">
              <h2>Department Overview Dashboard</h2>
              <div className="section-description">Interactive exploration of federal departments and agencies</div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              gap: '2rem'
            }}>
              <div style={{
                textAlign: 'center',
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                minWidth: '150px'
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  display: 'block'
                }}>
                  15
                </span>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '0.3rem'
                }}>
                  Cabinet Departments
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                minWidth: '150px'
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  display: 'block'
                }}>
                  $6.8T
                </span>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '0.3rem'
                }}>
                  2024 Total Budget
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                minWidth: '150px'
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#0d9488',
                  display: 'block'
                }}>
                  {federalEmployeesData.length > 0 
                    ? (parseInt(federalEmployeesData[federalEmployeesData.length - 1].value) * 1000).toLocaleString()
                    : '--'
                  }
                </span>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '0.3rem'
                }}>
                  Total Federal Employees
                </div>
              </div>
            </div>

            {/* Department Grid */}
            <div className="department-grid">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => expandDepartment(dept.id)}
                  className="department-card"
                >

                  <div className="department-header">
                    <div className="department-icon">
                      {dept.icon}
                    </div>
                    <div>
                      <h3 className="department-title">
                        {dept.name}
                      </h3>
                      <div className="department-established">
                        {dept.established}
                      </div>
                    </div>
                  </div>

                  <div className="department-description">
                    <strong>Secretary:</strong> {dept.secretary}
                  </div>

                  <div className="department-stats">
                    <div className="stat-item">
                      <span className="stat-value">{dept.budget}</span>
                      <div className="stat-label">{dept.budgetYear} Annual Budget</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#1a1a1a',
        color: '#ffffff',
        padding: '3rem 0 2rem 0',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <Link href="/" style={{
              fontSize: '2rem',
              fontWeight: '800',
              textDecoration: 'none',
              color: '#ffffff',
              letterSpacing: '0.08em',
              fontFamily: 'Georgia, Times New Roman, serif',
              textTransform: 'uppercase'
            }}>
              In<span style={{ color: '#0d9488', fontWeight: '900' }}>k</span>lined<span style={{ color: '#0d9488', fontWeight: '900' }}>.</span>
            </Link>
            <div style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/transparency" style={{
                color: '#cccccc',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
              }}>
                Transparency
              </Link>
              <Link href="/about" style={{
                color: '#cccccc',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
              }}>
                About
              </Link>
              <Link href="/contact" style={{
                color: '#cccccc',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
              }}>
                Contact
              </Link>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #333333',
            paddingTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#888888'
          }}>
            <p>&copy; 2025 Inklined. All rights reserved. | Political analysis and data transparency.</p>
          </div>
        </div>
      </footer>
      </Navigation>

    </>
  );
}