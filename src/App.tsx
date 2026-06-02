import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { dataService } from './lib/dataService';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import SkillsAnalytics from './components/SkillsAnalytics';
import SkillsDistribution from './components/SkillsDistribution';
import type { Employee } from './types';
import { Star, BarChart2, PieChart, Boxes } from 'lucide-react';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchSkills, setSearchSkills] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const fetchEmployees = async () => {
    try {
      setError(null);
      const employeesWithSkills = await dataService.listEmployees();

      setEmployees(employeesWithSkills);
      setFilteredEmployees(showFavorites 
        ? employeesWithSkills.filter(emp => emp.is_favorite)
        : employeesWithSkills
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch employees data');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [showFavorites]);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 p-6 flex flex-col border-r border-gray-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-48 mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 flex items-center justify-center">
              <Boxes size={48} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="w-full h-px bg-gray-200 mb-4" />
            <h1 className="text-xl font-bold text-gray-800">
              Skills Finder
            </h1>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setShowFavorites(false);
                navigate('/');
              }}
              className={`w-full text-left py-2 px-4 rounded transition-colors ${
                !showFavorites && location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              All Employees
            </button>
            <button 
              onClick={() => {
                setShowFavorites(true);
                navigate('/');
              }}
              className={`w-full text-left py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                showFavorites && location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <Star size={18} className={showFavorites ? 'fill-blue-700' : ''} />
              Favorites
            </button>
            <div className="w-full h-px bg-gray-200" />
            <button 
              onClick={() => navigate('/analytics')}
              className={`w-full text-left py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                location.pathname === '/analytics'
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <BarChart2 size={18} />
              Skills Analytics
            </button>
            <button 
              onClick={() => navigate('/distribution')}
              className={`w-full text-left py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                location.pathname === '/distribution'
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <PieChart size={18} />
              Skills Distribution
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {error && (
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}
          <Routes>
            <Route 
              path="/" 
              element={
                <EmployeeList
                  employees={employees}
                  setEmployees={setEmployees}
                  filteredEmployees={filteredEmployees}
                  setFilteredEmployees={setFilteredEmployees}
                  searchSkills={searchSkills}
                  setSearchSkills={setSearchSkills}
                  fetchEmployees={fetchEmployees}
                  showFavorites={showFavorites}
                />
              }
            />
            <Route path="/employee/:id" element={<EmployeeDetail />} />
            <Route path="/analytics" element={<SkillsAnalytics employees={employees} />} />
            <Route path="/distribution" element={<SkillsDistribution employees={employees} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
