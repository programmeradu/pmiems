import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Button, 
  Text, 
  Card, 
  Grid, 
  Spacer, 
  Loading,
  Divider
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Edit as EditIcon, 
  Trash2 as TrashIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  FileText as FileTextIcon
} from 'react-feather';

import { Employee } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const EmployeeDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        navigate('/employees');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await window.electronAPI.getEmployeeById(parseInt(id));
        if (result.success && result.employee) {
          setEmployee(result.employee);
        } else {
          setError(result.message || 'Failed to fetch employee details');
          setTimeout(() => navigate('/employees'), 3000);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
        setTimeout(() => navigate('/employees'), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployee();
  }, [id, navigate]);
  
  const formatSalary = (salary?: number) => {
    if (!salary) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(salary);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" color="primary" />
        <Spacer x={0.5} />
        <Text>{t('common.loading')}</Text>
      </div>
    );
  }
  
  if (error || !employee) {
    return (
      <div className="text-center p-6">
        <Text h4 color="error">{error || t('common.error')}</Text>
        <Spacer y={1} />
        <Text>{t('common.redirecting')}</Text>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            auto 
            light 
            icon={<ArrowLeftIcon size={20} />} 
            onClick={() => navigate('/employees')}
            css={{ padding: 0 }}
          />
          <Text h2 css={{ marginLeft: '0.5rem' }}>
            {t('employees.view')}
          </Text>
        </div>
        
        <div className="flex gap-2">
          <Button
            auto
            icon={<EditIcon size={16} />}
            onClick={() => navigate(`/employees/edit/${employee.id}`)}
          >
            {t('employees.edit')}
          </Button>
          <Button
            auto
            color="error"
            icon={<TrashIcon size={16} />}
            onClick={() => {
              // Navigate to employees list with delete modal open
              navigate('/employees', { state: { openDeleteModal: true, employeeToDelete: employee } });
            }}
          >
            {t('employees.delete')}
          </Button>
        </div>
      </div>
      
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
            <Card.Body css={{ overflow: 'hidden' }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-primary text-white text-3xl">
                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                </div>
                
                <Spacer y={1} />
                
                <Text h3>{`${employee.first_name} ${employee.last_name}`}</Text>
                <Text css={{ color: '$accents6' }}>{employee.position_title}</Text>
                <Text css={{ color: '$accents6' }}>{employee.department_name}</Text>
                
                <Spacer y={1} />
                <Divider />
                <Spacer y={1} />
                
                {employee.email && (
                  <div className="flex items-center mb-2 w-full">
                    <MailIcon size={16} className="mr-2" />
                    <Text>{employee.email}</Text>
                  </div>
                )}
                
                {employee.phone && (
                  <div className="flex items-center mb-2 w-full">
                    <PhoneIcon size={16} className="mr-2" />
                    <Text>{employee.phone}</Text>
                  </div>
                )}
                
                {employee.address && (
                  <div className="flex items-center w-full">
                    <MapPinIcon size={16} className="mr-2" />
                    <Text>{employee.address}</Text>
                  </div>
                )}
              </div>
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
            <Card.Body>
              <Text h3>{t('employees.detail')}</Text>
              <Spacer y={1} />
              
              <Grid.Container gap={2}>
                <Grid xs={12} sm={6}>
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                      <BriefcaseIcon size={16} className="mr-2" />
                      <Text b>{t('employees.department')}</Text>
                    </div>
                    <Text>{employee.department_name}</Text>
                  </div>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                      <BriefcaseIcon size={16} className="mr-2" />
                      <Text b>{t('employees.position')}</Text>
                    </div>
                    <Text>{employee.position_title}</Text>
                  </div>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                      <CalendarIcon size={16} className="mr-2" />
                      <Text b>{t('employees.hireDate')}</Text>
                    </div>
                    <Text>{new Date(employee.hire_date).toLocaleDateString()}</Text>
                  </div>
                </Grid>
                
                <Grid xs={12} sm={6}>
                  <div className="w-full">
                    <div className="flex items-center mb-1">
                      <DollarSignIcon size={16} className="mr-2" />
                      <Text b>{t('employees.salary')}</Text>
                    </div>
                    <Text>{formatSalary(employee.salary)}</Text>
                  </div>
                </Grid>
                
                {employee.notes && (
                  <Grid xs={12}>
                    <div className="w-full">
                      <div className="flex items-center mb-1">
                        <FileTextIcon size={16} className="mr-2" />
                        <Text b>{t('employees.notes')}</Text>
                      </div>
                      <Card variant="flat" css={{ backgroundColor: theme === 'dark' ? '$gray900' : '$gray100' }}>
                        <Card.Body>
                          <Text>{employee.notes}</Text>
                        </Card.Body>
                      </Card>
                    </div>
                  </Grid>
                )}
              </Grid.Container>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </motion.div>
  );
};

export default EmployeeDetail;
