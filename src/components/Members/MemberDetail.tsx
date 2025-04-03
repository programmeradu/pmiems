import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  CardMembership as MembershipIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Wc as GenderIcon,
  Cake as AgeIcon,
  Home as HomeIcon,
  Public as PublicIcon,
  Numbers as NumbersIcon,
  ChildCare as ChildrenIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { Member } from '../../types';
import { getMemberById, deleteMember, formatMembershipDate, calculateEmploymentDuration } from '../../services/memberService';

const MemberDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      setLoading(true);
      try {
        const result = await getMemberById(parseInt(id));
        if (result.success && result.member) {
          setMember(result.member);
        } else {
          setError(result.message || t('members.notFound'));
        }
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, t]);

  const openDeleteConfirmation = () => {
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setConfirmDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const result = await deleteMember(parseInt(id));
      if (result.success) {
        navigate('/members', { state: { message: t('members.memberDeleted'), type: 'success' } });
      } else {
        setError(result.message || t('common.error'));
        closeDeleteConfirmation();
      }
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(t('common.error'));
      closeDeleteConfirmation();
    }
  };

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string | null | undefined) => {
    return (
      <ListItem>
        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
          {icon}
        </Avatar>
        <ListItemText 
          primary={label}
          secondary={value || '-'}
          primaryTypographyProps={{ 
            variant: 'subtitle2',
            color: 'text.secondary',
            sx: { mb: 0.5 }
          }}
          secondaryTypographyProps={{ 
            variant: 'body1',
            color: 'text.primary'
          }}
        />
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !member) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || t('members.notFound')}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/members"
        >
          {t('common.backToList')}
        </Button>
      </Box>
    );
  }

  const genderIcon = member.sex === 'male' ? <MaleIcon /> : 
                     member.sex === 'female' ? <FemaleIcon /> : 
                     <GenderIcon />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/dashboard/members"
            sx={{ mr: 2 }}
          >
            {t('common.backToList')}
          </Button>
          <Typography variant="h5" component="h1">
            {member.first_name} {member.last_name}
          </Typography>
          {member.membership_id && (
            <Chip 
              icon={<MembershipIcon />}
              label={member.membership_id}
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <Box>
          <Tooltip title={t('common.edit')}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/dashboard/members/edit/${member.id}`}
              sx={{ mr: 1 }}
            >
              {t('common.edit')}
            </Button>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={openDeleteConfirmation}
            >
              {t('common.delete')}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              {t('members.tabs.demographics')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {renderDetailItem(<NumbersIcon />, t('members.serialNumber'), member.serial_number)}
              {renderDetailItem(<PersonIcon />, t('members.fullName'), `${member.first_name} ${member.last_name} ${member.other_names || ''}`)}
              {renderDetailItem(genderIcon, t('members.sex'), member.sex ? t(`members.sexOptions.${member.sex}`) : '-')}
              {renderDetailItem(<AgeIcon />, t('members.age'), member.age?.toString() || '-')}
              {renderDetailItem(<PeopleIcon />, t('members.maritalStatus'), member.marital_status ? t(`members.maritalStatusOptions.${member.marital_status}`) : '-')}
              {renderDetailItem(<ChildrenIcon />, t('members.childrenCount'), member.children_count?.toString() || '-')}
            </List>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1 }} />
              {t('members.tabs.contactInfo')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {renderDetailItem(<PhoneIcon />, t('members.contactNumber'), member.contact_number)}
              {renderDetailItem(<EmailIcon />, t('members.email'), member.email)}
              {renderDetailItem(<HomeIcon />, t('members.currentAddress'), member.current_address)}
              {renderDetailItem(<PublicIcon />, t('members.countryRegion'), member.country_region)}
              {renderDetailItem(<BadgeIcon />, t('members.socialSecurityNumber'), member.social_security_number)}
            </List>
          </Paper>
        </Grid>

        {/* Employment Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ mr: 1 }} />
              {t('members.tabs.employment')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {renderDetailItem(<BusinessIcon />, t('members.employer'), member.employer)}
              {renderDetailItem(<WorkIcon />, t('members.employmentType'), member.employment_type)}
              {renderDetailItem(
                <CalendarIcon />, 
                t('members.dateOfEmployment'), 
                member.date_of_employment ? format(new Date(member.date_of_employment), 'PPP') : '-'
              )}
              {renderDetailItem(
                <CalendarIcon />, 
                t('members.employmentDuration'), 
                calculateEmploymentDuration(member.date_of_employment)
              )}
              {renderDetailItem(<LocationIcon />, t('members.placeOfWork'), member.place_of_work)}
              {renderDetailItem(<WorkIcon />, t('members.department'), member.department_name)}
              {renderDetailItem(<WorkIcon />, t('members.position'), member.position_title)}
            </List>
          </Paper>
        </Grid>

        {/* Membership Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MembershipIcon sx={{ mr: 1 }} />
              {t('members.tabs.membership')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {renderDetailItem(<MembershipIcon />, t('members.membershipId'), member.membership_id)}
              {renderDetailItem(
                <CalendarIcon />, 
                t('members.membershipDate'), 
                formatMembershipDate(member.membership_date)
              )}
              {renderDetailItem(<BadgeIcon />, t('members.membershipPosition'), member.membership_position)}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={closeDeleteConfirmation}
      >
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('members.confirmDelete')} {member.first_name} {member.last_name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberDetail;