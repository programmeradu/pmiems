import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Text, Loading, Modal, Spacer, Badge } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Plus as PlusIcon, Search as SearchIcon, Edit as EditIcon, Trash2 as TrashIcon } from 'react-feather';

import { Employee } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee => {
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const position = employee.position_title?.toLowerCase() || '';
        const department = employee.department_name?.toLowerCase() || '';
        const search = searchText.toLowerCase();
        
        return fullName.includes(search) || 
               position.includes(search) || 
               department.includes(search);
      });
      setFilteredEmployees(filtered);
    }
  }, [searchText, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.getAllEmployees();
      if (result.success && result.employees) {
        setEmployees(result.employees);
        setFilteredEmployees(result.employees);
      } else {
        setError(result.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    setDeleting(true);
    
    try {
      const result = await window.electronAPI.deleteEmployee(selectedEmployee.id);
      if (result.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
        setSelectedEmployee(null);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete employee');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <Text h2>{t('employees.title')}</Text>
        <Button
          color="primary"
          auto
          icon={<PlusIcon size={16} />}
          onClick={() => navigate('/employees/new')}
        >
          {t('employees.addEmployee')}
        </Button>
      </div>

      <div className="mb-4">
        <Input
          clearable
          contentLeft={<SearchIcon size={16} />}
          placeholder={t('common.search')}
          css={{ 
            width: '100%',
            maxWidth: '500px',
            backgroundColor: theme === 'dark' ? '$gray800' : '$gray100',
          }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4">
          <Text color="error">{error}</Text>
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <div className="flex justify-center items-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text>{t('employees.noEmployees')}</Text>
        </div>
      ) : (
        <Table
          aria-label="Employee table"
          css={{
            height: 'auto',
            minWidth: '100%',
            backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
          }}
          selectionMode="none"
        >
          <Table.Header>
            <Table.Column>{t('employees.name')}</Table.Column>
            <Table.Column>{t('employees.position')}</Table.Column>
            <Table.Column>{t('employees.department')}</Table.Column>
            <Table.Column>{t('employees.email')}</Table.Column>
            <Table.Column>{t('employees.hireDate')}</Table.Column>
            <Table.Column>{t('employees.salary')}</Table.Column>
            <Table.Column>{t('employees.actions')}</Table.Column>
          </Table.Header>
          <Table.Body>
            {filteredEmployees.map((employee) => (
              <Table.Row key={employee.id}>
                <Table.Cell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white text-xs">
                      {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                    </div>
                    <Text css={{ marginLeft: '0.5rem' }}>
                      {employee.first_name} {employee.last_name}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>{employee.position_title || '-'}</Table.Cell>
                <Table.Cell>{employee.department_name || '-'}</Table.Cell>
                <Table.Cell>{employee.email || '-'}</Table.Cell>
                <Table.Cell>
                  {new Date(employee.hire_date).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>{formatSalary(employee.salary)}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      auto
                      light
                      icon={<EditIcon size={16} />}
                      onClick={() => navigate(`/employees/edit/${employee.id}`)}
                    />
                    <Button
                      auto
                      light
                      color="error"
                      icon={<TrashIcon size={16} />}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowDeleteModal(true);
                      }}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal
        closeButton
        aria-labelledby="delete-modal"
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <Modal.Header>
          <Text id="delete-modal" size={18}>
            {t('employees.confirmDelete')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <Text>
              {`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
            </Text>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="default" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            auto
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loading size="sm" color="currentColor" /> : t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default EmployeeList;
