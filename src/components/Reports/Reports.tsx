import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field } from 'formik';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
} from '@nextui-org/react';

// Placeholder report service that would be used in a real implementation
import { generateReport, exportToCSV } from '../../services/reportService';

interface ReportFormValues {
  type: 'employees' | 'departments' | 'positions';
  departmentId?: number;
  positionId?: number;
  startDate?: string;
  endDate?: string;
  fields: string[];
}

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);
  
  const initialValues: ReportFormValues = {
    type: 'employees',
    fields: ['id', 'first_name', 'last_name', 'email', 'department_name', 'position_title']
  };
  
  const handleSubmit = async (values: ReportFormValues) => {
    setLoading(true);
    try {
      // Convert string dates to timestamps if provided
      const filters: any = {};
      if (values.departmentId) filters.departmentId = Number(values.departmentId);
      if (values.positionId) filters.positionId = Number(values.positionId);
      if (values.startDate) filters.startDate = new Date(values.startDate).getTime();
      if (values.endDate) filters.endDate = new Date(values.endDate).getTime();
      
      const result = await generateReport({
        type: values.type,
        filters,
        fields: values.fields
      });
      
      if (result.success && result.data && result.columns) {
        setReportData(result.data);
        setColumns(result.columns);
      } else {
        console.error('Failed to generate report:', result.message);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = () => {
    if (reportData && columns) {
      const csv = exportToCSV(
        reportData,
        columns,
        `${initialValues.type}_report_${new Date().toISOString().split('T')[0]}`
      );
      
      // Create a download link for the CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const getFieldOptions = (type: string) => {
    switch (type) {
      case 'employees':
        return [
          { value: 'id', label: t('reports.fields.id') },
          { value: 'first_name', label: t('reports.fields.firstName') },
          { value: 'last_name', label: t('reports.fields.lastName') },
          { value: 'email', label: t('reports.fields.email') },
          { value: 'phone', label: t('reports.fields.phone') },
          { value: 'department_name', label: t('reports.fields.department') },
          { value: 'position_title', label: t('reports.fields.position') },
          { value: 'hire_date', label: t('reports.fields.hireDate') },
          { value: 'salary', label: t('reports.fields.salary') },
        ];
      case 'departments':
        return [
          { value: 'id', label: t('reports.fields.id') },
          { value: 'name', label: t('reports.fields.name') },
          { value: 'description', label: t('reports.fields.description') },
          { value: 'employee_count', label: t('reports.fields.employeeCount') },
        ];
      case 'positions':
        return [
          { value: 'id', label: t('reports.fields.id') },
          { value: 'title', label: t('reports.fields.title') },
          { value: 'department_name', label: t('reports.fields.department') },
          { value: 'description', label: t('reports.fields.description') },
        ];
      default:
        return [];
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{t('nav.reports')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Report Form */}
        <div className="lg:col-span-2">
          <Card className="glass">
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('reports.generateReport')}</h2>
            </CardHeader>
            <CardBody>
              <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('reports.reportType')}
                      </label>
                      <Field name="type">
                        {({ field }: any) => (
                          <Select
                            label={t('reports.selectType')}
                            value={field.value}
                            onChange={(e) => {
                              setFieldValue('type', e.target.value);
                              // Reset fields when type changes
                              setFieldValue('fields', []);
                            }}
                          >
                            <SelectItem key="employees" value="employees">
                              {t('reports.types.employees')}
                            </SelectItem>
                            <SelectItem key="departments" value="departments">
                              {t('reports.types.departments')}
                            </SelectItem>
                            <SelectItem key="positions" value="positions">
                              {t('reports.types.positions')}
                            </SelectItem>
                          </Select>
                        )}
                      </Field>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('reports.selectFields')}
                      </label>
                      <div className="space-y-2 p-2 border rounded-md">
                        {getFieldOptions(values.type).map((option) => (
                          <div key={option.value} className="flex items-center">
                            <Checkbox
                              isSelected={values.fields.includes(option.value)}
                              onChange={() => {
                                const newFields = values.fields.includes(option.value)
                                  ? values.fields.filter(f => f !== option.value)
                                  : [...values.fields, option.value];
                                setFieldValue('fields', newFields);
                              }}
                            >
                              {option.label}
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        color="primary"
                        isLoading={loading}
                        fullWidth
                      >
                        {t('reports.generate')}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        </div>
        
        {/* Report Results */}
        <div className="lg:col-span-3">
          <Card className="glass min-h-[400px]">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t('reports.results')}</h2>
              {reportData && reportData.length > 0 && (
                <Button
                  color="success"
                  size="sm"
                  onClick={handleExport}
                >
                  {t('reports.exportCSV')}
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner label={t('common.loading')} />
                </div>
              ) : reportData && reportData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {reportData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                          {columns.map((column) => (
                            <td
                              key={`${rowIndex}-${column.key}`}
                              className="px-6 py-4 whitespace-nowrap text-sm"
                            >
                              {row[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-lg mb-2">{t('reports.noResults')}</p>
                  <p className="text-sm text-gray-500">
                    {t('reports.selectOptionsMessage')}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;