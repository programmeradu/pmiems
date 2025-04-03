import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Button, 
  Text, 
  Loading, 
  Spacer, 
  Grid, 
  Dropdown, 
  Checkbox,
  Radio,
  Table
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { 
  FileText as FileTextIcon, 
  Download as DownloadIcon,
  Printer as PrinterIcon
} from 'react-feather';
import { CSVLink } from 'react-csv';
import { Document, Page, Text as PDFText, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

import { Department, Position, Employee } from '../../types';
import { useTheme } from '../../context/ThemeContext';

// Define report types
type ReportType = 'employees' | 'departments' | 'positions';

// Define field selection types based on report type
interface FieldSelections {
  employees: string[];
  departments: string[];
  positions: string[];
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center'
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0'
  },
  tableColHeader: {
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold'
  },
  tableCol: {
    padding: 5,
    fontSize: 10
  }
});

// PDF Report component
const PDFReport = ({ title, data, fields, columns }: { 
  title: string; 
  data: any[]; 
  fields: string[]; 
  columns: { key: string; label: string }[] 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFText style={styles.header}>{title}</PDFText>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          {columns
            .filter(col => fields.includes(col.key))
            .map((column, index) => (
              <PDFText key={index} style={[styles.tableColHeader, { width: `${100 / fields.length}%` }]}>
                {column.label}
              </PDFText>
            ))}
        </View>
        {data.map((item, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {columns
              .filter(col => fields.includes(col.key))
              .map((column, colIndex) => (
                <PDFText key={colIndex} style={[styles.tableCol, { width: `${100 / fields.length}%` }]}>
                  {getFormattedValue(item, column.key)}
                </PDFText>
              ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// Helper function to get formatted value for PDF
const getFormattedValue = (item: any, key: string): string => {
  if (!item || item[key] === undefined || item[key] === null) return '-';
  
  // Handle date fields
  if (key === 'hire_date' || key === 'created_at' || key === 'updated_at') {
    return new Date(item[key]).toLocaleDateString();
  }
  
  // Handle salary with formatting
  if (key === 'salary') {
    return item[key] ? new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD'
    }).format(item[key]) : '-';
  }
  
  // Handle name fields
  if (key === 'name' && item.first_name && item.last_name) {
    return `${item.first_name} ${item.last_name}`;
  }
  
  return String(item[key]);
};

const ReportGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // State for report configuration
  const [reportType, setReportType] = useState<ReportType>('employees');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [selectedFields, setSelectedFields] = useState<FieldSelections>({
    employees: ['id', 'first_name', 'last_name', 'email', 'position_title', 'department_name', 'hire_date', 'salary'],
    departments: ['id', 'name', 'description'],
    positions: ['id', 'title', 'department_name', 'description']
  });
  
  // State for data loading
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // State for references
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  
  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      setLoading(true);
      
      try {
        const [deptResult, posResult] = await Promise.all([
          window.electronAPI.getAllDepartments(),
          window.electronAPI.getAllPositions()
        ]);
        
        if (deptResult.success && deptResult.departments) {
          setDepartments(deptResult.departments);
        } else {
          setError('Failed to load departments');
        }
        
        if (posResult.success && posResult.positions) {
          setPositions(posResult.positions);
        } else {
          setError('Failed to load positions');
        }
      } catch (err) {
        console.error('Error loading reference data:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadReferenceData();
  }, []);
  
  // Update filtered positions when department changes
  useEffect(() => {
    if (departmentId) {
      const filtered = positions.filter(p => p.department_id === departmentId);
      setFilteredPositions(filtered);
      // Reset position selection if it's not in the filtered list
      if (positionId && !filtered.some(p => p.id === positionId)) {
        setPositionId(null);
      }
    } else {
      setFilteredPositions(positions);
    }
  }, [departmentId, positions, positionId]);
  
  // Field definitions for different report types
  const reportFields = {
    employees: [
      { key: 'id', label: 'ID' },
      { key: 'first_name', label: t('employees.firstName') },
      { key: 'last_name', label: t('employees.lastName') },
      { key: 'email', label: t('employees.email') },
      { key: 'phone', label: t('employees.phone') },
      { key: 'address', label: t('employees.address') },
      { key: 'position_id', label: 'Position ID' },
      { key: 'position_title', label: t('employees.position') },
      { key: 'department_id', label: 'Department ID' },
      { key: 'department_name', label: t('employees.department') },
      { key: 'hire_date', label: t('employees.hireDate') },
      { key: 'salary', label: t('employees.salary') },
      { key: 'notes', label: t('employees.notes') },
      { key: 'created_at', label: 'Created At' },
      { key: 'updated_at', label: 'Updated At' }
    ],
    departments: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: t('departments.name') },
      { key: 'description', label: t('departments.description') },
      { key: 'created_at', label: 'Created At' },
      { key: 'updated_at', label: 'Updated At' }
    ],
    positions: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: t('positions.title') },
      { key: 'department_id', label: 'Department ID' },
      { key: 'department_name', label: t('positions.department') },
      { key: 'description', label: t('positions.description') },
      { key: 'created_at', label: 'Created At' },
      { key: 'updated_at', label: 'Updated At' }
    ]
  };
  
  const handleFieldSelection = (field: string) => {
    setSelectedFields(prev => {
      const currentFields = [...prev[reportType]];
      
      if (currentFields.includes(field)) {
        return {
          ...prev,
          [reportType]: currentFields.filter(f => f !== field)
        };
      } else {
        return {
          ...prev,
          [reportType]: [...currentFields, field]
        };
      }
    });
  };
  
  const generateReport = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      let result;
      
      // Fetch data based on report type
      switch (reportType) {
        case 'employees':
          result = await window.electronAPI.getAllEmployees();
          if (result.success && result.employees) {
            // Filter by department/position if selected
            let filteredData = result.employees;
            
            if (departmentId) {
              filteredData = filteredData.filter(emp => emp.department_id === departmentId);
            }
            
            if (positionId) {
              filteredData = filteredData.filter(emp => emp.position_id === positionId);
            }
            
            setReportData(filteredData);
          } else {
            setError(result.message || 'Failed to fetch employee data');
          }
          break;
          
        case 'departments':
          result = await window.electronAPI.getAllDepartments();
          if (result.success && result.departments) {
            setReportData(result.departments);
          } else {
            setError(result.message || 'Failed to fetch department data');
          }
          break;
          
        case 'positions':
          result = await window.electronAPI.getAllPositions();
          if (result.success && result.positions) {
            // Filter by department if selected
            let filteredData = result.positions;
            
            if (departmentId) {
              filteredData = filteredData.filter(pos => pos.department_id === departmentId);
            }
            
            setReportData(filteredData);
          } else {
            setError(result.message || 'Failed to fetch position data');
          }
          break;
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('An unexpected error occurred while generating the report');
    } finally {
      setGenerating(false);
    }
  };
  
  // Prepare CSV data
  const getCsvData = () => {
    // Filter fields for CSV export
    const fields = selectedFields[reportType];
    const headers = reportFields[reportType]
      .filter(field => fields.includes(field.key))
      .map(field => ({ label: field.label, key: field.key }));
    
    return {
      data: reportData,
      headers,
      filename: `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
    };
  };
  
  // Get report title
  const getReportTitle = () => {
    switch (reportType) {
      case 'employees': return t('reports.employeeReport');
      case 'departments': return t('reports.departmentReport');
      case 'positions': return t('reports.positionReport');
      default: return t('reports.title');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Text h2>{t('reports.title')}</Text>
      <Spacer y={1} />
      
      <Grid.Container gap={2}>
        <Grid xs={12} md={4}>
          <Card
            variant="bordered"
            css={{
              backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
              height: '100%',
              padding: '1.5rem'
            }}
          >
            <Card.Header>
              <Text h4>{t('reports.generateReport')}</Text>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <Text b>{t('reports.reportType')}</Text>
                <Radio.Group 
                  value={reportType} 
                  onChange={(val) => setReportType(val as ReportType)}
                  orientation="vertical"
                >
                  <Radio value="employees">{t('reports.employeeReport')}</Radio>
                  <Radio value="departments">{t('reports.departmentReport')}</Radio>
                  <Radio value="positions">{t('reports.positionReport')}</Radio>
                </Radio.Group>
              </div>
              
              {(reportType === 'employees' || reportType === 'positions') && (
                <div className="mb-4">
                  <Text b>{t('reports.selectDepartment')}</Text>
                  <Dropdown>
                    <Dropdown.Button 
                      flat 
                      css={{ 
                        width: '100%', 
                        justifyContent: 'space-between',
                        backgroundColor: theme === 'dark' ? '$gray700' : '$gray100',
                      }}
                    >
                      {departmentId 
                        ? departments.find(d => d.id === departmentId)?.name 
                        : t('common.all')}
                    </Dropdown.Button>
                    <Dropdown.Menu
                      aria-label="Department selection"
                      onAction={(key) => {
                        if (key === 'all') {
                          setDepartmentId(null);
                        } else {
                          setDepartmentId(Number(key));
                        }
                      }}
                      selectionMode="single"
                      selectedKeys={departmentId ? [`${departmentId}`] : ['all']}
                    >
                      <Dropdown.Item key="all">{t('common.all')}</Dropdown.Item>
                      {departments.map((dept) => (
                        <Dropdown.Item key={dept.id}>
                          {dept.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}
              
              {reportType === 'employees' && departmentId && (
                <div className="mb-4">
                  <Text b>{t('reports.selectPosition')}</Text>
                  <Dropdown>
                    <Dropdown.Button 
                      flat 
                      css={{ 
                        width: '100%', 
                        justifyContent: 'space-between',
                        backgroundColor: theme === 'dark' ? '$gray700' : '$gray100',
                      }}
                      disabled={filteredPositions.length === 0}
                    >
                      {positionId 
                        ? positions.find(p => p.id === positionId)?.title 
                        : t('common.all')}
                    </Dropdown.Button>
                    <Dropdown.Menu
                      aria-label="Position selection"
                      onAction={(key) => {
                        if (key === 'all') {
                          setPositionId(null);
                        } else {
                          setPositionId(Number(key));
                        }
                      }}
                      selectionMode="single"
                      selectedKeys={positionId ? [`${positionId}`] : ['all']}
                    >
                      <Dropdown.Item key="all">{t('common.all')}</Dropdown.Item>
                      {filteredPositions.map((pos) => (
                        <Dropdown.Item key={pos.id}>
                          {pos.title}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}
              
              <div className="mb-4">
                <Text b>{t('reports.includeFields')}</Text>
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {reportFields[reportType].map((field) => (
                    <Checkbox
                      key={field.key}
                      isSelected={selectedFields[reportType].includes(field.key)}
                      onChange={() => handleFieldSelection(field.key)}
                      size="sm"
                      css={{ marginBottom: '0.5rem' }}
                    >
                      {field.label}
                    </Checkbox>
                  ))}
                </div>
              </div>
              
              <Spacer y={1} />
              
              <Button
                auto
                color="primary"
                icon={<FileTextIcon size={16} />}
                onClick={generateReport}
                disabled={generating || selectedFields[reportType].length === 0}
                css={{ width: '100%' }}
              >
                {generating ? (
                  <Loading type="points" color="currentColor" size="sm" />
                ) : (
                  t('reports.generateReport')
                )}
              </Button>
            </Card.Body>
          </Card>
        </Grid>
        
        <Grid xs={12} md={8}>
          <Card
            variant="bordered"
            css={{
              backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
              height: '100%',
              padding: '1.5rem'
            }}
          >
            <Card.Header>
              <div className="flex justify-between items-center w-full">
                <Text h4>{getReportTitle()}</Text>
                
                {reportData.length > 0 && (
                  <div className="flex gap-2">
                    <CSVLink {...getCsvData()}>
                      <Button
                        auto
                        icon={<DownloadIcon size={16} />}
                        css={{ backgroundColor: '#22C55E' }}
                      >
                        {t('reports.exportCSV')}
                      </Button>
                    </CSVLink>
                    
                    <PDFDownloadLink
                      document={
                        <PDFReport 
                          title={getReportTitle()} 
                          data={reportData} 
                          fields={selectedFields[reportType]} 
                          columns={reportFields[reportType]} 
                        />
                      }
                      fileName={`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ loading }) => (
                        <Button
                          auto
                          icon={<PrinterIcon size={16} />}
                          css={{ backgroundColor: '#6366F1' }}
                          disabled={loading}
                        >
                          {loading ? t('common.loading') : t('reports.exportPDF')}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </div>
                )}
              </div>
            </Card.Header>
            <Card.Body css={{ overflow: 'auto' }}>
              {error && (
                <div className="mb-4">
                  <Text color="error">{error}</Text>
                </div>
              )}
              
              {reportData.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <Text>{t('reports.noData')}</Text>
                </div>
              ) : (
                <Table
                  aria-label="Report data table"
                  css={{
                    height: 'auto',
                    minWidth: '100%',
                    backgroundColor: theme === 'dark' ? '$gray900' : '$white',
                  }}
                  selectionMode="none"
                >
                  <Table.Header>
                    {reportFields[reportType]
                      .filter(field => selectedFields[reportType].includes(field.key))
                      .map(field => (
                        <Table.Column key={field.key}>{field.label}</Table.Column>
                      ))}
                  </Table.Header>
                  <Table.Body>
                    {reportData.map((item, index) => (
                      <Table.Row key={index}>
                        {reportFields[reportType]
                          .filter(field => selectedFields[reportType].includes(field.key))
                          .map(field => {
                            let value = item[field.key];
                            
                            // Format date fields
                            if (['hire_date', 'created_at', 'updated_at'].includes(field.key) && value) {
                              value = new Date(value).toLocaleDateString();
                            }
                            
                            // Format salary
                            if (field.key === 'salary' && value) {
                              value = new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'USD' 
                              }).format(value);
                            }
                            
                            return (
                              <Table.Cell key={field.key}>
                                {value || '-'}
                              </Table.Cell>
                            );
                          })}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </motion.div>
  );
};

export default ReportGenerator;
