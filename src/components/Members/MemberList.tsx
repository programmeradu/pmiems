import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';

import { Member } from '../../types';
import { getAllMembers, deleteMember, formatMemberName, formatMembershipDate } from '../../services/memberService';

const MemberList: React.FC = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = members.filter((member) => {
      return (
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTermLower) ||
        member.email?.toLowerCase().includes(searchTermLower) ||
        member.serial_number?.toLowerCase().includes(searchTermLower) ||
        member.membership_id?.toLowerCase().includes(searchTermLower) ||
        member.membership_position?.toLowerCase().includes(searchTermLower) ||
        member.employer?.toLowerCase().includes(searchTermLower)
      );
    });
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await getAllMembers();
      if (result.success && result.members) {
        setMembers(result.members);
        setFilteredMembers(result.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const openDeleteConfirmation = (member: Member) => {
    setMemberToDelete(member);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setMemberToDelete(null);
    setConfirmDeleteOpen(false);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const result = await deleteMember(memberToDelete.id);
      if (result.success) {
        setAlertMessage({
          type: 'success',
          message: t('members.memberDeleted')
        });
        fetchMembers();
      } else {
        setAlertMessage({
          type: 'error',
          message: result.message || t('common.error')
        });
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      setAlertMessage({
        type: 'error',
        message: t('common.error')
      });
    } finally {
      closeDeleteConfirmation();
    }
  };

  const renderGenderIcon = (params: GridRenderCellParams) => {
    const sex = params.value as string | null;
    if (sex === 'male') {
      return <MaleIcon color="primary" />;
    } else if (sex === 'female') {
      return <FemaleIcon color="secondary" />;
    } else {
      return <PersonIcon color="action" />;
    }
  };

  const renderDate = (params: GridRenderCellParams) => {
    return params.value ? format(new Date(params.value as number), 'PP') : '-';
  };

  const columns: GridColDef[] = [
    { field: 'serial_number', headerName: t('members.serialNumber'), width: 150 },
    { field: 'first_name', headerName: t('members.firstName'), width: 150 },
    { field: 'last_name', headerName: t('members.lastName'), width: 150 },
    { 
      field: 'sex', 
      headerName: t('members.sex'), 
      width: 100,
      renderCell: renderGenderIcon
    },
    { 
      field: 'contact_number', 
      headerName: t('members.contactNumber'), 
      width: 150
    },
    { 
      field: 'email', 
      headerName: t('members.email'), 
      width: 200
    },
    { 
      field: 'employer', 
      headerName: t('members.employer'), 
      width: 200
    },
    { 
      field: 'membership_id', 
      headerName: t('members.membershipId'), 
      width: 150
    },
    {
      field: 'membership_date',
      headerName: t('members.membershipDate'),
      width: 150,
      renderCell: renderDate
    },
    {
      field: 'actions',
      headerName: t('members.actions'),
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const member = params.row as Member;
        return (
          <Box>
            <Tooltip title={t('common.view')}>
              <IconButton
                component={RouterLink}
                to={`/dashboard/members/${member.id}`}
                size="small"
                color="info"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.edit')}>
              <IconButton
                component={RouterLink}
                to={`/dashboard/members/edit/${member.id}`}
                size="small"
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={() => openDeleteConfirmation(member)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {t('members.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/dashboard/members/add"
        >
          {t('members.addMember')}
        </Button>
      </Box>

      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
          <TextField
            label={t('common.search')}
            variant="standard"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              )
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ height: 'calc(100vh - 260px)', width: '100%' }}>
        <DataGrid
          rows={filteredMembers}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          disableRowSelectionOnClick
          loading={loading}
          components={{
            Toolbar: GridToolbar,
            LoadingOverlay: () => (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ),
            NoRowsOverlay: () => (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? t('common.noResults') : t('members.noMembers')}
                </Typography>
              </Box>
            )
          }}
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1
            }
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={closeDeleteConfirmation}
      >
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('members.confirmDelete')} {memberToDelete?.first_name} {memberToDelete?.last_name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteMember} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberList;