'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Header from '../../../components/Header';
import ShareButton from '../../../components/ShareButton';
import MobileMenuProvider from '../../../components/MobileMenuProvider';
import ScrollEffects from '../../../components/ScrollEffects';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
);

// Export interface for reuse
export interface EconomicData {
  integrated: Record<string, unknown>;
  tariff: Record<string, unknown>;
  stock: Record<string, unknown>;
  trumpCurrent: Record<string, unknown> | null;
}

interface EconomicPolicyPageClientProps {
  data: EconomicData;
}

export default function EconomicPolicyPageClient({ data }: EconomicPolicyPageClientProps) {
  const [selectedPresident, setSelectedPresident] = useState('trump_current');
  const [selectedTimeframe, setSelectedTimeframe] = useState('days_100');

  // Fade in sections
  useEffect(() => {

    // Fade in sections
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  // Helper function to get president data
  const getPresidentData = (presidentKey: string, maxDays: number) => {
    console.log('getPresidentData called with:', { presidentKey, maxDays, hasData: !!data, hasStock: !!data?.stock });
    
    const presidentMapping: { [key: string]: string } = {
      'trump_current': 'Donald Trump (2nd Term)',
      'trump_first': 'Donald Trump',
      'biden': 'Joe Biden',
      'obama_first': 'Barack Obama',
      'bush': 'George W. Bush',
      'bush_hw': 'George H.W. Bush',
      'reagan': 'Ronald Reagan',
      'carter': 'Jimmy Carter'
    };

    const presidentName = presidentMapping[presidentKey];
    console.log('President mapping result:', { presidentKey, presidentName });
    
    if (!presidentName || !data?.stock?.presidential_data?.[presidentName]) {
      console.log('No president data found for:', { presidentName, hasPresidentialData: !!data?.stock?.presidential_data });
      return [];
    }

    const presidentData = data.stock.presidential_data[presidentName];
    console.log('President data found:', { 
      hasDailyData: !!presidentData.daily_data, 
      dailyDataLength: presidentData.daily_data?.length || 0,
      sampleEntry: presidentData.daily_data?.[0]
    });
    
    if (!presidentData.daily_data || !Array.isArray(presidentData.daily_data)) {
      console.log('No daily data array found');
      return [];
    }

    const startDate = new Date(presidentData.period.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + maxDays - 1);
    
    const filteredData = presidentData.daily_data.filter((entry: Record<string, unknown>) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    console.log('Filtered data result:', { 
      originalLength: presidentData.daily_data.length, 
      filteredLength: filteredData.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    return filteredData;
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

    // Prepare chart data
  const chartData = useMemo(() => {
    console.log('Preparing chart data with:', { data: !!data, selectedPresident, selectedTimeframe });
    
    if (!data) return null;
    
    const maxDays = selectedTimeframe === 'days_100' ? 100 : 
                   selectedTimeframe === 'days_365' ? 365 : 
                   selectedTimeframe === 'days_730' ? 730 : 1461;

    const trumpCurrentData = getPresidentData('trump_current', maxDays);
    
    console.log('Trump current data:', { length: trumpCurrentData?.length, sample: trumpCurrentData?.[0] });
    
    if (!trumpCurrentData || trumpCurrentData.length === 0) return null;
    
    // Calculate percentage change from starting value (starting at 0%)
    const trumpStartValue = trumpCurrentData[0]?.close || 1;
    const trumpNormalizedData = trumpCurrentData.map((d: Record<string, unknown>) => (((d.close as number) / trumpStartValue) - 1) * 100);
    
    // Get comparison data if different president selected
    const comparisonData = selectedPresident !== 'trump_current' ? 
                          getPresidentData(selectedPresident, maxDays) : null;
    
    const datasets: Array<Record<string, unknown>> = [{
      label: 'Trump (Current)',
      data: trumpNormalizedData,
      rawData: trumpCurrentData,
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      borderWidth: 3,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 6
    }];
    
    // Add comparison data if available
    if (comparisonData && comparisonData.length > 0) {
      const comparisonStartValue = comparisonData[0]?.close || 1;
      const comparisonNormalizedData = comparisonData.map((d: Record<string, unknown>) => (((d.close as number) / comparisonStartValue) - 1) * 100);
      
      datasets.push({
        label: `Comparison (${selectedPresident})`,
        data: comparisonNormalizedData,
        rawData: comparisonData,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderDash: [5, 5]
      });
    }
    
    const result = {
      labels: trumpCurrentData.map((d: Record<string, unknown>) => formatDate(d.date)),
      datasets: datasets
    };
    
    console.log('Final chart data:', { 
      labelsCount: result.labels.length, 
      datasetsCount: result.datasets.length,
      firstDataset: result.datasets[0]?.data?.length || 0
    });
    
    return result;
  }, [data, selectedPresident, selectedTimeframe]);

  const renderStockChart = () => {
    console.log('renderStockChart called, data exists:', !!data, 'chartData exists:', !!chartData);
    
    if (!data) {
      console.log('renderStockChart: returning null - no data');
      return null;
    }

    if (!chartData) {
      console.log('renderStockChart: returning debug info - no chart data');
      const trumpCurrentData = getPresidentData('trump_current', selectedTimeframe === 'days_100' ? 100 : 
                                              selectedTimeframe === 'days_365' ? 365 : 
                                              selectedTimeframe === 'days_730' ? 730 : 1461);
      
      // Test chart with hardcoded data to see if Line component works
      const testChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Test Data',
          data: [65, 59, 80, 81, 56],
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.1
        }]
      };
      
      return (
        <div>
          <div style={{ padding: '20px', background: '#fff3cd', border: '2px solid #ffeaa7', borderRadius: '8px', margin: '20px 0' }}>
            <h4>Stock Chart Debug Info</h4>
            <p>Trump current data points: {trumpCurrentData?.length || 0}</p>
            <p>Stock data exists: {!!data?.stock ? 'Yes' : 'No'}</p>
            <p>Presidential data exists: {!!data?.stock?.presidential_data ? 'Yes' : 'No'}</p>
            <p>Trump 2nd Term data exists: {!!data?.stock?.presidential_data?.["Donald Trump (2nd Term)"] ? 'Yes' : 'No'}</p>
            {data?.stock?.presidential_data?.["Donald Trump (2nd Term)"] && (
              <p>Daily data points: {data.stock.presidential_data["Donald Trump (2nd Term)"].daily_data?.length || 0}</p>
            )}
            <p>Chart data prepared: {!!chartData ? 'Yes' : 'No'}</p>
          </div>
          
          <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
            <h4>Test Chart (to verify Line component works)</h4>
            <Line data={testChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
              plugins: { 
                legend: { display: true },
                tooltip: {
                  mode: 'index' as const,
                  intersect: false,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: '#666',
                  borderWidth: 1,
                  cornerRadius: 6,
                  displayColors: true
                }
              },
              elements: {
                point: {
                  hoverRadius: 6,
                  radius: 0
                },
                line: {
                  tension: 0.1
                }
              }
            }} />
          </div>
        </div>
      );
    }

    console.log('renderStockChart: rendering Line chart with', chartData.datasets.length, 'datasets');
    
          const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 20,
            left: 20,
            top: 20,
            bottom: 20
          }
        },
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top' as const
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#666',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            callbacks: {
              label: function(context: Record<string, unknown>) {
                const value = context.parsed.y;
                const datasetIndex = context.datasetIndex;
                const dataIndex = context.dataIndex;
                
                const chartData = context.chart.data.datasets[datasetIndex].rawData || [];
                const actualValue = chartData[dataIndex]?.close || 0;
                
                return `${context.dataset.label}: ${value.toFixed(1)}% ($${actualValue.toLocaleString()})`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            },
            grid: {
              color: '#e5e5e5'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'S&P 500 Performance (%)'
            },
            grid: {
              color: '#e5e5e5'
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 6,
            radius: 0
          },
          line: {
            tension: 0.1
          }
        }
      };
    
    return (
      <div style={{ width: '100%', height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };


    const [expandedTariffDropdowns, setExpandedTariffDropdowns] = useState<Set<number>>(new Set());
  const [expandedTaxDropdowns, setExpandedTaxDropdowns] = useState<Set<number>>(new Set());
  const [showAllTariffUpdates, setShowAllTariffUpdates] = useState(false);

  const toggleTariffDropdown = (index: number) => {
    setExpandedTariffDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleTaxDropdown = (index: number) => {
    setExpandedTaxDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderTariffs = () => {
    console.log('renderTariffs called, tariff data exists:', !!data?.tariff);
    if (!data?.tariff) {
      return <div className="loading">Loading tariff data...</div>;
    }

    const updates = Array.isArray(data.tariff.tariff_updates) ? data.tariff.tariff_updates : [];
    const countryTariffs = Array.isArray(data.tariff.country_tariffs) ? data.tariff.country_tariffs : [];
    
    // Sort updates by date (most recent first)
    const sortedUpdates = [...updates].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const dateA = new Date(a.announcement_date || 0);
      const dateB = new Date(b.announcement_date || 0);
      return dateB.getTime() - dateA.getTime();
    });

    const initialUpdates = sortedUpdates.slice(0, 6);
    const remainingUpdates = sortedUpdates.slice(6);
    const displayedUpdates = showAllTariffUpdates ? sortedUpdates : initialUpdates;

    return (
      <>
        <div style={{ marginBottom: '30px', padding: '15px', background: '#e6f7f6', borderRadius: '8px', borderLeft: '4px solid #0d9488' }}>
          <h4 style={{ marginBottom: '10px', color: '#0d9488' }}>Tariff Data Overview</h4>
          <p><strong>Last Updated:</strong> {data.tariff?.last_updated || 'Unknown'}</p>
          <p><strong>Total Sources:</strong> {
            (() => {
              // Extract unique publisher names
              const extractPublisher = (sourceTitle: string): string => {
                if (sourceTitle.includes('Wikipedia') || sourceTitle.includes('Zonos Docs')) {
                  return '';
                }
                let publisher = sourceTitle;
                if (publisher.includes(' - ')) {
                  publisher = publisher.split(' - ').pop() || publisher;
                } else if (publisher.includes(' | ')) {
                  publisher = publisher.split(' | ').pop() || publisher;
                }
                return publisher.trim();
              };
              
              const uniquePublishers = new Set<string>();
              if (Array.isArray(updates)) {
                updates.forEach((update: any) => {
                  if (Array.isArray(update.source_titles)) {
                    update.source_titles.forEach((source: string) => {
                      const publisher = extractPublisher(source);
                      if (publisher) {
                        uniquePublishers.add(publisher);
                      }
                    });
                  }
                });
              }
              return uniquePublishers.size;
            })()
          } verified sources</p>
          <p><strong>Data Coverage:</strong> {countryTariffs.length} countries, {updates.length} updates</p>
        </div>

        <h3 style={{ marginBottom: '20px' }}>Recent Tariff Updates ({updates.length} Updates)</h3>
        <div className="tariff-updates-container" style={{ 
          position: 'relative', 
          paddingLeft: '30px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            content: '""', 
            position: 'absolute', 
            left: '15px', 
            top: '0', 
            bottom: remainingUpdates.length > 0 ? '160px' : '0',
            width: '2px', 
            background: 'linear-gradient(to bottom, #059669, #10b981, #34d399)', 
            borderRadius: '1px' 
          }} />
          
          {displayedUpdates.map((update: Record<string, unknown>, index: number) => (
            <div key={index} className="tariff-dropdown" style={{ 
              position: 'relative', 
              background: '#fff', 
              borderRadius: '8px', 
              padding: '20px', 
              border: '1px solid #ececec', 
              marginBottom: '20px' 
            }}>
              <div style={{ 
                content: '""', 
                position: 'absolute', 
                left: '-22px', 
                top: '40px', 
                width: '12px', 
                height: '12px', 
                background: '#059669', 
                border: '3px solid white', 
                borderRadius: '50%', 
                boxShadow: '0 0 0 2px #059669', 
                zIndex: 1 
              }} />
              
              <div 
                className="tariff-dropdown-header" 
                onClick={() => toggleTariffDropdown(index)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  padding: '12px 16px', 
                  background: '#fff', 
                  borderRadius: '6px', 
                  border: '1px solid #ececec', 
                  transition: 'all 0.2s ease', 
                  color: '#111', 
                  fontWeight: '500' 
                }}
              >
                <div className="tariff-dropdown-title" style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.3' 
                }}>
                  {update.title || 'Untitled Update'}
                </div>
                <div className="tariff-dropdown-icon" style={{ 
                  fontSize: '1.2rem', 
                  transition: 'transform 0.2s ease',
                  transform: expandedTariffDropdowns.has(index) ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </div>
              
              {expandedTariffDropdowns.has(index) && (
                <div className="tariff-dropdown-content" style={{ 
                  maxHeight: '1000px', 
                  padding: '20px', 
                  border: '1px solid #e2e8f0', 
                  borderTop: 'none', 
                  background: '#fafafa', 
                  borderRadius: '0 0 8px 8px', 
                  marginTop: '-1px' 
                }}>
                  <div className="tariff-dropdown-summary" style={{ 
                    lineHeight: '1.6', 
                    color: '#374151' 
                  }}>
                    <div className="tariff-metric" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '8px 0', 
                      borderBottom: '1px solid #e5e7eb' 
                    }}>
                      <div className="tariff-metric-label" style={{ 
                        fontWeight: '500', 
                        color: '#6b7280' 
                      }}>
                        Date
                      </div>
                      <div className="tariff-metric-value" style={{ 
                        fontWeight: '600', 
                        color: '#1e293b' 
                      }}>
                        {update.date || update.announcement_date || 'Unknown Date'}
                      </div>
                    </div>
                    {update.description && (
                      <div style={{ 
                        marginTop: '15px', 
                        paddingTop: '15px', 
                        borderTop: '1px solid #e5e7eb', 
                        fontStyle: 'italic', 
                        color: '#666' 
                      }}>
                        {update.description.replace(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, '')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {remainingUpdates.length > 0 && (
            <div className="see-more-container" style={{ 
              textAlign: 'center', 
              marginTop: '20px', 
              padding: '20px 0' 
            }}>
              <button 
                className="see-more-btn"
                onClick={() => setShowAllTariffUpdates(!showAllTariffUpdates)}
                style={{ 
                  background: '#fff', 
                  color: '#0d9488', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  fontWeight: '500', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease', 
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)' 
                }}
              >
                {showAllTariffUpdates ? 'See Less' : 'See More Updates'}
              </button>
            </div>
          )}
        </div>

        <h3 style={{ marginBottom: '20px' }}>Country-Specific Ad Valorem Tariffs | {countryTariffs.length} Countries</h3>
        <div className="data-table" style={{ 
          background: '#fafafa', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          marginBottom: '40px', 
          maxHeight: '500px', 
          overflowY: 'auto' 
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse' 
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ 
                  background: '#f5f5f5', 
                  color: '#222', 
                  padding: '15px', 
                  textAlign: 'left', 
                  fontWeight: '500', 
                  fontSize: '0.9rem' 
                }}>
                  Country
                </th>
                <th style={{ 
                  background: '#f5f5f5', 
                  color: '#222', 
                  padding: '15px', 
                  textAlign: 'left', 
                  fontWeight: '500', 
                  fontSize: '0.9rem' 
                }}>
                  Their Tariff on US
                </th>
                <th style={{ 
                  background: '#f5f5f5', 
                  color: '#222', 
                  padding: '15px', 
                  textAlign: 'left', 
                  fontWeight: '500', 
                  fontSize: '0.9rem' 
                }}>
                  US Reciprocal Tariff
                </th>
              </tr>
            </thead>
            <tbody>
              {countryTariffs.map((country: Record<string, unknown>, index: number) => (
                <tr key={index}>
                  <td style={{ 
                    padding: '12px 15px', 
                    borderBottom: '1px solid #e5e5e5', 
                    fontSize: '0.9rem', 
                    fontWeight: '500' 
                  }}>
                    {country.country || 'Unknown'}
                  </td>
                  <td style={{ 
                    padding: '12px 15px', 
                    borderBottom: '1px solid #e5e5e5', 
                    fontSize: '0.9rem' 
                  }}>
                    {country.tariff_charged_to_usa || 'Unknown'}
                  </td>
                  <td style={{ 
                    padding: '12px 15px', 
                    borderBottom: '1px solid #e5e5e5', 
                    fontSize: '0.9rem' 
                  }}>
                    {country.usa_reciprocal_tariff || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </>
    );
  };

    const renderTaxPolicy = () => {
    console.log('renderTaxPolicy called, tax policy exists:', !!data?.integrated?.data_sections?.tax_policy);
    if (!data?.integrated?.data_sections?.tax_policy) {
      return <div className="loading">Loading tax policy data...</div>;
    }

    const taxData = data.integrated.data_sections.tax_policy;
    
    // Collect all updates into a single array
    const allUpdates: Array<Record<string, unknown>> = [];
    
    // Add recent tax changes
    const recentChanges = taxData.recent_tax_changes || [];
    recentChanges.forEach((change: Record<string, unknown>) => {
      if (change.title || change.description || change.date) {
        allUpdates.push({
          type: 'Recent Change',
          title: change.title || 'Tax Policy Change',
          date: change.date || change.updateDate || 'Unknown Date',
          summary: change.description || Object.entries(change).map(([k, v]) => `${k}: ${v}`).join(', '),
          fullDetails: change
        });
      }
    });

    // Add current bill status
    const billStatus = taxData.current_bill_status || [];
    billStatus.forEach((bill: Record<string, unknown>) => {
      if (bill.title || bill.description) {
        allUpdates.push({
          type: 'Bill Status',
          title: bill.title || 'Tax Bill',
          date: bill.updateDate || bill.latestAction?.actionDate || 'Unknown Date',
          summary: bill.description || `Bill ${bill.number || ''} - ${bill.status || 'Unknown Status'}`,
          fullDetails: bill
        });
      }
    });

    // Add reconciliation bills
    const reconciliationBills = taxData.proposed_changes?.reconciliation_bills || [];
    reconciliationBills.forEach((bill: Record<string, unknown>) => {
      if (bill.title || bill.description) {
        allUpdates.push({
          type: 'Reconciliation Bill',
          title: bill.title || 'Reconciliation Bill',
          date: bill.updateDate || bill.latestAction?.actionDate || 'Unknown Date',
          summary: bill.description || `Bill ${bill.number || ''} - ${bill.status || 'Unknown Status'}`,
          fullDetails: bill
        });
      }
    });

    // Sort by date (newest first)
    allUpdates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <>
        {allUpdates.length > 0 ? (
          allUpdates.map((update, index) => {
            // const detailsHtml = '';
            
            // Format details based on update type
            if (update.type === 'Bill Status' || update.type === 'Reconciliation Bill') {
              const bill = update.fullDetails;
              const details = [];
              
              if (bill.title) details.push({ label: 'Title', value: bill.title });
              if (bill.status) details.push({ label: 'Status', value: bill.status });
              if (bill.description) details.push({ label: 'Description', value: bill.description });
              if (bill.number) details.push({ label: 'Bill Number', value: bill.number });
              if (bill.originChamber) details.push({ label: 'Origin', value: bill.originChamber });
              if (bill.updateDate) details.push({ label: 'Last Update', value: bill.updateDate });
              if (bill.latestAction && bill.latestAction.text) {
                details.push({ label: 'Latest Action', value: bill.latestAction.text });
                if (bill.latestAction.actionDate) {
                  details.push({ label: 'Action Date', value: bill.latestAction.actionDate });
                }
              }
              
              return (
                <div key={index} className="tax-dropdown" style={{ 
                  background: '#fff', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  border: '1px solid #ececec', 
                  marginBottom: '30px' 
                }}>
                  <div 
                    className="tax-dropdown-header"
                    onClick={() => toggleTaxDropdown(index)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer', 
                      padding: '16px', 
                      background: '#fff', 
                      borderRadius: '6px', 
                      border: '1px solid #ececec', 
                      transition: 'all 0.2s ease', 
                      color: '#111', 
                      fontWeight: '500' 
                    }}
                  >
                    <div>
                      <div className="tax-dropdown-title" style={{ 
                        fontWeight: '600', 
                        fontSize: '1.1rem', 
                        color: '#111' 
                      }}>
                        {update.title}
                      </div>
                      <div className="tax-dropdown-date" style={{ 
                        fontSize: '0.9rem', 
                        opacity: '0.8' 
                      }}>
                        {update.type} • {update.date}
                      </div>
                    </div>
                    <div className="tax-dropdown-icon" style={{ 
                      fontSize: '1.2rem', 
                      transition: 'transform 0.2s ease',
                      transform: expandedTaxDropdowns.has(index) ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </div>
                  </div>
                  
                  {expandedTaxDropdowns.has(index) && (
                    <div className="tax-dropdown-content" style={{ 
                      maxHeight: '1000px', 
                      padding: '20px', 
                      border: '1px solid #e2e8f0', 
                      borderTop: 'none', 
                      background: '#fafafa', 
                      borderRadius: '0 0 8px 8px', 
                      marginTop: '-1px' 
                    }}>
                      <div className="tax-dropdown-summary" style={{ 
                        lineHeight: '1.6', 
                        color: '#374151' 
                      }}>
                        {details.map((detail, detailIndex) => (
                          <div key={detailIndex} style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#1e293b' }}>{detail.label}:</strong> {detail.value}
                          </div>
                        ))}
                        {bill.url && (
                          <div style={{ marginTop: '15px' }}>
                            <Link href={bill.url} target="_blank" rel="noopener noreferrer" style={{ 
                              color: '#0d9488', 
                              textDecoration: 'none' 
                            }}>
                              → View Bill Details
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              // For recent changes, show all relevant fields
              const change = update.fullDetails;
              const details = [];
              
              if (change.title) details.push({ label: 'Title', value: change.title });
              if (change.description) details.push({ label: 'Description', value: change.description });
              if (change.status) details.push({ label: 'Status', value: change.status });
              if (change.date) details.push({ label: 'Date', value: change.date });
              if (change.updateDate) details.push({ label: 'Update Date', value: change.updateDate });
              
              return (
                <div key={index} className="tax-dropdown" style={{ 
                  background: '#fff', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  border: '1px solid #ececec', 
                  marginBottom: '30px' 
                }}>
                  <div 
                    className="tax-dropdown-header"
                    onClick={() => toggleTaxDropdown(index)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer', 
                      padding: '16px', 
                      background: '#fff', 
                      borderRadius: '6px', 
                      border: '1px solid #ececec', 
                      transition: 'all 0.2s ease', 
                      color: '#111', 
                      fontWeight: '500' 
                    }}
                  >
                    <div>
                      <div className="tax-dropdown-title" style={{ 
                        fontWeight: '600', 
                        fontSize: '1.1rem', 
                        color: '#111' 
                      }}>
                        {update.title}
                      </div>
                      <div className="tax-dropdown-date" style={{ 
                        fontSize: '0.9rem', 
                        opacity: '0.8' 
                      }}>
                        {update.type} • {update.date}
                      </div>
                    </div>
                    <div className="tax-dropdown-icon" style={{ 
                      fontSize: '1.2rem', 
                      transition: 'transform 0.2s ease',
                      transform: expandedTaxDropdowns.has(index) ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </div>
                  </div>
                  
                  {expandedTaxDropdowns.has(index) && (
                    <div className="tax-dropdown-content" style={{ 
                      maxHeight: '1000px', 
                      padding: '20px', 
                      border: '1px solid #e2e8f0', 
                      borderTop: 'none', 
                      background: '#fafafa', 
                      borderRadius: '0 0 8px 8px', 
                      marginTop: '-1px' 
                    }}>
                      <div className="tax-dropdown-summary" style={{ 
                        lineHeight: '1.6', 
                        color: '#374151' 
                      }}>
                        {details.map((detail, detailIndex) => (
                          <div key={detailIndex} style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#1e293b' }}>{detail.label}:</strong> {detail.value}
                          </div>
                        ))}
                        {change.url && (
                          <div style={{ marginTop: '15px' }}>
                            <Link href={change.url} target="_blank" rel="noopener noreferrer" style={{ 
                              color: '#0d9488', 
                              textDecoration: 'none' 
                            }}>
                              → View Details
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })
        ) : (
          <div className="error" style={{ 
            background: '#fee', 
            border: '1px solid #fcc', 
            color: '#c33', 
            padding: '20px', 
            borderRadius: '4px', 
            margin: '20px 0' 
          }}>
            No tax policy updates available
          </div>
        )}
        
        {taxData.collection_date && (
          <p style={{ 
            marginTop: '30px', 
            fontSize: '0.9rem', 
            color: '#888', 
            textAlign: 'center' 
          }}>
            Tax policy data collected: {taxData.collection_date} • 
            Source: {taxData.source || 'Government APIs'}
          </p>
        )}
      </>
    );
  };

  const renderEconomicDashboard = () => {
    console.log('renderEconomicDashboard called, data sections exist:', !!data?.integrated?.data_sections);
    if (!data?.integrated?.data_sections) {
      return <div className="loading">Loading economic indicators...</div>;
    }

        const dataSections = data.integrated.data_sections;
    const energy = dataSections.energy || {};
    const employment = dataSections.employment || {};
    const housing = dataSections.housing || {};
    const consumer = dataSections.consumer || {};
    const economic = dataSections.economic || {};

    // Get monthly jobs data directly from employment section
    const monthlyJobsData = dataSections.employment?.monthly_jobs_data;
    
    // Create Total Private Employment data from monthly jobs data
    if (monthlyJobsData && monthlyJobsData.values.length > 0) {
      const currentMonthJobs = monthlyJobsData.values[monthlyJobsData.values.length - 1];
      const currentMonthLabel = monthlyJobsData.labels[monthlyJobsData.labels.length - 1];
      
      // Create Total Private Employment entry
      employment['Total Private Employment'] = {
        current: 161600, // Approximate current total (this would need to be fetched from BLS)
        current_period: currentMonthLabel,
        change: currentMonthJobs,
        change_pct: (currentMonthJobs / 161600) * 100,
        biden_value: 161600 - currentMonthJobs, // Approximate
        biden_period: "Previous Month",
        monthly_jobs_data: monthlyJobsData
      };
    }
    
    // Debug: Log monthly jobs data and employment keys
    console.log('Monthly jobs data:', monthlyJobsData);
    console.log('Employment data keys:', Object.keys(employment));
    console.log('Total Private Employment:', employment['Total Private Employment']);

    // Get data for each category
    const gasolineData = energy['Gasoline (Regular, Weekly)'] || energy['Gasoline (Monthly BLS)'];
    const crudeOilData = energy['Crude Oil WTI (Weekly)'];
    const naturalGasData = energy['Natural Gas Henry Hub (Weekly)'];

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      const d = new Date(dateString);
      d.setDate(d.getDate() + 1);
      return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    };

    return (
      <div className="economic-categories">
        {/* Energy Prices Section */}
        <div className="category-section" style={{ 
          marginBottom: '50px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px 18px', 
          border: '1px solid #f0f0f0' 
        }}>
          <h3 className="category-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #e2e8f0' 
          }}>
            Energy Prices
          </h3>
          <div className="category-content" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '36px' 
          }}>
            {gasolineData && (
              <div className="metric-box" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec' 
              }}>
                <div className="metric-header" style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  color: '#111', 
                  marginBottom: '12px' 
                }}>
                  Gasoline Price
                </div>
                <div className="metric-main">
                  <div className="current-value" style={{ 
                    fontSize: '1.7rem', 
                    fontWeight: '600', 
                    color: '#222', 
                    lineHeight: '1' 
                  }}>
                    ${gasolineData.current.toFixed(2)}
                  </div>
                  <div className="comparison" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    fontSize: '0.9rem' 
                  }}>
                    <span className={`change ${gasolineData.changes.since_inauguration < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: gasolineData.changes.since_inauguration < 0 ? '#0d9488' : '#b91c1c',
                      background: gasolineData.changes.since_inauguration < 0 ? '#e6f7f6' : '#f9eaea'
                    }}>
                      {gasolineData.changes.since_inauguration > 0 ? '+' : ''}${gasolineData.changes.since_inauguration.toFixed(2)} since {formatDate(gasolineData.inauguration_date)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {crudeOilData && (
              <div className="metric-box" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec' 
              }}>
                <div className="metric-header" style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  color: '#111', 
                  marginBottom: '12px' 
                }}>
                  Crude Oil Price
                </div>
                <div className="metric-main">
                  <div className="current-value" style={{ 
                    fontSize: '1.7rem', 
                    fontWeight: '600', 
                    color: '#222', 
                    lineHeight: '1' 
                  }}>
                    ${crudeOilData.current.toFixed(2)}
                  </div>
                  <div className="comparison" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    fontSize: '0.9rem' 
                  }}>
                    <span className={`change ${crudeOilData.changes.since_inauguration < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: crudeOilData.changes.since_inauguration < 0 ? '#0d9488' : '#b91c1c',
                      background: crudeOilData.changes.since_inauguration < 0 ? '#e6f7f6' : '#f9eaea'
                    }}>
                      {crudeOilData.changes.since_inauguration > 0 ? '+' : ''}${crudeOilData.changes.since_inauguration.toFixed(2)} since {formatDate(crudeOilData.inauguration_date)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {naturalGasData && (
              <div className="metric-box" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec' 
              }}>
                <div className="metric-header" style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  color: '#111', 
                  marginBottom: '12px' 
                }}>
                  Natural Gas Price
                </div>
                <div className="metric-main">
                  <div className="current-value" style={{ 
                    fontSize: '1.7rem', 
                    fontWeight: '600', 
                    color: '#222', 
                    lineHeight: '1' 
                  }}>
                    ${naturalGasData.current.toFixed(2)}
                  </div>
                  <div className="comparison" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    fontSize: '0.9rem' 
                  }}>
                    <span className={`change ${naturalGasData.changes.since_inauguration < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: naturalGasData.changes.since_inauguration < 0 ? '#0d9488' : '#b91c1c',
                      background: naturalGasData.changes.since_inauguration < 0 ? '#e6f7f6' : '#f9eaea'
                    }}>
                      {naturalGasData.changes.since_inauguration > 0 ? '+' : ''}${naturalGasData.changes.since_inauguration.toFixed(2)} since {formatDate(naturalGasData.inauguration_date)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employment Dashboard Section */}
        <div className="category-section" style={{ 
          marginBottom: '50px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px 18px', 
          border: '1px solid #f0f0f0' 
        }}>
          <h3 className="category-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #e2e8f0' 
          }}>
            Employment Dashboard
          </h3>
          <div className="dashboard" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '15px', 
            marginBottom: '22px', 
            alignItems: 'stretch' 
          }}>
            {/* Total Employment Section */}
            <div className="dashboard-section" style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '12px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
              borderLeft: '2px solid #10b981', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <div className="employment-section-header" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '13px', 
                flexShrink: 0 
              }}>
                <div className="section-icon" style={{ 
                  width: '26px', 
                  height: '26px', 
                  marginRight: '8px', 
                  fontSize: '1.1rem' 
                }}>
                  💼
                </div>
                <div className="section-title" style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#2c3e50' 
                }}>
                  Total Employment
                </div>
              </div>
              <div className="metrics-container" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1, 
                justifyContent: 'space-between' 
              }}>
                {employment['Total Nonfarm Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Total Nonfarm Employment
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {(employment['Total Nonfarm Employment']?.current / 1000).toFixed(1)}M
                      <span className={`employment-metric-change ${employment['Total Nonfarm Employment']?.change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Total Nonfarm Employment']?.change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Total Nonfarm Employment']?.change > 0 ? '+' : ''}{Math.round(employment['Total Nonfarm Employment']?.change)}k
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Total Nonfarm Employment']?.current_period}
                    </div>
                  </div>
                )}

                {economic['Unemployment Rate'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Unemployment Rate
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {economic['Unemployment Rate'].current_value}%
                      <span className={`employment-metric-change ${economic['Unemployment Rate'].change < 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: economic['Unemployment Rate'].change < 0 ? '#10b981' : '#ef4444'
                      }}>
                        {economic['Unemployment Rate'].change > 0 ? '+' : ''}{economic['Unemployment Rate'].change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {economic['Unemployment Rate'].current_month_year}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {economic['Unemployment Rate'].biden_month_year}: {economic['Unemployment Rate'].biden_value}%
                    </div>
                  </div>
                )}

                {employment['Average Hourly Earnings'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Average Hourly Earnings
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      ${employment['Average Hourly Earnings'].current.toFixed(2)}
                      <span className={`employment-metric-change ${employment['Average Hourly Earnings'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Average Hourly Earnings'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Average Hourly Earnings'].change > 0 ? '+' : ''}${employment['Average Hourly Earnings'].change.toFixed(2)}
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Average Hourly Earnings'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Average Hourly Earnings'].biden_period}: ${employment['Average Hourly Earnings'].biden_value.toFixed(2)}
                    </div>
                  </div>
                )}

                {economic['Industrial Production'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Industrial Production
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {economic['Industrial Production'].change_pct > 0 ? '+' : ''}{economic['Industrial Production'].change_pct.toFixed(1)}%
                      <span className="employment-metric-change positive" style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: '#10b981'
                      }}>
                        {economic['Industrial Production'].change > 0 ? '+' : ''}{economic['Industrial Production'].change.toFixed(2)}
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {economic['Industrial Production'].current_month_year}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      Index: {economic['Industrial Production'].current_value.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Economic Indicators Section */}
            <div className="dashboard-section" style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '12px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
              borderLeft: '2px solid #10b981', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <div className="employment-section-header" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '13px', 
                flexShrink: 0 
              }}>
                <div className="section-icon" style={{ 
                  width: '26px', 
                  height: '26px', 
                  marginRight: '8px', 
                  fontSize: '1.1rem' 
                }}>
                  📈
                </div>
                <div className="section-title" style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#2c3e50' 
                }}>
                  Economic Indicators
                </div>
              </div>
              <div className="metrics-container" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1, 
                justifyContent: 'space-between' 
              }}>
                {economic['GDP Growth Rate'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      GDP Growth Rate
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {economic['GDP Growth Rate'].current_value}%
                      <span className={`employment-metric-change ${economic['GDP Growth Rate'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: economic['GDP Growth Rate'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {economic['GDP Growth Rate'].change > 0 ? '+' : ''}{economic['GDP Growth Rate'].change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {economic['GDP Growth Rate'].current_month_year}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {economic['GDP Growth Rate'].biden_month_year}: {economic['GDP Growth Rate'].biden_value}%
                    </div>
                  </div>
                )}

                {economic['Personal Income'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Personal Income Growth
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {economic['Personal Income'].change_pct > 0 ? '+' : ''}{economic['Personal Income'].change_pct.toFixed(1)}%
                      <span className="employment-metric-change positive" style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: '#10b981'
                      }}>
                        {economic['Personal Income'].change > 0 ? '+' : ''}{economic['Personal Income'].change.toFixed(0)}
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {economic['Personal Income'].current_month_year}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      Current: {economic['Personal Income'].current_value.toLocaleString()}
                    </div>
                  </div>
                )}

                {economic['Consumer Confidence'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Consumer Confidence Index
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {economic['Consumer Confidence'].current_value}
                      <span className={`employment-metric-change ${economic['Consumer Confidence'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: economic['Consumer Confidence'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {economic['Consumer Confidence'].change > 0 ? '+' : ''}{economic['Consumer Confidence'].change.toFixed(1)}
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {economic['Consumer Confidence'].current_month_year}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {economic['Consumer Confidence'].biden_month_year}: {economic['Consumer Confidence'].biden_value}
                    </div>
                  </div>
                )}

                {economic['Retail Sales'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Retail Sales Growth
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {economic['Retail Sales'].change_pct > 0 ? '+' : ''}{economic['Retail Sales'].change_pct.toFixed(1)}%
                      <span className="employment-metric-change positive" style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: '#10b981'
                      }}>
                        {economic['Retail Sales'].change > 0 ? '+' : ''}{(economic['Retail Sales'].change / 1000).toFixed(1)}B
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {economic['Retail Sales'].current_month_year}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      Current: {(economic['Retail Sales'].current_value / 1000).toFixed(0)}B
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sector Performance Section */}
            <div className="dashboard-section" style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '12px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
              borderLeft: '2px solid #10b981', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <div className="employment-section-header" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '13px', 
                flexShrink: 0 
              }}>
                <div className="section-icon" style={{ 
                  width: '26px', 
                  height: '26px', 
                  marginRight: '8px', 
                  fontSize: '1.1rem' 
                }}>
                  🏭
                </div>
                <div className="section-title" style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#2c3e50' 
                }}>
                  Sector Performance
                </div>
              </div>
              <div className="metrics-container" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1, 
                justifyContent: 'space-between' 
              }}>
                {employment['Total Private Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Total Private Employment
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {(employment['Total Private Employment'].current / 1000).toFixed(1)}M
                      <span className={`employment-metric-change ${employment['Total Private Employment'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Total Private Employment'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Total Private Employment'].change > 0 ? '+' : ''}{Math.round(employment['Total Private Employment'].change)}k jobs
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Total Private Employment'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Total Private Employment'].biden_period}: {(employment['Total Private Employment'].biden_value / 1000).toFixed(1)}M
                    </div>
                  </div>
                )}

                {employment['Manufacturing Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Manufacturing Employment
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {(employment['Manufacturing Employment'].current / 1000).toFixed(1)}M
                      <span className={`employment-metric-change ${employment['Manufacturing Employment'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Manufacturing Employment'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Manufacturing Employment'].change > 0 ? '+' : ''}{Math.round(employment['Manufacturing Employment'].change)}k jobs
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Manufacturing Employment'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Manufacturing Employment'].biden_period}: {(employment['Manufacturing Employment'].biden_value / 1000).toFixed(1)}M
                    </div>
                  </div>
                )}

                {employment['Construction Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Construction Employment
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {(employment['Construction Employment'].current / 1000).toFixed(1)}M
                      <span className={`employment-metric-change ${employment['Construction Employment'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Construction Employment'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Construction Employment'].change > 0 ? '+' : ''}{Math.round(employment['Construction Employment'].change)}k jobs
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Construction Employment'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Construction Employment'].biden_period}: {(employment['Construction Employment'].biden_value / 1000).toFixed(1)}M
                    </div>
                  </div>
                )}

                {employment['Professional and Business Services Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Professional & Business Services
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {(employment['Professional and Business Services Employment'].current / 1000).toFixed(1)}M
                      <span className={`employment-metric-change ${employment['Professional and Business Services Employment'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Professional and Business Services Employment'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Professional and Business Services Employment'].change > 0 ? '+' : ''}{Math.round(employment['Professional and Business Services Employment'].change)}k jobs
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Professional and Business Services Employment'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Professional and Business Services Employment'].biden_period}: {(employment['Professional and Business Services Employment'].biden_value / 1000).toFixed(1)}M
                    </div>
                  </div>
                )}

                {employment['Oil and Gas Extraction Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #e9ecef' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Oil & Gas Extraction
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {employment['Oil and Gas Extraction Employment'].current.toFixed(1)}k
                      <span className={`employment-metric-change ${employment['Oil and Gas Extraction Employment'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Oil and Gas Extraction Employment'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Oil and Gas Extraction Employment'].change > 0 ? '+' : ''}{employment['Oil and Gas Extraction Employment'].change.toFixed(1)}k jobs
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Oil and Gas Extraction Employment'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Oil and Gas Extraction Employment'].biden_period}: {employment['Oil and Gas Extraction Employment'].biden_value.toFixed(1)}k
                    </div>
                  </div>
                )}

                {employment['Private Education and Health Services Employment'] && (
                  <div className="metric-item" style={{ 
                    padding: '9px 0', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <div className="metric-item-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#6c757d', 
                      marginBottom: '3px' 
                    }}>
                      Education & Health Services
                    </div>
                    <div className="metric-value" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#2c3e50', 
                      marginBottom: '3px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      {(employment['Private Education and Health Services Employment'].current / 1000).toFixed(1)}M
                      <span className={`employment-metric-change ${employment['Private Education and Health Services Employment'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: employment['Private Education and Health Services Employment'].change > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {employment['Private Education and Health Services Employment'].change > 0 ? '+' : ''}{Math.round(employment['Private Education and Health Services Employment'].change)}k jobs
                      </span>
                    </div>
                    <div className="employment-metric-detail" style={{ 
                      fontSize: '0.65rem', 
                      color: '#9ca3af', 
                      marginTop: '2px' 
                    }}>
                      As of: {employment['Private Education and Health Services Employment'].current_period}
                    </div>
                    <div className="biden-value" style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d', 
                      fontWeight: '500', 
                      marginBottom: '3px', 
                      display: 'block' 
                    }}>
                      {employment['Private Education and Health Services Employment'].biden_period}: {(employment['Private Education and Health Services Employment'].biden_value / 1000).toFixed(1)}M
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Jobs Chart Section */}
        <div className="category-section" style={{ 
          marginBottom: '50px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px 18px', 
          border: '1px solid #f0f0f0',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            zIndex: 10
          }}>
            <ShareButton
              title="Monthly Jobs Added Under Trump Administration"
              description="Employment growth tracking and job creation statistics"
              url="https://theinklined.com/trump-admin/economic-policy"
              screenshotElement=".jobs-chart-container"
              isVisualization={true}
            />
          </div>
          <h3 className="category-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #e2e8f0' 
          }}>
            Monthly Jobs Added
          </h3>
          <div className="jobs-chart-container" style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            padding: '24px', 
            border: '1px solid #e5e7eb', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
          }}>
            {monthlyJobsData && (
              <div style={{ height: '400px', width: '100%' }}>
                <Bar
                  data={{
                    labels: monthlyJobsData.labels,
                    datasets: [
                      {
                        label: 'Jobs Added (thousands)',
                        data: monthlyJobsData.values,
                        backgroundColor: monthlyJobsData.values.map((value: number) => 
                          value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                        ),
                        borderColor: monthlyJobsData.values.map((value: number) => 
                          value >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                        ),
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top' as const,
                        labels: {
                          color: '#374151',
                          font: {
                            size: 12,
                            weight: '500'
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            return `Jobs Added: ${value >= 0 ? '+' : ''}${value}k`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                          drawBorder: false
                        },
                        ticks: {
                          color: '#6b7280',
                          font: {
                            size: 11
                          },
                          callback: function(value) {
                            return value + 'k';
                          }
                        },
                        title: {
                          display: true,
                          text: 'Jobs Added (thousands)',
                          color: '#374151',
                          font: {
                            size: 12,
                            weight: '500'
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: '#6b7280',
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
            {monthlyJobsData && (
              <div style={{ 
                marginTop: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <div>
                  <strong>12-Month Total:</strong> +{monthlyJobsData.total_12_months}k jobs
                </div>
                <div>
                  <strong>Average Monthly:</strong> +{monthlyJobsData.average_monthly.toFixed(1)}k jobs
                </div>
                <div>
                  <strong>Source:</strong> {monthlyJobsData.source}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inflation Breakdown Section */}
        <div className="category-section" style={{ 
          marginBottom: '50px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px 18px', 
          border: '1px solid #f0f0f0' 
        }}>
          <h3 className="category-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #e2e8f0' 
          }}>
            Inflation Breakdown
          </h3>
          <div className="inflation-breakdown" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px', 
            background: '#ffffff', 
            borderRadius: '12px', 
            padding: '24px', 
            border: '1px solid #e5e7eb', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
          }}>
            {consumer['Overall CPI'] && (
              <div className="inflation-item" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec', 
                transition: 'all 0.2s ease', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  content: '""', 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #0d9488, #0d9488)' 
                }} />
                <div className="inflation-header" style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div className="inflation-category" style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '1.1rem', 
                    letterSpacing: '-0.025em', 
                    marginBottom: '8px' 
                  }}>
                    Overall CPI
                  </div>
                  <div className="inflation-rate" style={{ 
                    fontWeight: '800', 
                    fontSize: '1.6rem', 
                    color: '#1e293b' 
                  }}>
                    {consumer['Overall CPI'].trump_inflation.toFixed(1)}%
                  </div>
                </div>
                <div className="inflation-details" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Current
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Overall CPI'].trump_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Historical
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Overall CPI'].biden_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-change" style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '6px', 
                    marginTop: '8px' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '1px',
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}>
                      Change
                    </div>
                    <div className={`detail-value ${consumer['Overall CPI'].inflation_change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: consumer['Overall CPI'].inflation_change < 0 ? '#059669' : '#dc2626'
                    }}>
                      {consumer['Overall CPI'].inflation_change > 0 ? '+' : ''}{consumer['Overall CPI'].inflation_change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {consumer['Core CPI'] && (
              <div className="inflation-item" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec', 
                transition: 'all 0.2s ease', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  content: '""', 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #0d9488, #0d9488)' 
                }} />
                <div className="inflation-header" style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div className="inflation-category" style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '1.1rem', 
                    letterSpacing: '-0.025em', 
                    marginBottom: '8px' 
                  }}>
                    Core CPI
                  </div>
                  <div className="inflation-rate" style={{ 
                    fontWeight: '800', 
                    fontSize: '1.6rem', 
                    color: '#1e293b' 
                  }}>
                    {consumer['Core CPI'].trump_inflation.toFixed(1)}%
                  </div>
                </div>
                <div className="inflation-details" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Current
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Core CPI'].trump_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Historical
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Core CPI'].biden_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-change" style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '6px', 
                    marginTop: '8px' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '1px',
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}>
                      Change
                    </div>
                    <div className={`detail-value ${consumer['Core CPI'].inflation_change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: consumer['Core CPI'].inflation_change < 0 ? '#059669' : '#dc2626'
                    }}>
                      {consumer['Core CPI'].inflation_change > 0 ? '+' : ''}{consumer['Core CPI'].inflation_change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {consumer['Food CPI'] && (
              <div className="inflation-item" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec', 
                transition: 'all 0.2s ease', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  content: '""', 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #0d9488, #0d9488)' 
                }} />
                <div className="inflation-header" style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div className="inflation-category" style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '1.1rem', 
                    letterSpacing: '-0.025em', 
                    marginBottom: '8px' 
                  }}>
                    Food CPI
                  </div>
                  <div className="inflation-rate" style={{ 
                    fontWeight: '800', 
                    fontSize: '1.6rem', 
                    color: '#1e293b' 
                  }}>
                    {consumer['Food CPI'].trump_inflation.toFixed(1)}%
                  </div>
                </div>
                <div className="inflation-details" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Current
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Food CPI'].trump_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Historical
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Food CPI'].biden_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-change" style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '6px', 
                    marginTop: '8px' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '1px',
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}>
                      Change
                    </div>
                    <div className={`detail-value ${consumer['Food CPI'].inflation_change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: consumer['Food CPI'].inflation_change < 0 ? '#059669' : '#dc2626'
                    }}>
                      {consumer['Food CPI'].inflation_change > 0 ? '+' : ''}{consumer['Food CPI'].inflation_change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {consumer['Energy CPI'] && (
              <div className="inflation-item" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec', 
                transition: 'all 0.2s ease', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  content: '""', 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #0d9488, #0d9488)' 
                }} />
                <div className="inflation-header" style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div className="inflation-category" style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '1.1rem', 
                    letterSpacing: '-0.025em', 
                    marginBottom: '8px' 
                  }}>
                    Energy CPI
                  </div>
                  <div className="inflation-rate" style={{ 
                    fontWeight: '800', 
                    fontSize: '1.6rem', 
                    color: '#1e293b' 
                  }}>
                    {consumer['Energy CPI'].trump_inflation.toFixed(1)}%
                  </div>
                </div>
                <div className="inflation-details" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Current
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Energy CPI'].trump_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Historical
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Energy CPI'].biden_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-change" style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '6px', 
                    marginTop: '8px' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '1px',
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}>
                      Change
                    </div>
                    <div className={`detail-value ${consumer['Energy CPI'].inflation_change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: consumer['Energy CPI'].inflation_change < 0 ? '#059669' : '#dc2626'
                    }}>
                      {consumer['Energy CPI'].inflation_change > 0 ? '+' : ''}{consumer['Energy CPI'].inflation_change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {consumer['Housing CPI'] && (
              <div className="inflation-item" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec', 
                transition: 'all 0.2s ease', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  content: '""', 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #0d9488, #0d9488)' 
                }} />
                <div className="inflation-header" style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div className="inflation-category" style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '1.1rem', 
                    letterSpacing: '-0.025em', 
                    marginBottom: '8px' 
                  }}>
                    Housing CPI
                  </div>
                  <div className="inflation-rate" style={{ 
                    fontWeight: '800', 
                    fontSize: '1.6rem', 
                    color: '#1e293b' 
                  }}>
                    {consumer['Housing CPI'].trump_inflation.toFixed(1)}%
                  </div>
                </div>
                <div className="inflation-details" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Current
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Housing CPI'].trump_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Historical
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Housing CPI'].biden_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-change" style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '6px', 
                    marginTop: '8px' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '1px',
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}>
                      Change
                    </div>
                    <div className={`detail-value ${consumer['Housing CPI'].inflation_change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: consumer['Housing CPI'].inflation_change < 0 ? '#059669' : '#dc2626'
                    }}>
                      {consumer['Housing CPI'].inflation_change > 0 ? '+' : ''}{consumer['Housing CPI'].inflation_change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {consumer['Transportation CPI'] && (
              <div className="inflation-item" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec', 
                transition: 'all 0.2s ease', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  content: '""', 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #0d9488, #0d9488)' 
                }} />
                <div className="inflation-header" style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div className="inflation-category" style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '1.1rem', 
                    letterSpacing: '-0.025em', 
                    marginBottom: '8px' 
                  }}>
                    Transportation CPI
                  </div>
                  <div className="inflation-rate" style={{ 
                    fontWeight: '800', 
                    fontSize: '1.6rem', 
                    color: '#1e293b' 
                  }}>
                    {consumer['Transportation CPI'].trump_inflation.toFixed(1)}%
                  </div>
                </div>
                <div className="inflation-details" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Current
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Transportation CPI'].trump_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-detail" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: '2px' 
                    }}>
                      Historical
                    </div>
                    <div className="detail-value" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#1e293b' 
                    }}>
                      {consumer['Transportation CPI'].biden_inflation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="inflation-change" style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '6px', 
                    marginTop: '8px' 
                  }}>
                    <div className="detail-label" style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '1px',
                      color: '#64748b', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}>
                      Change
                    </div>
                    <div className={`detail-value ${consumer['Transportation CPI'].inflation_change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: consumer['Transportation CPI'].inflation_change < 0 ? '#059669' : '#dc2626'
                    }}>
                      {consumer['Transportation CPI'].inflation_change > 0 ? '+' : ''}{consumer['Transportation CPI'].inflation_change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shared Period Legend */}
            <div className="inflation-period-legend" style={{ 
              gridColumn: '1 / -1', 
              marginTop: '20px', 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0', 
              textAlign: 'center' 
            }}>
              <div className="period-legend-title" style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#475569', 
                marginBottom: '8px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                Data Periods
              </div>
              <div className="period-legend-content" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '24px', 
                fontSize: '0.85rem', 
                color: '#64748b' 
              }}>
                <div className="period-item" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}>
                  <div className="period-dot trump" style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    background: '#3b82f6'
                  }}></div>
                  <span>Current Period: {consumer['Overall CPI'] ? consumer['Overall CPI'].trump_period : 'N/A'}</span>
                </div>
                <div className="period-item" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}>
                  <div className="period-dot biden" style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    background: '#8b5cf6'
                  }}></div>
                  <span>Historical Period: {consumer['Overall CPI'] ? consumer['Overall CPI'].biden_period : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Housing Market Section */}
        <div className="category-section" style={{ 
          marginBottom: '50px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px 18px', 
          border: '1px solid #f0f0f0' 
        }}>
          <h3 className="category-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1e293b', 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #e2e8f0' 
          }}>
            Housing Market
          </h3>
          <div className="category-content" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '36px' 
          }}>
            {housing['Median Home Price'] && (
              <div className="metric-box" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec' 
              }}>
                <div className="metric-header" style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  color: '#111', 
                  marginBottom: '12px' 
                }}>
                  Median Home Price
                </div>
                <div className="metric-main">
                  <div className="current-value" style={{ 
                    fontSize: '1.7rem', 
                    fontWeight: '600', 
                    color: '#222', 
                    lineHeight: '1' 
                  }}>
                    ${housing['Median Home Price'].current.toLocaleString()}
                  </div>
                  <div className="comparison" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    fontSize: '0.9rem' 
                  }}>
                    <span className="biden-value" style={{ 
                      color: '#6b7280', 
                      fontWeight: '500' 
                    }}>
                      {housing['Median Home Price'].biden_date ? formatDate(housing['Median Home Price'].biden_date) : 'Historical'}: ${housing['Median Home Price'].biden_value.toLocaleString()}
                    </span>
                    <span className={`change ${housing['Median Home Price'].change < 0 ? 'positive' : 'negative'}`} style={{ 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: housing['Median Home Price'].change < 0 ? '#0d9488' : '#b91c1c',
                      background: housing['Median Home Price'].change < 0 ? '#e6f7f6' : '#f9eaea'
                    }}>
                      {housing['Median Home Price'].change > 0 ? '+' : ''}${housing['Median Home Price'].change.toLocaleString()} since {housing['Median Home Price'].biden_date ? formatDate(housing['Median Home Price'].biden_date) : 'Historical'}
                    </span>
                  </div>
                </div>
                <div className="metric-details" style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid #f0f0f0' 
                }}>
                  <div className="detail-row" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '6px', 
                    fontSize: '0.85rem' 
                  }}>
                    <span className="detail-label" style={{ 
                      color: '#6b7280', 
                      fontWeight: '500' 
                    }}>
                      Current Date:
                    </span>
                    <span className="detail-value" style={{ 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      {housing['Median Home Price'].as_of_current}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {housing['Case Shiller Index'] && (
              <div className="metric-box" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec' 
              }}>
                <div className="metric-header" style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  color: '#111', 
                  marginBottom: '12px' 
                }}>
                  Case-Shiller Index
                </div>
                <div className="metric-main">
                  <div className="current-value" style={{ 
                    fontSize: '1.7rem', 
                    fontWeight: '600', 
                    color: '#222', 
                    lineHeight: '1' 
                  }}>
                    {housing['Case Shiller Index'].current.toFixed(1)}
                  </div>
                  <div className="comparison" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    fontSize: '0.9rem' 
                  }}>
                    <span className="biden-value" style={{ 
                      color: '#6b7280', 
                      fontWeight: '500' 
                    }}>
                      {housing['Case Shiller Index'].biden_date ? formatDate(housing['Case Shiller Index'].biden_date) : 'Historical'}: {housing['Case Shiller Index'].biden_value.toFixed(1)}
                    </span>
                    <span className={`change ${housing['Case Shiller Index'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: housing['Case Shiller Index'].change > 0 ? '#0d9488' : '#b91c1c',
                      background: housing['Case Shiller Index'].change > 0 ? '#e6f7f6' : '#f9eaea'
                    }}>
                      {housing['Case Shiller Index'].change > 0 ? '+' : ''}{housing['Case Shiller Index'].change.toFixed(2)} since {housing['Case Shiller Index'].biden_date ? formatDate(housing['Case Shiller Index'].biden_date) : 'Historical'}
                    </span>
                  </div>
                </div>
                <div className="metric-details" style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid #f0f0f0' 
                }}>
                  <div className="detail-row" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '6px', 
                    fontSize: '0.85rem' 
                  }}>
                    <span className="detail-label" style={{ 
                      color: '#6b7280', 
                      fontWeight: '500' 
                    }}>
                      Current Date:
                    </span>
                    <span className="detail-value" style={{ 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      {housing['Case Shiller Index'].as_of_current}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {housing['Housing Starts'] && (
              <div className="metric-box" style={{ 
                background: '#fff', 
                borderRadius: '8px', 
                padding: '20px', 
                border: '1px solid #ececec' 
              }}>
                <div className="metric-header" style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  color: '#111', 
                  marginBottom: '12px' 
                }}>
                  Housing Starts
                </div>
                <div className="metric-main">
                  <div className="current-value" style={{ 
                    fontSize: '1.7rem', 
                    fontWeight: '600', 
                    color: '#222', 
                    lineHeight: '1' 
                  }}>
                    {(housing['Housing Starts'].current / 1000).toFixed(3)}M
                  </div>
                  <div className="comparison" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    fontSize: '0.9rem' 
                  }}>
                    <span className="biden-value" style={{ 
                      color: '#6b7280', 
                      fontWeight: '500' 
                    }}>
                      {housing['Housing Starts'].biden_date ? formatDate(housing['Housing Starts'].biden_date) : 'Historical'}: {(housing['Housing Starts'].biden_value / 1000).toFixed(3)}M
                    </span>
                    <span className={`change ${housing['Housing Starts'].change > 0 ? 'positive' : 'negative'}`} style={{ 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: housing['Housing Starts'].change > 0 ? '#0d9488' : '#b91c1c',
                      background: housing['Housing Starts'].change > 0 ? '#e6f7f6' : '#f9eaea'
                    }}>
                      {housing['Housing Starts'].change > 0 ? '+' : ''}{(housing['Housing Starts'].change / 1000).toFixed(3)}M since {housing['Housing Starts'].biden_date ? formatDate(housing['Housing Starts'].biden_date) : 'Historical'}
                    </span>
                  </div>
                </div>
                <div className="metric-details" style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid #f0f0f0' 
                }}>
                  <div className="detail-row" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '6px', 
                    fontSize: '0.85rem' 
                  }}>
                    <span className="detail-label" style={{ 
                      color: '#6b7280', 
                      fontWeight: '500' 
                    }}>
                      Current Date:
                    </span>
                    <span className="detail-value" style={{ 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      {housing['Housing Starts'].as_of_current}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const collectionDate = data.integrated?.metadata?.collection_date || '2025-07-28 15:23:16';

  return (
    <MobileMenuProvider>
      {({ isMobileMenuOpen, toggleMobileMenu }) => (
        <div>
          <Header breadcrumb={{
            items: [
              { label: 'Home', href: '/' },
              { label: 'Trump Administration', href: '/trump-admin' },
              { label: 'Economic Policy' }
            ]
          }} onMobileMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />

          <Navigation currentPath="/trump-admin/economic-policy" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={toggleMobileMenu}>

          <ScrollEffects />

      {/* Main Content */}
      <main role="main">
        <div className="container" style={{ 
          maxWidth: '1200px', 
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
              Trump Administration Economic Policy Dashboard
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#666', 
              maxWidth: '800px', 
              margin: '0 auto', 
              fontStyle: 'italic' 
            }}>
              Comprehensive analysis of economic indicators, tax policy, tariffs, and market performance during the second Trump administration
            </p>
            <div className="metadata" style={{ 
              marginTop: '30px', 
              fontSize: '0.9rem', 
              color: '#888' 
            }}>
              <span>Last updated: {new Date(collectionDate.replace(/-/g, '/')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </header>

          {/* Stock Market Performance */}
          <section className="section" style={{ 
            marginBottom: '70px', 
            paddingBottom: '30px', 
            borderBottom: '1px solid #f0f0f0',
            position: 'relative'
          }}>
            <div className="section-header" style={{ 
              textAlign: 'center', 
              marginBottom: '40px' 
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                color: '#1a1a1a', 
                marginBottom: '15px', 
                fontWeight: '300', 
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Stock Market Performance
              </h2>
              <div className="section-description" style={{ 
                fontSize: '1rem', 
                color: '#888', 
                fontStyle: 'italic' 
              }}>
                S&P 500 performance comparison with previous presidents
              </div>
            </div>
            <div className="chart-controls" style={{ 
              marginBottom: '20px', 
              textAlign: 'center' 
            }}>
              <label htmlFor="presidentSelect">Compare with President:</label>
              <select 
                id="presidentSelect" 
                value={selectedPresident} 
                onChange={(e) => setSelectedPresident(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontFamily: 'inherit', 
                  fontSize: '0.9rem', 
                  margin: '0 10px' 
                }}
              >
                <option value="trump_current">Trump (Current Term)</option>
                <option value="trump_first">Trump (2017-2021)</option>
                <option value="biden">Biden (2021-2025)</option>
                <option value="obama_first">Obama (2009-2017)</option>
                <option value="bush">Bush (2001-2009)</option>
                <option value="bush_hw">Bush H.W. (1989-1993)</option>
                <option value="reagan">Reagan (1981-1989)</option>
                <option value="carter">Carter (1977-1981)</option>
              </select>
              <label htmlFor="timeframeSelect">Timeframe:</label>
              <select 
                id="timeframeSelect" 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontFamily: 'inherit', 
                  fontSize: '0.9rem', 
                  margin: '0 10px' 
                }}
              >
                <option value="days_100">First 100 Days</option>
                <option value="days_365">First Year</option>
                <option value="days_730">First Two Years</option>
                <option value="full_term">All</option>
              </select>
            </div>
            <div className="chart-container" style={{ 
              background: '#fafafa', 
              borderRadius: '8px', 
              padding: '30px', 
              marginBottom: '40px', 
              height: '440px', 
              position: 'relative', 
              overflow: 'hidden', 
              border: '1px solid #e5e5e5' 
            }}>
              {data ? renderStockChart() : <div className="loading" style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>Loading stock chart...</div>}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
              <em>Historical prices are inflation-adjusted to 2025 dollars for fair comparison</em>
            </div>
          </section>


          {/* Tariff Analysis */}
          <section className="section" style={{ 
            marginBottom: '70px', 
            paddingBottom: '30px', 
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div className="section-header" style={{ 
              textAlign: 'center', 
              marginBottom: '40px' 
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                color: '#1a1a1a', 
                marginBottom: '15px', 
                fontWeight: '300', 
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Tariff Policy Analysis
              </h2>
              <div className="section-description" style={{ 
                fontSize: '1rem', 
                color: '#888', 
                fontStyle: 'italic' 
              }}>
                Country-specific tariffs, recent updates, and exemptions
              </div>
            </div>
            <div id="tariffContent" role="region">
              {data ? renderTariffs() : <div className="loading" style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>Loading tariff data...</div>}
            </div>
          </section>

          {/* Tax Policy */}
          <section className="section" style={{ 
            marginBottom: '70px', 
            paddingBottom: '30px', 
            borderBottom: '1px solid #f0f0f0' 
          }}>
            <div className="section-header" style={{ 
              textAlign: 'center', 
              marginBottom: '40px' 
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                color: '#1a1a1a', 
                marginBottom: '15px', 
                fontWeight: '300', 
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Tax Policy Updates
              </h2>
              <div className="section-description" style={{ 
                fontSize: '1rem', 
                color: '#888', 
                fontStyle: 'italic' 
              }}>
                Recent tax policy changes and legislative updates
              </div>
            </div>
            <div id="taxPolicyContent" role="region">
              {data ? renderTaxPolicy() : <div className="loading" style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>Loading tax policy data...</div>}
            </div>
          </section>

          {/* Economic Dashboard */}
          <section className="section" style={{ 
            marginBottom: '70px', 
            paddingBottom: '30px', 
            borderBottom: '1px solid #f0f0f0' 
          }}>
            <div className="section-header" style={{ 
              textAlign: 'center', 
              marginBottom: '40px' 
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                color: '#1a1a1a', 
                marginBottom: '15px', 
                fontWeight: '300', 
                letterSpacing: '-0.3px',
                fontFamily: 'Georgia, Times New Roman, serif'
              }}>
                Economic Performance Dashboard
              </h2>
              <div className="section-description" style={{ 
                fontSize: '1rem', 
                color: '#888', 
                fontStyle: 'italic' 
              }}>
                Comprehensive economic indicators with current vs historical period comparisons
              </div>
            </div>
            <div id="economicContent" role="region">
              {data ? renderEconomicDashboard() : <div className="loading" style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>Loading economic indicators...</div>}
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
          padding: '0 2rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem', 
            flexWrap: 'wrap' 
          }}>
            <Link href="/" style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: '#ffffff', 
              letterSpacing: '0.08em', 
              fontFamily: 'Georgia, Times New Roman, serif', 
              textTransform: 'uppercase',
              textDecoration: 'none'
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
                transition: 'color 0.2s ease'
              }}>
                Transparency
              </Link>
              <Link href="/about" style={{ 
                color: '#cccccc', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                About
              </Link>
              <Link href="/contact" style={{ 
                color: '#cccccc', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                Contact
              </Link>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid #333333', 
            paddingTop: '1.5rem', 
            fontSize: '0.9rem', 
            color: '#888888',
            textAlign: 'center'
          }}>
            <p>&copy; 2025 Inklined. All rights reserved. | Political analysis and data transparency.</p>
          </div>
        </div>
      </footer>

      {/* Chart.js Script */}
      <script 
        src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"
        async
      ></script>

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
        
        .chart-container {
          background: #fafafa;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 40px;
          height: 500px;
          position: relative;
          overflow: hidden;
          border: 1px solid #e5e5e5;
        }
        
        .chart-controls {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .chart-controls select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.9rem;
          margin: 0 10px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }
        
        .error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        
        select:focus {
          outline: none;
          border-color: #0d9488 !important;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }
        
        a:hover {
          color: #0d9488;
        }
        
        /* Dropdown hover effects */
        li[style*="position: relative"]:hover > div[style*="display: none"] {
          display: block !important;
        }
        
        /* Dropdown link hover effects */
        li[style*="position: relative"]:hover > div[style*="display: none"] a:hover {
          background: #f8f9fa;
          color: #0d9488;
          padding-left: 2rem;
        }
        
        /* Dropdown arrow effects */
        li[style*="position: relative"]:hover > div[style*="display: none"] a::before {
          content: "→";
          opacity: 1;
          margin-right: 0.5rem;
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

        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .dashboard {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .dashboard-section {
            width: 100% !important;
            margin-bottom: 15px !important;
          }
          
          .category-section {
            padding: 16px 12px !important;
          }
          
          .category-title {
            font-size: 1.3rem !important;
            margin-bottom: 16px !important;
          }

          /* Stock chart mobile optimization */
          .chart-container {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 -12px 20px -12px !important;
            height: 300px !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
          </Navigation>
        </div>
      )}
    </MobileMenuProvider>
  );
}