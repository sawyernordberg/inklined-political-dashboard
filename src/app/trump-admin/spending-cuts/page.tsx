'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Header from '../../../components/Header';

interface CutItem {
  title: string;
  amount?: string;
  summary: string;
  reasoning: string;
  method: string;
  source?: string;
}

interface Category {
  name: string;
  description: string;
  cuts: CutItem[];
}

interface CutsData {
  categories: Category[];
}

export default function SpendingCutsPage() {
  const [data, setData] = useState<CutsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    async function loadData() {
      try {
        // Comprehensive spending cuts data with sources
        const mockData = {
          categories: [
            {
              name: 'Healthcare & Medical',
              description: 'Cuts to healthcare programs, medical research, and public health initiatives',
              cuts: [
                {
                  title: 'Medicaid',
                  amount: 'Cuts $1.2 trillion over 10 years',
                  summary: 'The "One Big Beautiful Bill Act" implemented working requirements for adults aged 19-64, restricted state provider tax usage, and increased eligibility verification requirements to curb the use of Medicaid by illegal immigrants.',
                  reasoning: 'The administration claimed to target "waste, fraud and abuse" while not affecting "deserving beneficiaries."',
                  method: 'Congressional legislation',
                  source: 'https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-across-the-states-enacted-reconciliation-package/'
                },
                {
                  title: 'Rural Hospital Funding',
                  amount: 'Cuts $87 billion over 10 years',
                  summary: 'Despite a $50 billion offset program, rural hospitals now face Medicaid reimbursement cuts of 15-29% across states.',
                  reasoning: 'To eliminate waste and return control to states.',
                  method: 'Congressional legislation',
                  source: 'https://www.kff.org/medicaid/how-might-federal-medicaid-cuts-in-the-enacted-reconciliation-package-affect-rural-areas/'
                },
                {
                  title: 'Health Insurance Marketplace',
                  amount: 'Cuts $335 billion over 10 years',
                  summary: 'Trump sought not to extend the enhanced premium tax credits, while the "Big Beautiful Bill" terminates automatic reenrollment, creates shorter enrollment periods, and increases paperwork requirements for the ACA marketplace.',
                  reasoning: 'Reduce federal healthcare spending and eliminate fraud.',
                  method: 'Congressional legislation',
                  source: 'https://www.cbo.gov/system/files/2024-06/60437-Arrington-Smith-Letter.pdf'
                },
                {
                  title: 'NIH Grants',
                  amount: '$9.5 billion in funding was cut',
                  summary: '2,100 active research grants across universities, with 160+ clinical trials were terminated.',
                  reasoning: 'These grants "no longer effectuate agency priorities" according to notifications from the NIH.',
                  method: 'Administrative termination',
                  source: 'https://www.reuters.com/business/healthcare-pharmaceuticals/nih-scientists-speak-out-over-estimated-12-billion-trump-funding-cuts-2025-06-09/'
                },
                {
                  title: 'National Institutes of Health Budget',
                  amount: 'Cuts $18 billion',
                  summary: 'Trump\'s 2026 budget request cuts the NIH\'s discretionary budget by approximately 40%, shifting from $48 to $27.5 billion. The budget reduction will follow a consolidation of the 27 institutes into 8.',
                  reasoning: 'To "focus on true science."',
                  method: 'Administrative budget reduction'
                },
                {
                  title: 'National Cancer Institute Budget',
                  amount: 'Cuts $2.7 billion',
                  summary: 'The NCI\'s budget will be cut by 38% from $7.2 billion to $4.5 billion.',
                  reasoning: 'To "focus on true science."',
                  method: 'Administrative budget reduction'
                },
                {
                  title: 'National Institute of Allergy and Infectious Diseases Budget',
                  amount: 'Cuts $2.4 billion',
                  summary: 'The NIAID will face a budget cut of about 36%, shifting from $6.6 billion to $4.2 billion.',
                  reasoning: 'To "focus on true science."',
                  method: 'Administrative budget reduction'
                },
                {
                  title: 'National Institute of Aging',
                  amount: 'Cuts $1.7 billion',
                  summary: 'The NIA\'s budget will be reduced by 39% from $4.4 billion to $2.7 billion.',
                  reasoning: 'To "focus on true science."',
                  method: 'Administrative budget reduction'
                },
                {
                  title: 'NIH Indirect Cost Rate Cap',
                  summary: 'The administration has capped facilities and administrative costs at 15%. This figure is down from the 30% average, with some costs previously up to 56%. This policy is facing ongoing court challenges.',
                  reasoning: 'To ensure taxpayer funds go to "direct research costs rather than administrative overhead."',
                  method: 'Administrative policy changed',
                  source: 'https://www.highereddive.com/news/tracking-the-trump-administrations-moves-to-cap-indirect-research-funding/751123/#:~:text=What%20happened?,Trump%20administration\'s%20indirect%20cost%20caps.'
                },
                {
                  title: 'Defense Health Research Consortium',
                  amount: 'Cuts $859 million',
                  summary: 'The Defense Health Research Consortium is a federal medical research program. Each year, nearly half of its funding goes toward cancer. Its funding has been slashed by 57% in Congress, leaving around $645 million.',
                  reasoning: 'Focus defense spending on core military capabilities.',
                  method: 'Congressional legislation',
                  source: 'https://defensehealthresearch.com/'
                },
                {
                  title: 'COVID-19 Era Public Health Grants',
                  amount: 'Cuts $11.4 billion',
                  summary: 'The Trump administration has eliminated COVID-era grants for addiction, mental health, overdose prevention, public health infrastructure, immunization and other projects related to public health.',
                  reasoning: 'The pandemic was declared over and funding is no longer needed.',
                  method: 'Administrative termination',
                  source: 'https://www.npr.org/2025/03/27/nx-s1-5342368/addiction-trump-mental-health-funding'
                },
                {
                  title: 'SAMHSA',
                  amount: 'Cuts $1 billion',
                  summary: 'The Trump administration has canceled $1 billion in federal SAMHSA grants to states. These grants focus on mental health services, addiction treatment, and other health issues.',
                  reasoning: 'To consolidate programs into a new Administration for a Healthy America (AHA)',
                  method: 'Administrative termination',
                  source: 'https://abcnews.go.com/Politics/experts-concerned-trump-admin-cuts-mental-health-programs/story?id=125372658'
                },
                {
                  title: 'Health and Human Services Workforce',
                  summary: 'The Department of Health and Human Services has shed 20,000 employees from an 82,000-person workforce.',
                  reasoning: 'Create a new "Administration for a healthy America."',
                  method: 'Layoffs and attrition',
                  source: 'https://federalnewsnetwork.com/workforce/2025/07/hhs-finalizes-portion-of-employee-layoffs-following-supreme-court-ruling/'
                }
              ]
            },
            {
              name: 'Education',
              description: 'Cuts to student aid, educational programs, and university research funding',
              cuts: [
                {
                  title: 'Student Loan Program',
                  amount: 'Cuts $349 billion over 10 years',
                  summary: 'The "Big Beautiful Bill" eliminates several income-driven repayment plans, tightened caps on graduate and undergraduate loans, as well as reducing the maximum Pell grant amount and eligibility.',
                  reasoning: 'Reduce federal education spending.',
                  method: 'Congressional legislation',
                  source: 'https://www.cbo.gov/publication/61412'
                },
                {
                  title: 'Federal Supplemental Educational Opportunity Grant (FSEOG)',
                  amount: 'Cuts $910 million',
                  summary: 'The FSEOG program, a form of federal financial aid for higher education, was completely eliminated due to its contribution "to rising college costs" and funding toward "radical leftist ideology."',
                  reasoning: 'Reduce federal education spending and eliminate "radical leftist ideology."',
                  method: 'Congressional legislation'
                },
                {
                  title: 'Federal Work-Study Program',
                  amount: '$980 million reduction from $1.2 billion',
                  summary: 'The work-study program aims to provide students with part-time employment to help cover college tuition. The federal contribution was reduced from 75% to 25% of wages, and remaining funding for the program is $220 million.',
                  reasoning: 'Reduce federal education spending.',
                  method: 'Congressional legislation'
                },
                {
                  title: 'K-12 Special Programs',
                  amount: 'Cuts $4.5 billion out of $6.5 billion',
                  summary: 'The new budget reduces funding to programs supporting rural schools, at-risk students, school safety, homeless students, arts education, teacher training, and literacy instruction, as well as other things. Funding would decrease to $2 billion.',
                  reasoning: 'Reduce federal education spending.',
                  method: 'Congressional legislation'
                },
                {
                  title: 'TRIO Programs',
                  amount: 'Cuts $1.2 billion',
                  summary: 'The administration has eliminated federal programs helping low-income, first-generation, and disabled students access higher education.',
                  reasoning: 'Reduce federal education spending.',
                  method: 'Congressional legislation'
                },
                {
                  title: 'Minority-Serving Institution (MSI) Grants',
                  amount: 'Cuts $350 million',
                  summary: 'The cuts end 2025 discretionary funding for several MSI grant programs, which serve to fund minority education programs.',
                  reasoning: 'The programs are "racially discriminatory" according to a press release from the Department of Education.',
                  method: 'Administrative Termination',
                  source: 'https://thehill.com/homenews/education/5498182-trump-admin-grants-minority-student-population/'
                },
                {
                  title: 'NSF Grants',
                  amount: '$1.4 billion in funding was cut',
                  summary: '1,752 grants in climate research, and DEI were terminated across US universities. 114 awards were restored to the University of California, all other grants are yet to be formally restored.',
                  reasoning: 'These grants are no longer "aligned with agency priorities."',
                  method: 'Administrative termination',
                  source: 'https://cossa.org/nsf-releases-list-of-terminated-grants/'
                },
                {
                  title: 'University Funding',
                  summary: 'Multiple universities have faced significant federal funding cuts and freezes affecting research programs.',
                  reasoning: 'Reduce federal education spending and eliminate "radical leftist ideology."',
                  method: 'Administrative termination'
                },
                {
                  title: 'Department of Education Workforce',
                  summary: 'Trump has eliminated nearly half of the Education Department workforce from 4,133 to 2,183 employees through layoffs and buyouts.',
                  reasoning: 'The federal education system has "plainly failed our children" and "does not educate anyone."',
                  method: 'Executive order',
                  source: 'https://www.npr.org/2025/03/12/nx-s1-5325854/trump-education-department-layoffs-civil-rights-student-loans'
                }
              ]
            },
            {
              name: 'Energy & Environment',
              description: 'Cuts to environmental protection, energy efficiency, and climate programs',
              cuts: [
                {
                  title: 'Sustainable Energy Tax Credits',
                  amount: 'Cuts $699 billion',
                  summary: 'The "Big Beautiful Bill" terminated electric vehicle tax credits, wind and solar production credits, clean energy manufacturing incentives, and energy storage credits, which were created under the 2022 Inflation Reduction Act.',
                  reasoning: 'Eliminate "subsidies for unreliable energy sources" and end "Green New Deal" policies.',
                  method: 'Congressional legislation',
                  source: 'Inklined estimate'
                },
                {
                  title: 'Clean Energy Grants',
                  amount: 'Cuts $3.7 billion',
                  summary: 'The administration has canceled 24 carbon capture projects including $540 million to Calpine Corporation and projects across 21 states. The administration has also imposed a 15% indirect cost rate cap for all grant awards, down from 50-60%.',
                  reasoning: 'The projects "failed to advance the energy needs of the American people."',
                  method: 'Administrative termination',
                  source: 'https://www.google.com/search?client=safari&rls=en&q=trump+cuts+%243.7+billion+of+cean+energy+grants&ie=UTF-8&oe=UTF-8'
                },
                {
                  title: 'EPA Environmental Justice Grants',
                  amount: 'Cuts $2.4 billion',
                  summary: 'The EPA has suspended almost 400 grants targeted toward aiding environmental justice. These grants were created to aid disadvantaged communities and reduce the risk of pollution, improve drinking water infrastructure, and promote other environmental causes.',
                  reasoning: 'The grants "no longer effectuate program goals or agency priorities."',
                  method: 'Administrative termination',
                  source: 'https://www.ehn.org/trump-administration-moves-to-eliminate-2-4-billion-in-environmental-justice-grants'
                },
                {
                  title: 'EPA Green Bank',
                  amount: 'Cuts $20 billion',
                  summary: 'The Trump Administration and EPA Administrator, Lee Zeldin, has ended the Greenhouse Gas Reduction Fund grants for clean energy financing and environmental justice projects. The fund was originally created under the 2022 IRA.',
                  reasoning: 'Zeldin stated that terminating these grants was the "only way we can reduce waste, increase oversight and meet the intent of the law as it was written."',
                  method: 'Administrative termination',
                  source: 'https://apnews.com/article/epa-green-bank-zeldin-climate-trump-5168d11b7f63aeaf72001b50221c3c19'
                },
                {
                  title: 'U.S. Global Change Research Program (USGCRP)',
                  summary: 'Trump has eliminated the 35-year-old USGCRP, removing federal employees and taking down the national Climate Assessment website. The USGCRP was used to conduct federal research on changes in the global environment and climate.',
                  reasoning: 'Prevent climate research from being used to support environmental regulations.',
                  method: 'Contract terminations',
                  source: 'https://www.theguardian.com/us-news/2025/apr/09/trump-national-climate-assessment-usgcrf'
                },
                {
                  title: 'American Climate Corps',
                  summary: 'President Trump immediately terminated the climate jobs program, a program aimed at training young people for careers in climate and energy, on January 20th, 2025.',
                  reasoning: 'This action was part of an effort to eliminate "Green New Deal" programs.',
                  method: 'Executive order',
                  source: 'https://www.whitehouse.gov/presidential-actions/2025/01/unleashing-american-energy/'
                },
                {
                  title: 'Climate-Smart Agriculture Program',
                  amount: 'Cuts $3.1 billion',
                  summary: 'The Trump administration has terminated partnerships for the Climate-Smart Commodities Program supporting climate-friendly farming.',
                  reasoning: 'Eliminate climate-focused agricultural programs.',
                  method: 'Administrative termination',
                  source: 'https://www.reuters.com/world/us/trump-administration-cancels-3-billion-climate-friendly-farming-program-2025-04-14/'
                }
              ]
            },
            {
              name: 'Federal Workforce & Agencies',
              description: 'Reductions in government employment and agency staffing',
              cuts: [
                {
                  title: 'Total Federal Workforce',
                  summary: 'A total of at least 199,000 federal government employees have been laid off by the Trump administration or taken one of the administration\'s deferred resignation proposals.',
                  reasoning: 'Reduce federal government spending.',
                  method: 'Force procedures and voluntary buyouts',
                  source: 'https://ourpublicservice.org/federal-harms-tracker/cost-to-your-government/'
                },
                {
                  title: 'Veterans Affairs Workforce',
                  summary: 'The Department of Veterans Affairs plans to eliminate a total of 30,000 employees by the end of 2025 and has already lost 17,000 as of June 1, 2025.',
                  reasoning: 'VA Secretary Doug Collins is making a stab at \'reducing bureaucracy and improving services to Veterans."',
                  method: 'Attrition and hiring freezes',
                  source: 'https://news.va.gov/press-room/va-to-reduce-staff-by-nearly-30k-by-end-of-fy2025/'
                },
                {
                  title: 'Small Federal Agency Eliminations',
                  summary: 'President Trump terminated the Presidio Trust, Inter-American Foundation, U.S. African Development Foundation, U.S. Institute of Peace, Presidential Management Fellows Program, Federal Mediation and Conciliation Service, U.S. Agency for Global Media, Woodrow Wilson Center, Institute of Museum and Library Services, Minority Business Development Agency, Community Development Financial Institutions Fund, and U.S. Interagency Council on Homelessness.',
                  reasoning: '"Dramatically reduce the size of the Federal Government."',
                  method: 'Executive order',
                  source: 'https://www.whitehouse.gov/presidential-actions/2025/03/continuing-the-reduction-of-the-federal-bureaucracy/'
                },
                {
                  title: 'Small Business Administration Workforce',
                  summary: 'The administration has eliminated 2,700 out of the SBA\'s 6,500 jobs, representing a 43% workforce reduction.',
                  reasoning: 'Eliminate wasteful spending.',
                  method: 'Administrative reorganization',
                  source: 'https://www.sba.gov/article/2025/03/21/small-business-administration-announces-agency-wide-reorganization'
                },
                {
                  title: 'FEMA Workforce',
                  summary: 'FEMA has experienced a loss of 2,000 full-time staff, one-third of its permanent workforce.',
                  reasoning: 'To eliminate inefficiency in the federal workforce.',
                  method: 'Firings and buyouts',
                  source: 'https://www.nytimes.com/2025/08/25/climate/fema-employees-letter-trump-katrina.html'
                },
                {
                  title: 'Department of State Workforce',
                  summary: 'The U.S. Department of State has laid off 1,350 employees, about 15% of its domestic workforce.',
                  reasoning: 'To increase government efficiency.',
                  method: 'Involuntary layoffs',
                  source: 'https://www.govexec.com/workforce/2025/08/state-department-laid-them-then-it-promoted-them/407720/'
                },
                {
                  title: 'Department of Interior',
                  summary: 'The DOI has eliminated a total of 2,300 employees, many of which were "probationary" employees.',
                  reasoning: 'To increase government efficiency.',
                  method: 'Administrative termination'
                },
                {
                  title: 'U.S. National Forest Service and U.S. National Park Service',
                  summary: 'The Trump administration has laid off 3,400 employees from the U.S. Forest Service, responsible for managing and maintaining public forests and grasslands, and another 1,000 from the U.S. National Park Service, responsible for preserving national parks.',
                  reasoning: 'To increase government efficiency.',
                  method: 'Administrative termination.',
                  source: 'https://www.reuters.com/world/us/us-forest-service-fires-3400-workers-park-service-cuts-1000-2025-02-14/'
                }
              ]
            },
            {
              name: 'Foreign Aid & International Programs',
              description: 'Cuts to foreign assistance, international organizations, and global programs',
              cuts: [
                {
                  title: 'Dissolution of USAID',
                  amount: 'Cuts $60 billion',
                  summary: 'President Trump terminated 90% of USAID\'s foreign aid contracts, totaling $60 billion, and terminated approximately 10,000 employees. Remaining contracts are likely to be managed by the State Department.',
                  reasoning: 'An executive order signed by Trump calls USAID "antithetical to American values."',
                  method: 'Executive order',
                  source: 'https://www.npr.org/sections/goats-and-soda/2025/02/26/nx-s1-5310673/usaid-trump-administration-global-health'
                },
                {
                  title: 'Additional USAID Funding Rescissions',
                  amount: 'Cuts $4.9 billion',
                  summary: 'President Trump unilaterally terminated congressionally approved USAID funds without congressional approval in late August as he tries to close out the agency.',
                  reasoning: 'Eliminate waste and corruption while putting "America First."',
                  method: 'Pocket rescission',
                  source: 'https://apnews.com/article/trump-foreign-aid-pocket-rescission-374c63e6b4004e819a657e33b76f502e'
                },
                {
                  title: 'Foreign Aid in the Rescissions Act of 2025',
                  summary: 'The bill cuts approximately $8.3 billion in foreign aid programs, halting global health initiatives (PEPFAR, Malaria Initiative), disaster relief, refugee assistance, and contributions to international organizations, like the Democracy Fund, Global Fund, and the Gavi Alliance.',
                  reasoning: 'President Trump claims these foreign aid programs are "antithetical to American interests."',
                  method: 'Congressional legislation',
                  source: 'https://www.cbsnews.com/news/senate-rescissions-package-foreign-aid-npr-pbs-funding/'
                }
              ]
            },
            {
              name: 'Social Programs & Services',
              description: 'Cuts to social safety net programs and public services',
              cuts: [
                {
                  title: 'SNAP',
                  amount: 'Cuts $186 billion over 10 years',
                  summary: 'The "Big Beautiful Bill" shifts costs to states while implementing additional work requirements with documentation and limiting growth of the Thrifty Food Plan.',
                  reasoning: 'Combat waste and fraud.',
                  method: 'Congressional legislation',
                  source: 'https://www.cbo.gov/publication/61570'
                },
                {
                  title: 'Public Broadcasting Funding',
                  amount: 'Cuts $1.1 billion',
                  summary: 'The Rescissions Act of 2025 directs the Corporation for Public Broadcasting (CPB) to cease all funding for NPR and PBS.',
                  reasoning: 'NPR and PBS spread "radical, woke propaganda disguised as \'news.\'"',
                  method: 'Congressional legislation',
                  source: 'https://www.npr.org/2025/07/18/nx-s1-5469912/npr-congress-rescission-funding-trump'
                },
                {
                  title: 'FEMA Building Resilient Infrastructure and Communities (BRIC) Program',
                  amount: 'Cuts $882 million',
                  summary: 'The Trump administration has entirely eliminated the FEMA BRIC program, which aided communities to reduce the risks of natural disasters.',
                  reasoning: 'The program was cited as "wasteful and ineffective" and focused on "political agendas."',
                  method: 'Administrative termination',
                  source: 'https://www.npr.org/2025/05/01/nx-s1-5359452/trump-disaster-funding-cuts-fema-bric'
                },
                {
                  title: 'Department of Justice Safety and Justice Grants',
                  amount: 'Cuts $811 million',
                  summary: 'The DOJ has terminated 365 grants worth a combined $811 million. These grants were used to fund trauma centers, crisis hotlines, victims\'s services, substance abuse treatment, and police training.',
                  reasoning: 'The grants were no longer aligned with agency priorities',
                  method: 'Administrative termination',
                  source: 'https://www.reuters.com/world/us/us-justice-dept-grant-cuts-valued-811-million-people-familiar-say-2025-04-24/'
                },
                {
                  title: 'National Endowment for the Humanities and Arts (NEH and NEA)',
                  summary: 'The Trump administration has terminated over 1,200 grants to the collective institutions. These grants were used to fund digitization projects, research, professional development programs, library renovations, and organizations, like National History Day. The NEH has seen a staff reduction of 65%, while Trump has reallocated funds in the NEA toward his plan for the National Garden of American Heroes.',
                  reasoning: 'To increase government efficiency.',
                  method: 'DOGE clawbacks and funding reallocation',
                  source: 'https://www.washingtonpost.com/style/2025/05/03/trump-budget-nea-neh-eliminate/'
                }
              ]
            },
            {
              name: 'DEI & Civil Rights Programs',
              description: 'Elimination of diversity, equity, and inclusion programs and personnel',
              cuts: [
                {
                  title: 'DEI Programs and Personnel',
                  summary: 'Department-Specific DEI Eliminations: Veterans Affairs: 60 DEI employees placed on leave; Department of Defence: Trump fired General Charles Brown Jr., the Chairman of the Joint Chiefs of Staff, along with 5 other top Pentagon officials. All other DEI offices in the DOD and DOHS were also eliminated; EPA: 171 EPA staffers were placed under administrative leave from teams responsible for DEI and environmental justice; Coast Guard: 12 DEI-focused members terminated.',
                  reasoning: 'DEI programs represent "illegal and immoral discrimination" and \'shameful discrimination" according to an executive order signed by president Trump.',
                  method: 'Firings and an executive order'
                },
                {
                  title: 'Federal Contractor Affirmative Action',
                  summary: 'President Trump revoked Executive Order 11246 requiring equal employment opportunity from federal contractors.',
                  reasoning: 'DEI programs represent "illegal and immoral discrimination" and \'shameful discrimination" according to an executive order signed by president Trump.',
                  method: 'Executive order'
                },
                {
                  title: 'Department of Defense Social Science Research',
                  amount: 'Cuts $30 million',
                  summary: 'The DOD has terminated the entire Minerva Research Initiative including AI combat ethics and extremism research. The initiative was originally created to fund U.S. universities with grants to conduct research on areas of importance to U.S. national security.',
                  reasoning: 'Focus on the "most impactful technologies" and "advanced military capabilities."',
                  method: 'Administrative termination',
                  source: 'https://www.war.gov/News/Releases/Release/article/4113076/pentagon-culls-social-science-research-prioritizes-fiscal-responsibility-and-te/'
                }
              ]
            }
          ]
        };
        
        setData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load spending cuts data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Fade in sections and scroll progress
  useEffect(() => {
    if (!data) return;

    const sections = document.querySelectorAll('.section');
    const cutItems = document.querySelectorAll('.cut-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
    cutItems.forEach(item => observer.observe(item));

    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      const progressBar = document.getElementById('scrollProgress');
      if (progressBar) {
        progressBar.style.width = `${scrolled}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      sections.forEach(section => observer.unobserve(section));
      cutItems.forEach(item => observer.unobserve(item));
      window.removeEventListener('scroll', handleScroll);
    };
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p>Loading Spending Cuts Dashboard...</p>
        <style dangerouslySetInnerHTML={{
          __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
        }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', textAlign: 'center', color: '#dc2626' }}>
        <h2>Error Loading Data</h2>
        <p>{error || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div>
      <Header breadcrumb={{
        items: [
          { label: 'Trump Administration', href: '/trump-admin' },
          { label: 'Spending Cuts' }
        ]
      }} onMobileMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />


      <Navigation currentPath="/trump-admin/spending-cuts" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu}>
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

      {/* Main Content */}
      <main role="main">
        <div className="container" style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <header className="header" style={{
            textAlign: 'center',
            marginBottom: '80px',
            padding: '60px 0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#1a1a1a',
              marginBottom: '20px',
              fontWeight: '400',
              letterSpacing: '-0.5px',
              fontFamily: 'Georgia, Times New Roman, serif'
            }}>
              Trump Administration Spending Cuts
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '800px',
              margin: '0 auto',
              fontStyle: 'italic'
            }}>
              A comprehensive overview of budget cuts, workforce reductions, and program eliminations implemented during the Trump administration&apos;s second term
            </p>
          </header>

          {/* Data Source Info */}
          <div style={{
            background: '#f8f9fa',
            borderLeft: '4px solid #0d9488',
            padding: '20px',
            margin: '30px 0',
            borderRadius: '0 8px 8px 0'
          }}>
            <strong style={{ color: '#0d9488' }}>Data Source:</strong> Federal Budget Analysis and Executive Orders
            <br />
            <small>Based on official budget documents, executive orders, and congressional legislation from the Trump administration</small>
          </div>

          {/* Categories */}
          {data.categories?.map((category, categoryIndex) => (
            <section key={categoryIndex} className="section" style={{
              marginBottom: '100px'
            }}>
              <div className="section-header" style={{
                textAlign: 'center',
                marginBottom: '60px',
                borderBottom: '2px solid #e0e0e0',
                paddingBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  color: '#1a1a1a',
                  marginBottom: '15px',
                  fontWeight: '300',
                  letterSpacing: '-0.3px',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}>
                  {category.name}
                </h2>
                <div className="section-description" style={{
                  fontSize: '1rem',
                  color: '#888',
                  fontStyle: 'italic'
                }}>
                  {category.description}
                </div>
              </div>

              <div className="cuts-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '50px'
              }}>
                {category.cuts?.filter(cut => cut.source).map((cut, cutIndex) => (
                  <div key={cutIndex} className="cut-item" style={{
                    padding: '30px 0 45px 0',
                    borderTop: '8px solid #000',
                    transition: 'all 0.2s ease',
                    width: '75%',
                    marginLeft: cutIndex % 2 === 0 ? '0' : 'auto',
                    marginRight: cutIndex % 2 === 0 ? 'auto' : '0'
                  }}>
                    <div className="cut-title" style={{
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      fontFamily: 'Georgia, Times New Roman, serif'
                    }}>
                      {cut.title}
                      {cut.amount && (
                        <span className="cut-amount" style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          fontWeight: '400',
                          fontStyle: 'italic',
                          textDecoration: 'underline'
                        }}>
                          {cut.amount}
                        </span>
                      )}
                    </div>

                    <div className="cut-summary" style={{
                      fontSize: '1rem',
                      color: '#444',
                      marginBottom: '25px',
                      lineHeight: '1.7',
                      position: 'relative'
                    }}>
                      {cut.summary}
                      {cut.source && cut.source !== 'Inklined estimate' && (
                        <div style={{
                          marginTop: '10px',
                          fontSize: '0.85rem'
                        }}>
                          <Link 
                            href={cut.source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#0d9488',
                              textDecoration: 'none',
                              fontWeight: '500'
                            }}
                          >
                            Source →
                          </Link>
                        </div>
                      )}
                      {cut.source === 'Inklined estimate' && (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          fontSize: '0.7rem',
                          color: '#888',
                          fontStyle: 'italic'
                        }}>
                          Inklined estimate
                        </div>
                      )}
                    </div>

                    <div className="cut-details" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '30px',
                      marginTop: '20px'
                    }}>
                      <div className="detail-section" style={{
                        padding: '0'
                      }}>
                        <div className="detail-label" style={{
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '8px',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Reasoning
                        </div>
                        <div className="detail-text" style={{
                          color: '#555',
                          fontSize: '0.95rem',
                          lineHeight: '1.6'
                        }}>
                          {cut.reasoning}
                        </div>
                      </div>

                      <div className="detail-section" style={{
                        padding: '0'
                      }}>
                        <div className="detail-label" style={{
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '8px',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Method
                        </div>
                        <div className="detail-text" style={{
                          color: '#555',
                          fontSize: '0.95rem',
                          lineHeight: '1.6'
                        }}>
                          {cut.method}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Summary Section */}
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
            marginBottom: '2rem'
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
              alignItems: 'center'
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

      {/* Global Styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: system-ui, 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
          color: #333;
          background: #fff;
          line-height: 1.6;
          min-height: 100vh;
        }
        
        h1, h2, h3, .section-header h2 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #111;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        
        .section {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.25s ease-out;
        }
        
        .section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .cut-item {
          opacity: 0;
          transform: translateX(-30px);
          transition: all 0.2s ease-out;
        }
        
        .cut-item:nth-child(even) {
          transform: translateX(30px);
        }
        
        .cut-item.fade-in {
          opacity: 1;
          transform: translateX(0) !important;
        }
        

        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }
        
        .error {
          background: #fef2f2;
          border: '1px solid #fecaca';
          color: #dc2626;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        
        a:hover {
          color: #0d9488;
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
        
        @media (max-width: 768px) {
          .cuts-container {
            gap: 30px !important;
          }
          
          .cut-item,
          .cut-item:nth-child(even),
          .cut-item:nth-child(odd) {
            width: 100% !important;
            margin: 0 !important;
            transform: translateY(20px) !important;
          }
          
          .cut-item.fade-in {
            transform: translateY(0) !important;
          }
          
          .cut-title {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .cut-details {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </Navigation>
    </div>
  );
}
