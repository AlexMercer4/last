import axiosInstance from '@/lib/axiosInstance';

export const usersApi = {
  // Get all users (Admin/Chairperson)
  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  // Create user (Admin only for chairpersons)
  createUser: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin/Chairperson)
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  // Get students (Counselor/Chairperson/Admin)
  getStudents: async () => {
    const response = await axiosInstance.get('/users/students');
    return response.data.data; // Return the actual data array
  },

  // Get counselors (All roles)
  getCounselors: async () => {
    const response = await axiosInstance.get('/users/counselors');
    return response.data.data; // Return the actual data array
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/auth/change-password', passwordData);
    return response.data;
  },
};