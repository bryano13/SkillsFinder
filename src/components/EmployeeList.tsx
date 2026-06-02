import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserRound, Edit2, Plus, XCircle, X, Upload, Clock, Star, Globe, User, Trash2 } from 'lucide-react';
import { dataService } from '../lib/dataService';
import type { Employee } from '../types';

// List of countries with reliable flag URLs
const countries = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DE', name: 'Germany' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'ES', name: 'Spain' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IN', name: 'India' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'PE', name: 'Peru' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'ZA', name: 'South Africa' }
].sort((a, b) => a.name.localeCompare(b.name));

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  filteredEmployees: Employee[];
  setFilteredEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  searchSkills: string;
  setSearchSkills: (value: string) => void;
  fetchEmployees: () => Promise<void>;
  showFavorites: boolean;
}

export default function EmployeeList({
  employees,
  setEmployees,
  filteredEmployees,
  setFilteredEmployees,
  searchSkills,
  setSearchSkills,
  fetchEmployees,
  showFavorites,
}: EmployeeListProps) {
  const navigate = useNavigate();
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    title: '',
    years_of_experience: 0,
    skills: [],
    country_code: 'US'
  });
  const [newSkill, setNewSkill] = useState('');
  const [editSkill, setEditSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

  const handleSearch = (skillsValue: string) => {
    setSearchSkills(skillsValue);
    filterEmployees(skillsValue, experienceFilter, searchName, selectedCountry);
  };

  const handleExperienceFilterChange = (value: string) => {
    setExperienceFilter(value);
    filterEmployees(searchSkills, value, searchName, selectedCountry);
  };

  const handleNameSearch = (value: string) => {
    setSearchName(value);
    filterEmployees(searchSkills, experienceFilter, value, selectedCountry);
  };

  const handleCountryFilter = (value: string) => {
    setSelectedCountry(value);
    filterEmployees(searchSkills, experienceFilter, searchName, value);
  };

  const filterEmployees = (skills: string, experience: string, name: string, country: string) => {
    let filtered = [...employees];

    if (showFavorites) {
      filtered = filtered.filter(emp => emp.is_favorite);
    }

    // Filter by name
    if (name.trim()) {
      const searchTerm = name.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by country
    if (country) {
      filtered = filtered.filter(employee => employee.country_code === country);
    }

    // Filter by skills
    if (skills.trim()) {
      const searchTerms = skills.toLowerCase().split(',').map(term => term.trim());
      filtered = filtered.filter(employee =>
        searchTerms.every(term =>
          employee.skills.some(skill => skill.toLowerCase().includes(term))
        )
      );
    }

    // Filter by experience
    switch (experience) {
      case 'junior':
        filtered = filtered.filter(emp => emp.years_of_experience < 3);
        break;
      case 'mid':
        filtered = filtered.filter(emp => emp.years_of_experience >= 3 && emp.years_of_experience < 6);
        break;
      case 'senior':
        filtered = filtered.filter(emp => emp.years_of_experience >= 6 && emp.years_of_experience < 10);
        break;
      case 'expert':
        filtered = filtered.filter(emp => emp.years_of_experience >= 10);
        break;
    }

    setFilteredEmployees(filtered);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    try {
      const updatedEmployee = await dataService.toggleFavorite(employee);

      const updatedEmployees = employees.map(emp => 
        emp.id === employee.id 
          ? updatedEmployee
          : emp
      );
      setEmployees(updatedEmployees);
      
      const updatedFiltered = filteredEmployees.map(emp => 
        emp.id === employee.id 
          ? updatedEmployee
          : emp
      );
      setFilteredEmployees(updatedFiltered);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
    }
  };

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, employeeId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(employeeId);
      setError(null);
      const publicUrl = await dataService.uploadEmployeeAvatar(employeeId, file);

      if (editingEmployee && editingEmployee.id === employeeId) {
        setEditingEmployee(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      }

      await fetchEmployees();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(null);
    }
  }, [fetchEmployees, editingEmployee]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>, isEdit: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skillToAdd = (isEdit ? editSkill : newSkill).trim();
      
      if (skillToAdd) {
        if (isEdit && editingEmployee) {
          if (!editingEmployee.skills.includes(skillToAdd)) {
            setEditingEmployee(prev => ({
              ...prev!,
              skills: [...prev!.skills, skillToAdd]
            }));
          }
          setEditSkill('');
        } else {
          if (!newEmployee.skills.includes(skillToAdd)) {
            setNewEmployee(prev => ({
              ...prev,
              skills: [...prev.skills, skillToAdd]
            }));
          }
          setNewSkill('');
        }
      }
    }
  };

  const removeSkill = (skillToRemove: string, isEdit: boolean = false) => {
    if (isEdit && editingEmployee) {
      setEditingEmployee(prev => ({
        ...prev!,
        skills: prev!.skills.filter(skill => skill !== skillToRemove)
      }));
    } else {
      setNewEmployee(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill !== skillToRemove)
      }));
    }
  };

  const startEditing = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEmployee({
      ...employee,
      skills: [...employee.skills]
    });
    setShowEditEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(`Delete ${employee.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingEmployeeId(employee.id);
      setError(null);
      await dataService.deleteEmployee(employee.id);

      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      setFilteredEmployees(prev => prev.filter(emp => emp.id !== employee.id));

      if (editingEmployee?.id === employee.id) {
        setShowEditEmployeeModal(false);
        setEditingEmployee(null);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('Failed to delete employee. Please try again.');
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    if (!editingEmployee.name.trim() || !editingEmployee.title.trim() || editingEmployee.skills.length === 0) {
      setError('Please fill in all required fields and add at least one skill');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await dataService.updateEmployee(editingEmployee);

      setShowEditEmployeeModal(false);
      setEditingEmployee(null);
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('Failed to update employee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmployee.name.trim() || !newEmployee.title.trim() || newEmployee.skills.length === 0) {
      setError('Please fill in all required fields and add at least one skill');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await dataService.createEmployee({
        name: newEmployee.name.trim(),
        title: newEmployee.title.trim(),
        years_of_experience: newEmployee.years_of_experience,
        country_code: newEmployee.country_code,
        skills: newEmployee.skills,
      });

      setNewEmployee({
        name: '',
        title: '',
        years_of_experience: 0,
        skills: [],
        country_code: 'US'
      });
      setShowNewEmployeeModal(false);
      await fetchEmployees();
    } catch (error) {
      console.error('Error in handleCreateEmployee:', error);
      setError(error instanceof Error ? error.message : 'Failed to create new employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name Search */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchName}
                  onChange={(e) => handleNameSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 placeholder-gray-500"
                />
              </div>

              {/* Skills Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by skills"
                  value={searchSkills}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 placeholder-gray-500"
                />
              </div>

              {/* Country Filter */}
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 appearance-none cursor-pointer"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowNewEmployeeModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Add Employee
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Clock size={20} className="text-gray-400" />
            <div className="flex gap-2">
              <button
                onClick={() => handleExperienceFilterChange('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  experienceFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleExperienceFilterChange('junior')}
                className={`px-3 py-1 rounded-full text-sm ${
                  experienceFilter === 'junior'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Junior (&lt;3y)
              </button>
              <button
                onClick={() => handleExperienceFilterChange('mid')}
                className={`px-3 py-1 rounded-full text-sm ${
                  experienceFilter === 'mid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mid (3-5y)
              </button>
              <button
                onClick={() => handleExperienceFilterChange('senior')}
                className={`px-3 py-1 rounded-full text-sm ${
                  experienceFilter === 'senior'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Senior (6-9y)
              </button>
              <button
                onClick={() => handleExperienceFilterChange('expert')}
                className={`px-3 py-1 rounded-full text-sm ${
                  experienceFilter === 'expert'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expert (10y+)
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <p className="ml-4">
            Separate multiple skills with commas
          </p>
          {(searchName || searchSkills || selectedCountry || experienceFilter !== 'all') && (
            <p>
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => navigate(`/employee/${employee.id}`)}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group cursor-pointer border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="bg-blue-500 w-12 h-12 rounded-full overflow-hidden">
                    {employee.avatar_url ? (
                      <img 
                        src={employee.avatar_url} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserRound className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  {employee.country_code && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                      <img
                        src={`https://flagcdn.com/w40/${employee.country_code.toLowerCase()}.png`}
                        alt={`${countries.find(c => c.code === employee.country_code)?.name || 'Country'} flag`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleFavorite(e, employee)}
                        className={`p-1 transition-colors ${
                          employee.is_favorite 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star size={20} className={employee.is_favorite ? 'fill-yellow-500' : ''} />
                      </button>
                      <button
                        onClick={(e) => startEditing(employee, e)}
                        className="p-1 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit employee"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteEmployee(employee, e)}
                        disabled={deletingEmployeeId === employee.id}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        title="Delete employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {employee.years_of_experience} years of experience
              </p>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {showFavorites 
                ? 'No favorite employees found.' 
                : 'No employees found with the specified criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Employee Modal */}
      {showEditEmployeeModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Employee</h2>
              <button
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-500">
                    {editingEmployee.avatar_url ? (
                      <img 
                        src={editingEmployee.avatar_url} 
                        alt={editingEmployee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserRound className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <label 
                    className="absolute -right-1 -bottom-1 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 border border-gray-200"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e, editingEmployee.id)}
                      disabled={uploadingAvatar === editingEmployee.id}
                    />
                    {uploadingAvatar === editingEmployee.id ? (
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <Upload size={20} className="text-gray-500" />
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editingEmployee.title}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev!, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="edit-country"
                  value={editingEmployee.country_code || ''}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev!, country_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="edit-experience"
                  min="0"
                  value={editingEmployee.years_of_experience}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev!, years_of_experience: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-skills" className="block text-sm font-medium text-gray-700 mb-1">
                  Skills * (Press Enter after each skill)
                </label>
                <input
                  type="text"
                  id="edit-skills"
                  value={editSkill}
                  onChange={(e) => setEditSkill(e.target.value)}
                  onKeyDown={(e) => handleAddSkill(e, true)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a skill and press Enter"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingEmployee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, true)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <XCircle size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Employee Modal */}
      {showNewEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
              <button
                onClick={() => setShowNewEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEmployee.title}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label htmlFor="new-country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="new-country"
                  value={newEmployee.country_code}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, country_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  min="0"
                  value={newEmployee.years_of_experience}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  Skills * (Press Enter after each skill)
                </label>
                <input
                  type="text"
                  id="skills"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => handleAddSkill(e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a skill and press Enter"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {newEmployee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <XCircle size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewEmployeeModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
