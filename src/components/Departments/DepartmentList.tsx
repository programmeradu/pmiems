import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, 
  Button, 
  Input, 
  Text, 
  Loading, 
  Modal, 
  Spacer 
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Trash2 as TrashIcon,
  Users as UsersIcon
} from 'react-feather';

import { Department } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import DepartmentForm from './DepartmentForm';

const DepartmentList: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(dept => 
        dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  }, [searchText, departments]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.getAllDepartments();
      if (result.success && result.departments) {
        setDepartments(result.departments);
        setFilteredDepartments(result.departments);
      } else {
        setError(result.message || 'Failed to fetch departments');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (department: Department | null = null) => {
    setSelectedDepartment(department);
    setShowFormModal(true);
  };

  const handleCloseForm = (shouldRefresh: boolean = false) => {
    setShowFormModal(false);
    setSelectedDepartment(null);
    if (shouldRefresh) {
      fetchDepartments();
    }
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      const result = await window.electronAPI.deleteDepartment(selectedDepartment.id);
      if (result.success) {
        setDepartments(prev => prev.filter(dept => dept.id !== selectedDepartment.id));
        setShowDeleteModal(false);
        setSelectedDepartment(null);
      } else {
        setDeleteError(result.message || 'Failed to delete department');
      }
    } catch (err) {
      setDeleteError('An unexpected error occurred');
      console.error(err);
    } finally {
      setDeleting(false);
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
      <div className="flex justify-between items-center mb-6">
        <Text h2>{t('departments.title')}</Text>
        <Button
          color="primary"
          auto
          icon={<PlusIcon size={16} />}
          onClick={() => handleOpenForm()}
        >
          {t('departments.addDepartment')}
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

      {filteredDepartments.length === 0 ? (
        <div className="flex justify-center items-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text>{t('departments.noDepartments')}</Text>
        </div>
      ) : (
        <Table
          aria-label="Departments table"
          css={{
            height: 'auto',
            minWidth: '100%',
            backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
          }}
          selectionMode="none"
        >
          <Table.Header>
            <Table.Column>{t('departments.name')}</Table.Column>
            <Table.Column>{t('departments.description')}</Table.Column>
            <Table.Column>{t('departments.actions')}</Table.Column>
          </Table.Header>
          <Table.Body>
            {filteredDepartments.map((department) => (
              <Table.Row key={department.id}>
                <Table.Cell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-success text-white text-xs">
                      {department.name.charAt(0)}
                    </div>
                    <Text css={{ marginLeft: '0.5rem' }}>
                      {department.name}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>{department.description || '-'}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      auto
                      light
                      icon={<EditIcon size={16} />}
                      onClick={() => handleOpenForm(department)}
                    />
                    <Button
                      auto
                      light
                      color="error"
                      icon={<TrashIcon size={16} />}
                      onClick={() => handleDeleteClick(department)}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {/* Department Form Modal */}
      <Modal
        closeButton
        aria-labelledby="department-form-modal"
        open={showFormModal}
        onClose={() => handleCloseForm()}
        width="600px"
      >
        <Modal.Header>
          <Text id="department-form-modal" size={18}>
            {selectedDepartment ? t('departments.editDepartment') : t('departments.addDepartment')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <DepartmentForm
            department={selectedDepartment}
            onSave={() => handleCloseForm(true)}
            onCancel={() => handleCloseForm()}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        closeButton
        aria-labelledby="delete-modal"
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <Modal.Header>
          <Text id="delete-modal" size={18}>
            {t('departments.confirmDelete')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          {selectedDepartment && (
            <Text>
              {selectedDepartment.name}
            </Text>
          )}
          {deleteError && (
            <Text color="error">
              {deleteError}
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

export default DepartmentList;
