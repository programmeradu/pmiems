import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Input, 
  Textarea, 
  Text, 
  Loading,
  Spacer
} from '@nextui-org/react';

import { Department } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DepartmentFormProps {
  department: Department | null;
  onSave: () => void;
  onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSave, onCancel }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isEditing = Boolean(department);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description || '');
    }
  }, [department]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      errors.name = t('departments.formErrors.nameRequired');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (isEditing && department) {
        result = await window.electronAPI.updateDepartment({
          id: department.id,
          name,
          description: description || undefined
        });
      } else {
        result = await window.electronAPI.createDepartment({
          name,
          description: description || undefined
        });
      }
      
      if (result.success) {
        onSave();
      } else {
        setError(result.message || 'Failed to save department');
      }
    } catch (err) {
      console.error('Error saving department:', err);
      setError('An unexpected error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4">
          <Text color="error">{error}</Text>
        </div>
      )}
      
      <Input
        label={t('departments.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        bordered
        fullWidth
        color={formErrors.name ? 'error' : 'default'}
        helperText={formErrors.name}
        helperColor="error"
        css={{ marginBottom: '1rem' }}
      />
      
      <Textarea
        label={t('departments.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        bordered
        fullWidth
        rows={4}
        css={{ marginBottom: '1rem' }}
      />
      
      <Spacer y={1} />
      
      <div className="flex justify-end gap-2">
        <Button
          auto
          flat
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        <Button
          auto
          type="submit"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <Loading type="points" color="currentColor" size="sm" />
          ) : (
            t('common.save')
          )}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
