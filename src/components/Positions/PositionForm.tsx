import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Input, 
  Textarea, 
  Text, 
  Loading,
  Spacer,
  Dropdown
} from '@nextui-org/react';

import { Position, Department } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface PositionFormProps {
  position: Position | null;
  onSave: () => void;
  onCancel: () => void;
}

const PositionForm: React.FC<PositionFormProps> = ({ position, onSave, onCancel }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isEditing = Boolean(position);
  
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Load departments
    const fetchDepartments = async () => {
      setDataLoading(true);
      
      try {
        const result = await window.electronAPI.getAllDepartments();
        if (result.success && result.departments) {
          setDepartments(result.departments);
        } else {
          setError(result.message || 'Failed to fetch departments');
        }
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('An unexpected error occurred while loading departments');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (position) {
      setTitle(position.title);
      setDepartmentId(position.department_id);
      setDescription(position.description || '');
    }
  }, [position]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      errors.title = t('positions.formErrors.titleRequired');
    }
    
    if (!departmentId) {
      errors.department = t('positions.formErrors.departmentRequired');
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
      
      if (isEditing && position) {
        result = await window.electronAPI.updatePosition({
          id: position.id,
          title,
          department_id: departmentId!,
          description: description || undefined
        });
      } else {
        result = await window.electronAPI.createPosition({
          title,
          department_id: departmentId!,
          description: description || undefined
        });
      }
      
      if (result.success) {
        onSave();
      } else {
        setError(result.message || 'Failed to save position');
      }
    } catch (err) {
      console.error('Error saving position:', err);
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
      
      {dataLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loading size="lg" color="primary" />
          <Spacer x={0.5} />
          <Text>{t('common.loading')}</Text>
        </div>
      ) : (
        <>
          <Input
            label={t('positions.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bordered
            fullWidth
            color={formErrors.title ? 'error' : 'default'}
            helperText={formErrors.title}
            helperColor="error"
            css={{ marginBottom: '1rem' }}
          />
          
          <div className="mb-4">
            <Text>{t('positions.department')}</Text>
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
                  : t('positions.selectDepartment')}
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
          
          <Textarea
            label={t('positions.description')}
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
        </>
      )}
    </form>
  );
};

export default PositionForm;
