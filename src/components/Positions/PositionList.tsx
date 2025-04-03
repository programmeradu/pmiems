import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, 
  Button, 
  Input, 
  Text, 
  Loading, 
  Modal, 
  Spacer,
  Badge
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Trash2 as TrashIcon,
  Briefcase as BriefcaseIcon
} from 'react-feather';

import { Position } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import PositionForm from './PositionForm';

const PositionList: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredPositions(positions);
    } else {
      const filtered = positions.filter(position => 
        position.title.toLowerCase().includes(searchText.toLowerCase()) ||
        position.department_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        (position.description && position.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredPositions(filtered);
    }
  }, [searchText, positions]);

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.getAllPositions();
      if (result.success && result.positions) {
        setPositions(result.positions);
        setFilteredPositions(result.positions);
      } else {
        setError(result.message || 'Failed to fetch positions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (position: Position | null = null) => {
    setSelectedPosition(position);
    setShowFormModal(true);
  };

  const handleCloseForm = (shouldRefresh: boolean = false) => {
    setShowFormModal(false);
    setSelectedPosition(null);
    if (shouldRefresh) {
      fetchPositions();
    }
  };

  const handleDeleteClick = (position: Position) => {
    setSelectedPosition(position);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!selectedPosition) return;
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      const result = await window.electronAPI.deletePosition(selectedPosition.id);
      if (result.success) {
        setPositions(prev => prev.filter(pos => pos.id !== selectedPosition.id));
        setShowDeleteModal(false);
        setSelectedPosition(null);
      } else {
        setDeleteError(result.message || 'Failed to delete position');
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
        <Text h2>{t('positions.title')}</Text>
        <Button
          color="primary"
          auto
          icon={<PlusIcon size={16} />}
          onClick={() => handleOpenForm()}
        >
          {t('positions.addPosition')}
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

      {filteredPositions.length === 0 ? (
        <div className="flex justify-center items-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text>{t('positions.noPositions')}</Text>
        </div>
      ) : (
        <Table
          aria-label="Positions table"
          css={{
            height: 'auto',
            minWidth: '100%',
            backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
          }}
          selectionMode="none"
        >
          <Table.Header>
            <Table.Column>{t('positions.title')}</Table.Column>
            <Table.Column>{t('positions.department')}</Table.Column>
            <Table.Column>{t('positions.description')}</Table.Column>
            <Table.Column>{t('positions.actions')}</Table.Column>
          </Table.Header>
          <Table.Body>
            {filteredPositions.map((position) => (
              <Table.Row key={position.id}>
                <Table.Cell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white text-xs">
                      <BriefcaseIcon size={14} />
                    </div>
                    <Text css={{ marginLeft: '0.5rem' }}>
                      {position.title}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="success" variant="flat">
                    {position.department_name}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{position.description || '-'}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      auto
                      light
                      icon={<EditIcon size={16} />}
                      onClick={() => handleOpenForm(position)}
                    />
                    <Button
                      auto
                      light
                      color="error"
                      icon={<TrashIcon size={16} />}
                      onClick={() => handleDeleteClick(position)}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {/* Position Form Modal */}
      <Modal
        closeButton
        aria-labelledby="position-form-modal"
        open={showFormModal}
        onClose={() => handleCloseForm()}
        width="600px"
      >
        <Modal.Header>
          <Text id="position-form-modal" size={18}>
            {selectedPosition ? t('positions.editPosition') : t('positions.addPosition')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <PositionForm
            position={selectedPosition}
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
            {t('positions.confirmDelete')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          {selectedPosition && (
            <Text>
              {selectedPosition.title}
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

export default PositionList;
