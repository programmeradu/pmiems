/**
 * Member Service for the PSI-SUSAS Membership Data Management System
 */
import { Member } from '../types/Member';
import { format, differenceInMonths, differenceInYears } from 'date-fns';

// Define electron API check helper
const hasElectronAPI = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined' && 
         typeof window.electronAPI.getAllMembers === 'function';
}

export interface MemberResult {
  success: boolean;
  member?: Member;
  message?: string;
}

export interface MembersResult {
  success: boolean;
  members?: Member[];
  message?: string;
}

/**
 * Helper function to get members from local storage
 */
const getMembersFromStorage = (): Member[] => {
  const storedMembers = localStorage.getItem('psi_members');
  if (storedMembers) {
    try {
      return JSON.parse(storedMembers);
    } catch (e) {
      console.error('Error parsing stored members:', e);
      return [];
    }
  }
  return [];
};

/**
 * Helper function to save members to local storage
 */
const saveMembersToStorage = (members: Member[]): void => {
  localStorage.setItem('psi_members', JSON.stringify(members));
};

/**
 * Get all members
 */
export const getAllMembers = async (): Promise<MembersResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (hasElectronAPI()) {
      const result = await window.electronAPI.getAllMembers();
      return result;
    } else {
      // In dev environment without Electron, use local storage
      const members = getMembersFromStorage();
      console.log('Fetched members from localStorage:', members);
      return {
        success: true,
        members,
      };
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    return {
      success: false,
      message: 'Failed to fetch members',
    };
  }
};

/**
 * Get a member by ID
 */
export const getMemberById = async (id: number): Promise<MemberResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (hasElectronAPI()) {
      const result = await window.electronAPI.getMemberById(id);
      return result;
    } else {
      // In dev environment without Electron, get from local storage
      const members = getMembersFromStorage();
      const member = members.find(m => m.id === id);
      
      if (!member) {
        return {
          success: false,
          message: 'Member not found',
        };
      }
      
      return {
        success: true,
        member,
      };
    }
  } catch (error) {
    console.error(`Error fetching member ${id}:`, error);
    return {
      success: false,
      message: 'Failed to fetch member details',
    };
  }
};

/**
 * Create a new member
 */
export const createMember = async (member: Partial<Member>): Promise<MemberResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (hasElectronAPI()) {
      // Add timestamps
      const memberWithTimestamps = {
        ...member,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      
      const result = await window.electronAPI.createMember(memberWithTimestamps);
      return result;
    } else {
      // In dev environment without Electron, use local storage
      const members = getMembersFromStorage();
      
      // Generate a new ID (max + 1 or 1 if no members)
      const newId = members.length > 0 
        ? Math.max(...members.map(m => m.id)) + 1 
        : 1;
      
      const newMember = {
        id: newId,
        ...member,
        created_at: Date.now(),
        updated_at: Date.now(),
      } as Member;
      
      // Add to storage
      members.push(newMember);
      saveMembersToStorage(members);
      
      console.log('Created new member:', newMember);
      console.log('Updated members in localStorage:', members);
      
      return {
        success: true,
        member: newMember,
      };
    }
  } catch (error) {
    console.error('Error creating member:', error);
    return {
      success: false,
      message: 'Failed to create member',
    };
  }
};

/**
 * Update an existing member
 */
export const updateMember = async (member: Partial<Member> & { id: number }): Promise<MemberResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (hasElectronAPI()) {
      // Update timestamp
      const memberWithTimestamp = {
        ...member,
        updated_at: Date.now(),
      };
      
      const result = await window.electronAPI.updateMember(memberWithTimestamp);
      return result;
    } else {
      // In dev environment without Electron, use local storage
      const members = getMembersFromStorage();
      const index = members.findIndex(m => m.id === member.id);
      
      if (index === -1) {
        return {
          success: false,
          message: `Member with ID ${member.id} not found`,
        };
      }
      
      // Update the member
      const updatedMember = {
        ...members[index],
        ...member,
        updated_at: Date.now(),
      };
      
      members[index] = updatedMember;
      saveMembersToStorage(members);
      
      console.log('Updated member:', updatedMember);
      console.log('Updated members in localStorage:', members);
      
      return {
        success: true,
        member: updatedMember,
      };
    }
  } catch (error) {
    console.error(`Error updating member ${member.id}:`, error);
    return {
      success: false,
      message: 'Failed to update member',
    };
  }
};

/**
 * Delete a member
 */
export const deleteMember = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    // When running in Electron, use the electronAPI
    if (hasElectronAPI()) {
      const result = await window.electronAPI.deleteMember(id);
      return result;
    } else {
      // In dev environment without Electron, use local storage
      const members = getMembersFromStorage();
      const index = members.findIndex(m => m.id === id);
      
      if (index === -1) {
        return {
          success: false,
          message: `Member with ID ${id} not found`,
        };
      }
      
      // Remove the member
      members.splice(index, 1);
      saveMembersToStorage(members);
      
      console.log(`Deleted member with ID ${id}`);
      console.log('Updated members in localStorage:', members);
      
      return {
        success: true,
        message: 'Member deleted successfully',
      };
    }
  } catch (error) {
    console.error(`Error deleting member ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete member',
    };
  }
};

/**
 * Format member name
 */
export const formatMemberName = (member: Member): string => {
  return `${member.first_name} ${member.last_name}${member.other_names ? ` ${member.other_names}` : ''}`;
};

/**
 * Calculate member employment duration in years and months
 */
export const calculateEmploymentDuration = (dateOfEmployment: number | null): string => {
  if (!dateOfEmployment) return '-';

  const now = new Date();
  const employmentDate = new Date(dateOfEmployment);

  const years = differenceInYears(now, employmentDate);
  const months = differenceInMonths(now, employmentDate) % 12;

  if (years > 0 && months > 0) {
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
};

/**
 * Format membership date
 */
export const formatMembershipDate = (membershipDate: number | null): string => {
  if (!membershipDate) return '-';
  
  return format(new Date(membershipDate), 'PP');
};