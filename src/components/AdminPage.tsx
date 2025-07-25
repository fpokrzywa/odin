import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

import { User, Role } from '../database/mongodb';

interface AdminPageProps {
}

const AdminPage: React.FC<AdminPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: 2,
    is_active: true
  });

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);

  const availablePermissions = [
    'user_management',
    'role_management',
    'system_settings',
    'basic_access',
    'team_management',
    'reporting',
    'analytics'
  ];

  // API functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`http://localhost:3001/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }

    return response.json();
  };

  const fetchUsers = async () => {
    try {
      const data = await apiCall('/users');
      setUsers(data);
    } catch (err: any) {
      setError('Failed to fetch users: ' + err.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiCall('/roles');
      setRoles(data);
    } catch (err: any) {
      setError('Failed to fetch roles: ' + err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Update role_id when roles are loaded and no role is selected
  useEffect(() => {
    if (roles.length > 0 && !editingUser && userForm.role_id === 2) {
      // Set default role to the first available role if "User" role (id: 2) doesn't exist
      const userRole = roles.find(role => role.id === 2);
      if (!userRole && roles.length > 0) {
        setUserForm(prev => ({ ...prev, role_id: roles[0].id }));
      }
    }
  }, [roles, editingUser, userForm.role_id]);

  // User operations
  const handleCreateUser = async () => {
    try {
      await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userForm),
      });
      setSuccess('User created successfully');
      setShowUserModal(false);
      resetUserForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updateData = { ...userForm };
      if (!updateData.password) {
        delete (updateData as any).password;
      }
      
      await apiCall(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      setSuccess('User updated successfully');
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiCall(`/users/${id}`, { method: 'DELETE' });
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Role operations
  const handleCreateRole = async () => {
    try {
      await apiCall('/roles', {
        method: 'POST',
        body: JSON.stringify(roleForm),
      });
      setSuccess('Role created successfully');
      setShowRoleModal(false);
      resetRoleForm();
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    
    try {
      await apiCall(`/roles/${editingRole.id}`, {
        method: 'PUT',
        body: JSON.stringify(roleForm),
      });
      setSuccess('Role updated successfully');
      setShowRoleModal(false);
      setEditingRole(null);
      resetRoleForm();
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await apiCall(`/roles/${id}`, { method: 'DELETE' });
      setSuccess('Role deleted successfully');
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Form helpers
  const resetUserForm = () => {
    setUserForm({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role_id: 2,
      is_active: true
    });
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    });
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        email: user.email,
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role_id: user.role_id,
        is_active: user.is_active
      });
    } else {
      setEditingUser(null);
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || '',
        permissions: JSON.parse(role.permissions)
      });
    } else {
      setEditingRole(null);
      resetRoleForm();
    }
    setShowRoleModal(true);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole === 'all' || user.role_id.toString() === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const togglePermission = (permission: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'users'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'roles'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Roles</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="px-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-8">
        {activeTab === 'users' ? (
          <div>
            {/* Users Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </div>
              <button
                onClick={() => openUserModal()}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            {/* Users Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id.toString()}>{role.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.email
                              }
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openUserModal(user)}
                              className="text-orange-600 hover:text-orange-700 p-1"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Roles Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
                <p className="text-gray-600">Manage roles and permissions</p>
              </div>
              <button
                onClick={() => openRoleModal()}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Role</span>
              </button>
            </div>

            {/* Roles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map(role => (
                <div key={role.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openRoleModal(role)}
                        className="text-orange-600 hover:text-orange-700 p-1"
                        title="Edit role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(role.permissions).map((permission: string) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(role.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowUserModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Add User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={userForm.first_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={userForm.last_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role_id}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role_id: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  {roles.length === 0 && (
                    <option value="">Loading roles...</option>
                  )}
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                {roles.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No roles available. Please create roles first.
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={userForm.is_active}
                  onChange={(e) => setUserForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active user
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowRoleModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRole ? 'Edit Role' : 'Add Role'}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Role description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;