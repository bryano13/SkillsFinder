import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound, Briefcase, Calendar, Award, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();

        if (employeeError) throw employeeError;

        if (!employeeData) {
          throw new Error('Employee not found');
        }

        const { data: skillsData, error: skillsError } = await supabase
          .from('employee_skills')
          .select('skill')
          .eq('employee_id', id);

        if (skillsError) throw skillsError;

        const { data: favoriteData } = await supabase
          .from('employee_favorites')
          .select('id')
          .eq('employee_id', id);

        setEmployee({
          ...employeeData,
          skills: skillsData?.map(s => s.skill) || [],
          is_favorite: favoriteData && favoriteData.length > 0
        });
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
      if (employee.is_favorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('employee_favorites')
          .delete()
          .eq('employee_id', employee.id);
        
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('employee_favorites')
          .insert({ employee_id: employee.id });
        
        if (error) throw error;
      }

      // Update local state
      setEmployee(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
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
                    <h1 className="text-2xl font-bold">{employee.name}</h1>
                    <p className="text-blue-100 text-lg">{employee.title}</p>
                  </div>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}