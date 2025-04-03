import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Textarea, 
  Dropdown, 
  Text, 
  Spacer, 
  Loading, 
  Grid,
  Card
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { ArrowLeft as ArrowLeftIcon, User as UserIcon } from 'react-feather';

import { Employee, Department, Position } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { validateEmail } from '../../utils/validation';

const EmployeeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const isEditing = Boolean(id);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  
  // Data loading state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    // Load departments and positions
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const [deptResult, posResult] = await Promise.all([
          window.electronAPI.getAllDepartments(),
          window.electronAPI.getAllPositions()
        ]);
        
        if (deptResult.success && deptResult.departments) {
          setDepartments(deptResult.departments);
        }
        
        if (posResult.success && posResult.positions) {
          setPositions(posResult.positions);
        }
        
        // If editing, fetch employee data
        if (isEditing && id) {
          const empResult = await window.electronAPI.getEmployeeById(parseInt(id));
          
          if (empResult.success && empResult.employee) {
            const employee = empResult.employee;
            setFirstName(employee.first_name);
            setLastName(employee.last_name);
            setEmail(employee.email || '');
            setPhone(employee.phone || '');
            setAddress(employee.address || '');
            setDepartmentId(employee.department_id);
            setPositionId(employee.position_id);
            setHireDate(new Date(employee.hire_date).toISOString().split('T')[0]);
            setSalary(employee.salary?.toString() || '');
            setNotes(employee.notes || '');
            
            // Update available positions based on selected department
            updateAvailablePositions(employee.department_id);
          } else {
            setError(empResult.message || 'Failed to fetch employee data');
            navigate('/employees');
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('An unexpected error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing, navigate]);
  
  // Update available positions when department changes
  useEffect(() => {
    if (departmentId) {
      updateAvailablePositions(departmentId);
    } else {
      setAvailablePositions([]);
    }
  }, [departmentId, positions]);
  
  const updateAvailablePositions = (deptId: number) => {
    const filteredPositions = positions.filter(p => p.department_id === deptId);
    setAvailablePositions(filteredPositions);
    
    // Reset position if the current one doesn't belong to the selected department
    const currentPositionValid = filteredPositions.some(p => p.id === positionId);
    if (!currentPositionValid) {
      setPositionId(null);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!firstName.trim()) {
      errors.firstName = t('employees.formErrors.firstNameRequired');
    }
    
    if (!lastName.trim()) {
      errors.lastName = t('employees.formErrors.lastNameRequired');
    }
    
    if (email && !validateEmail(email)) {
      errors.email = t('employees.formErrors.emailInvalid');
    }
    
    if (!departmentId) {
      errors.department = t('employees.formErrors.departmentRequired');
    }
    
    if (!positionId) {
      errors.position = t('employees.formErrors.positionRequired');
    }
    
    if (!hireDate) {
      errors.hireDate = t('employees.formErrors.hireDateRequired');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const employeeData: Partial<Employee> = {
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        department_id: departmentId!,
        position_id: positionId!,
        hire_date: new Date(hireDate).getTime(),
        salary: salary ? parseFloat(salary) : undefined,
        notes: notes || undefined
      };
      
      let result;
      
      if (isEditing && id) {
        result = await window.electronAPI.updateEmployee({
          id: parseInt(id),
          ...employeeData
        });
      } else {
        result = await window.electronAPI.createEmployee(employeeData);
      }
      
      if (result.success) {
        navigate('/employees');
      } else {
        setError(result.message || 'Failed to save employee');
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
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
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <Button 
          auto 
          light 
          icon={<ArrowLeftIcon size={20} />} 
          onClick={() => navigate('/employees')}
          css={{ padding: 0 }}
        />
        <Text h2 css={{ marginLeft: '0.5rem' }}>
          {isEditing ? t('employees.editEmployee') : t('employees.addEmployee')}
        </Text>
      </div>
      
      <Card
        variant="bordered"
        css={{
          backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
          boxShadow: theme === 'dark' 
            ? '0 4px 14px 0 rgba(0, 0, 0, 0.2)' 
            : '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
          padding: '1.5rem'
        }}
      >
        <Card.Body>
          {error && (
            <div className="mb-4">
              <Text color="error">{error}</Text>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid.Container gap={2}>
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Input
                    label={t('employees.firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    bordered
                    fullWidth
                    color={formErrors.firstName ? 'error' : 'default'}
                    helperText={formErrors.firstName}
                    helperColor="error"
                  />
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Input
                    label={t('employees.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    bordered
                    fullWidth
                    color={formErrors.lastName ? 'error' : 'default'}
                    helperText={formErrors.lastName}
                    helperColor="error"
                  />
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Input
                    label={t('employees.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bordered
                    fullWidth
                    type="email"
                    color={formErrors.email ? 'error' : 'default'}
                    helperText={formErrors.email}
                    helperColor="error"
                  />
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Input
                    label={t('employees.phone')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    bordered
                    fullWidth
                  />
                </div>
              </Grid>
              
              <Grid xs={12}>
                <div className="w-full">
                  <Input
                    label={t('employees.address')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    bordered
                    fullWidth
                  />
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Dropdown>
                    <Dropdown.Button 
                      flat 
                      css={{ 
                        width: '100%', 
                        justifyContent: 'space-between',
                        backgroundColor: theme === 'dark' ? '$gray700' : '$gray100',
                        borderColor: formErrors.department ? '$error' : 'default'
                      }}
                    >
                      {departmentId 
                        ? departments.find(d => d.id === departmentId)?.name 
                        : t('employees.selectDepartment')}
                    </Dropdown.Button>
                    <Dropdown.Menu
                      aria-label="Department selection"
                      onAction={(key) => setDepartmentId(Number(key))}
                      selectionMode="single"
                      selectedKeys={departmentId ? [`${departmentId}`] : []}
                    >
                      {departments.map((dept) => (
                        <Dropdown.Item key={dept.id}>
                          {dept.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  {formErrors.department && (
                    <Text color="error" size="small">{formErrors.department}</Text>
                  )}
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Dropdown isDisabled={!departmentId}>
                    <Dropdown.Button 
                      flat 
                      css={{ 
                        width: '100%', 
                        justifyContent: 'space-between',
                        backgroundColor: theme === 'dark' ? '$gray700' : '$gray100',
                        borderColor: formErrors.position ? '$error' : 'default'
                      }}
                    >
                      {positionId 
                        ? positions.find(p => p.id === positionId)?.title 
                        : t('employees.selectPosition')}
                    </Dropdown.Button>
                    <Dropdown.Menu
                      aria-label="Position selection"
                      onAction={(key) => setPositionId(Number(key))}
                      selectionMode="single"
                      selectedKeys={positionId ? [`${positionId}`] : []}
                    >
                      {availablePositions.map((pos) => (
                        <Dropdown.Item key={pos.id}>
                          {pos.title}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  {formErrors.position && (
                    <Text color="error" size="small">{formErrors.position}</Text>
                  )}
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Input
                    label={t('employees.hireDate')}
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    type="date"
                    bordered
                    fullWidth
                    color={formErrors.hireDate ? 'error' : 'default'}
                    helperText={formErrors.hireDate}
                    helperColor="error"
                  />
                </div>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <div className="w-full">
                  <Input
                    label={t('employees.salary')}
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    type="number"
                    step="0.01"
                    bordered
                    fullWidth
                  />
                </div>
              </Grid>
              
              <Grid xs={12}>
                <div className="w-full">
                  <Textarea
                    label={t('employees.notes')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    bordered
                    fullWidth
                    rows={4}
                  />
                </div>
              </Grid>
              
              <Grid xs={12} css={{ marginTop: '1rem' }}>
                <div className="flex justify-end gap-2 w-full">
                  <Button
                    auto
                    flat
                    onClick={() => navigate('/employees')}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    auto
                    type="submit"
                    color="primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loading type="points" color="currentColor" size="sm" />
                    ) : (
                      t('common.save')
                    )}
                  </Button>
                </div>
              </Grid>
            </Grid.Container>
          </form>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default EmployeeForm;
