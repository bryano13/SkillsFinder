import React, { useMemo } from 'react';
import { ArrowLeft, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Employee } from '../types';

interface SkillsDistributionProps {
  employees: Employee[];
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
];

export default function SkillsDistribution({ employees }: SkillsDistributionProps) {
  const navigate = useNavigate();
  const [viewType, setViewType] = React.useState<'pie' | 'bar'>('pie');

  const skillsData = useMemo(() => {
    const skillsCount = new Map<string, number>();
    let totalSkillsCount = 0;

    employees.forEach(employee => {
      employee.skills.forEach(skill => {
        const currentCount = skillsCount.get(skill) || 0;
        skillsCount.set(skill, currentCount + 1);
        totalSkillsCount++;
      });
    });

    return Array.from(skillsCount.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / employees.length) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 skills
  }, [employees]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-gray-600">
            {data.value} employees ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Employee List
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Skills Distribution</h1>
                <p className="text-blue-100">Percentage of employees with each skill</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewType('pie')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewType === 'pie'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:bg-white/10'
                  }`}
                >
                  <PieChartIcon size={24} />
                </button>
                <button
                  onClick={() => setViewType('bar')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewType === 'bar'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:bg-white/10'
                  }`}
                >
                  <BarChartIcon size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="h-[600px] w-full">
              {viewType === 'pie' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={200}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="%" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="percentage"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      label={{ position: 'right', formatter: (value: number) => `${value.toFixed(1)}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>
                  Most common skill: {skillsData[0]?.name} ({skillsData[0]?.percentage.toFixed(1)}% of employees)
                </li>
                <li>
                  {skillsData.length} different skills represented in top skills
                </li>
                <li>
                  Average of {(skillsData.reduce((acc, curr) => acc + curr.value, 0) / employees.length).toFixed(1)} skills per employee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}