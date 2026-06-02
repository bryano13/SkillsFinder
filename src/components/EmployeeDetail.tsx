import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound, Briefcase, Calendar, Award, Star, Linkedin, Edit2, X, Plus, Trash2, ExternalLink, Save } from 'lucide-react';
import { dataService } from '../lib/dataService';
import type { Employee, Certification } from '../types';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingLinkedIn, setIsEditingLinkedIn] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNewCertification, setShowNewCertification] = useState(false);
  const [editingCertification, setEditingCertification] = useState<string | null>(null);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editedSkillRatings, setEditedSkillRatings] = useState<Record<string, number>>({});
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);
  const [newCertification, setNewCertification] = useState({
    title: '',
    udemy_url: '',
    completed_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        if (!id) {
          throw new Error('Employee not found');
        }

        const employeeData = await dataService.getEmployee(id);

        if (!employeeData) {
          throw new Error('Employee not found');
        }

        const certificationsData = await dataService.listCertifications(id);

        setEmployee(employeeData);
        setEditedSkillRatings(employeeData.skill_ratings || {});
        setCertifications(certificationsData || []);
        setLinkedInUrl(employeeData.linkedin_url || '');
      } catch (error) {
        console.error('Error fetching employee details:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch employee details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!employee) return;

    try {
      const updatedEmployee = await dataService.toggleFavorite(employee);
      setEmployee(updatedEmployee);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
    }
  };

  const handleUpdateLinkedIn = async () => {
    if (!employee) return;

    try {
      setIsUpdating(true);
      await dataService.updateLinkedInUrl(employee.id, linkedInUrl);

      setEmployee(prev => prev ? { ...prev, linkedin_url: linkedInUrl } : null);
      setIsEditingLinkedIn(false);
    } catch (error) {
      console.error('Error updating LinkedIn URL:', error);
      setError('Failed to update LinkedIn URL');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSkillRatings = async () => {
    if (!employee) return;

    try {
      setIsUpdating(true);
      await dataService.updateSkillRatings(employee.id, editedSkillRatings);

      setEmployee(prev => prev ? { ...prev, skill_ratings: editedSkillRatings } : null);
      setIsEditingSkills(false);
    } catch (error) {
      console.error('Error updating skill ratings:', error);
      setError('Failed to update skill ratings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      setIsUpdating(true);
      const data = await dataService.addCertification(employee.id, {
        title: newCertification.title,
        udemy_url: newCertification.udemy_url,
        completed_at: new Date(newCertification.completed_at).toISOString(),
      });

      setCertifications(prev => [data, ...prev]);
      setShowNewCertification(false);
      setNewCertification({
        title: '',
        udemy_url: '',
        completed_at: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding certification:', error);
      setError('Failed to add certification');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCertification = async (cert: Certification) => {
    try {
      setIsUpdating(true);
      await dataService.updateCertification(cert);

      setCertifications(prev => 
        prev.map(c => c.id === cert.id ? cert : c)
      );
      setEditingCertification(null);
    } catch (error) {
      console.error('Error updating certification:', error);
      setError('Failed to update certification');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCertification = async (certificationId: string) => {
    try {
      await dataService.deleteCertification(certificationId);

      setCertifications(prev => prev.filter(cert => cert.id !== certificationId));
    } catch (error) {
      console.error('Error deleting certification:', error);
      setError('Failed to delete certification');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employee) return;

    const confirmed = window.confirm(`Delete ${employee.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setIsDeletingEmployee(true);
      await dataService.deleteEmployee(employee.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('Failed to delete employee');
    } finally {
      setIsDeletingEmployee(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Employee not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 flex items-center text-blue-500 hover:text-blue-600"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Employee List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Employee List
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white relative">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {employee.avatar_url ? (
                  <img 
                    src={employee.avatar_url} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <UserRound className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{employee.name}</h1>
                      {!isEditingLinkedIn && (
                        employee.linkedin_url ? (
                          <a
                            href={employee.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                            title="View LinkedIn Profile"
                          >
                            <Linkedin size={24} />
                          </a>
                        ) : (
                          <button
                            onClick={() => setIsEditingLinkedIn(true)}
                            className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                            title="Add LinkedIn Profile"
                          >
                            <Linkedin size={20} />
                            <span className="text-sm">Add LinkedIn</span>
                          </button>
                        )
                      )}
                      {employee.linkedin_url && !isEditingLinkedIn && (
                        <button
                          onClick={() => setIsEditingLinkedIn(true)}
                          className="text-white/60 hover:text-white"
                          title="Edit LinkedIn URL"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-blue-100 text-lg">{employee.title}</p>
                    {isEditingLinkedIn && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="url"
                          value={linkedInUrl}
                          onChange={(e) => setLinkedInUrl(e.target.value)}
                          placeholder="https://www.linkedin.com/in/username"
                          className="px-3 py-1.5 rounded text-gray-900 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          onClick={handleUpdateLinkedIn}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 transition-colors disabled:opacity-50 text-sm"
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingLinkedIn(false);
                            setLinkedInUrl(employee.linkedin_url || '');
                          }}
                          className="p-1.5 text-white/60 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteEmployee}
                      disabled={isDeletingEmployee}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      title="Delete Employee"
                    >
                      <Trash2 size={24} />
                    </button>
                    <button
                      onClick={handleToggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        employee.is_favorite 
                          ? 'bg-white/10 text-yellow-300 hover:bg-white/20' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Star size={24} className={employee.is_favorite ? 'fill-yellow-300' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Professional Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="mr-3" size={20} />
                  <span>{employee.title}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-3" size={20} />
                  <span>{employee.years_of_experience} years of experience</span>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Skills & Expertise</h2>
                {!isEditingSkills && (
                  <button
                    onClick={() => setIsEditingSkills(true)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                    <span className="text-sm">Edit Ratings</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.skills.map((skill, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100"
                  >
                    <span className="text-blue-700 font-medium">{skill}</span>
                    {isEditingSkills ? (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setEditedSkillRatings(prev => ({
                              ...prev,
                              [skill]: star
                            }))}
                            className="focus:outline-none"
                          >
                            <Star
                              size={16}
                              className={`${
                                (editedSkillRatings[skill] || 3) >= star
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              (employee.skill_ratings?.[skill] || 3) >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isEditingSkills && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsEditingSkills(false);
                      setEditedSkillRatings(employee.skill_ratings || {});
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSkillRatings}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {isUpdating ? 'Saving...' : 'Save Ratings'}
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                ★★★★★ Expert &nbsp; ★★★★ Senior &nbsp; ★★★ Mid-level &nbsp; ★★ Junior &nbsp; ★ Beginner
              </p>
            </div>

            {/* Experience Level */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience Level</h2>
              <div className="flex items-center gap-4">
                <Award className="text-blue-500" size={24} />
                <div>
                  <p className="text-gray-700">
                    {employee.years_of_experience < 3 ? 'Junior Level' :
                     employee.years_of_experience < 6 ? 'Mid Level' :
                     employee.years_of_experience < 10 ? 'Senior Level' : 'Expert Level'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {employee.years_of_experience} years of professional experience
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Udemy Certifications</h2>
                <button
                  onClick={() => setShowNewCertification(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Certification
                </button>
              </div>

              {showNewCertification && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <form onSubmit={handleAddCertification} className="space-y-4">
                    <div>
                      <label htmlFor="cert-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        id="cert-title"
                        required
                        value={newCertification.title}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter course title"
                      />
                    </div>

                    <div>
                      <label htmlFor="cert-url" className="block text-sm font-medium text-gray-700 mb-1">
                        Udemy Course URL *
                      </label>
                      <input
                        type="url"
                        id="cert-url"
                        required
                        value={newCertification.udemy_url}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, udemy_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.udemy.com/course/..."
                      />
                    </div>

                    <div>
                      <label htmlFor="cert-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Date *
                      </label>
                      <input
                        type="date"
                        id="cert-date"
                        required
                        value={newCertification.completed_at}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, completed_at: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNewCertification(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Adding...' : 'Add Certification'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {certifications.length > 0 ? (
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {editingCertification === cert.id ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateCertification(cert);
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={cert.title}
                              onChange={(e) => setCertifications(prev => 
                                prev.map(c => c.id === cert.id ? { ...c, title: e.target.value } : c)
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Udemy Course URL *
                            </label>
                            <input
                              type="url"
                              required
                              value={cert.udemy_url}
                              onChange={(e) => setCertifications(prev => 
                                prev.map(c => c.id === cert.id ? { ...c, udemy_url: e.target.value } : c)
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Completion Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={new Date(cert.completed_at).toISOString().split('T')[0]}
                              onChange={(e) => setCertifications(prev => 
                                prev.map(c => c.id === cert.id ? { ...c, completed_at: e.target.value } : c)
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingCertification(null)}
                              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <Save size={16} />
                              {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{cert.title}</h3>
                            <p className="text-sm text-gray-500">
                              Completed on {new Date(cert.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={cert.udemy_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                              title="View Course"
                            >
                              <ExternalLink size={18} />
                            </a>
                            <button
                              onClick={() => setEditingCertification(cert.id)}
                              className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                              title="Edit Certification"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCertification(cert.id)}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                              title="Delete Certification"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No certifications added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
