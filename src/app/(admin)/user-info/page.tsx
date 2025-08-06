"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Edit3,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Camera,
  Shield
} from 'lucide-react';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  department?: string;
  jobTitle?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  role: string;
  pharmacyName?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function UserInfoPage() {
  const { user, isLoaded } = useUser();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    department: '',
    jobTitle: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          department: data.department || '',
          jobTitle: data.jobTitle || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || ''
        });
      } else {
        throw new Error('Failed to fetch user information');
      }
    } catch (err: any) {
      setError(err.message);
      // Use session data as fallback
      if (session?.user) {
        const fallbackInfo: UserInfo = {
          id: session.user.id || '1',
          name: session.user.name || 'User',
          email: session.user.email || 'user@example.com',
          role: session.user.role || 'USER',
          pharmacyName: 'Georgies Specialty Pharmacy',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        setUserInfo(fallbackInfo);
        setEditForm({
          name: fallbackInfo.name,
          email: fallbackInfo.email,
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          department: '',
          jobTitle: '',
          emergencyContact: '',
          emergencyPhone: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update user information');
      }

      const updatedInfo = await response.json();
      setUserInfo(updatedInfo);
      setEditing(false);
      setSuccess('User information updated successfully');
      
      // Update session
      await update({
        name: editForm.name,
        email: editForm.email
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Information Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Information</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and contact details
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userInfo.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userInfo.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{userInfo.email}</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
              userInfo.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {userInfo.role === 'ADMIN' ? 'Administrator' : 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Information
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name *
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address *
            </label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Job Title
            </label>
            {editing ? (
              <input
                type="text"
                name="jobTitle"
                value={editForm.jobTitle}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Pharmacist, Technician"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.jobTitle || 'Not provided'}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            {editing ? (
              <select
                name="department"
                value={editForm.department}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Administration">Administration</option>
                <option value="IT">Information Technology</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Compliance">Compliance</option>
                <option value="Operations">Operations</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.department || 'Not provided'}</p>
            )}
          </div>

          {/* Pharmacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Pharmacy
            </label>
            <p className="text-gray-900 dark:text-white">{userInfo.pharmacyName || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Street Address
            </label>
            {editing ? (
              <input
                type="text"
                name="address"
                value={editForm.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.address || 'Not provided'}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            {editing ? (
              <input
                type="text"
                name="city"
                value={editForm.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.city || 'Not provided'}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            {editing ? (
              <input
                type="text"
                name="state"
                value={editForm.state}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.state || 'Not provided'}</p>
            )}
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            {editing ? (
              <input
                type="text"
                name="zipCode"
                value={editForm.zipCode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.zipCode || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Name
            </label>
            {editing ? (
              <input
                type="text"
                name="emergencyContact"
                value={editForm.emergencyContact}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.emergencyContact || 'Not provided'}</p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Phone
            </label>
            {editing ? (
              <input
                type="tel"
                name="emergencyPhone"
                value={editForm.emergencyPhone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{userInfo.emergencyPhone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Member Since
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(userInfo.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Last Login
            </label>
            <p className="text-gray-900 dark:text-white">
              {userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Actions */}
      {editing && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setEditing(false);
              setEditForm({
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone || '',
                address: userInfo.address || '',
                city: userInfo.city || '',
                state: userInfo.state || '',
                zipCode: userInfo.zipCode || '',
                department: userInfo.department || '',
                jobTitle: userInfo.jobTitle || '',
                emergencyContact: userInfo.emergencyContact || '',
                emergencyPhone: userInfo.emergencyPhone || ''
              });
              setError(null);
            }}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}