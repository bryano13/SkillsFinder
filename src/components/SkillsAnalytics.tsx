import React, { useMemo } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../types';

interface SkillsAnalyticsProps {
  employees: Employee[];
}

export default function SkillsAnalytics({ employees }: SkillsAnalyticsProps) {
  const navigate = useNavigate();

  const skillsAnalytics = useMemo(() => {
    const skillsMap = new Map<string, {
      count: number;
      averageRating: number;
      ratingDistribution: number[];
      expertCount: number;
      seniorCount: number;
      midCount: number;
      juniorCount: number;
      beginnerCount: number;
    }>();

    employees.forEach(employee => {
      employee.skills.forEach(skill => {
        const rating = employee.skill_ratings?.[skill] || 3;
        const currentSkill = skillsMap.get(skill) || {
          count: 0,
          averageRating: 0,
          ratingDistribution: [0, 0, 0, 0, 0],
          expertCount: 0,
          seniorCount: 0,
          midCount: 0,
          juniorCount: 0,
          beginnerCount: 0
        };

        currentSkill.count++;
        currentSkill.averageRating = 
          (currentSkill.averageRating * (currentSkill.count - 1) + rating) / currentSkill.count;
        currentSkill.ratingDistribution[rating - 1]++;

        switch (rating) {
          case 5: currentSkill.expertCount++; break;
          case 4: currentSkill.seniorCount++; break;
          case 3: currentSkill.midCount++; break;
          case 2: currentSkill.juniorCount++; break;
          case 1: currentSkill.beginnerCount++; break;
        }

        skillsMap.set(skill, currentSkill);
      });
    });

    return Array.from(skillsMap.entries())
      .map(([skill, data]) => ({
        skill,
        ...data
      }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

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
            <h1 className="text-2xl font-bold">Skills Distribution</h1>
            <p className="text-blue-100">Analysis of skills across {employees.length} employees</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {skillsAnalytics.map(({ skill, count, averageRating, ratingDistribution, expertCount, seniorCount, midCount, juniorCount, beginnerCount }) => (
                <div key={skill} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{skill}</h3>
                      <p className="text-sm text-gray-500">{count} employees</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            averageRating >= star
                              ? 'fill-yellow-400 text-yellow-400'
                              : averageRating >= star - 0.5
                              ? 'fill-yellow-200 text-yellow-200'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm text-gray-600">Expert (5★)</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(expertCount / count) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">{expertCount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm text-gray-600">Senior (4★)</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(seniorCount / count) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">{seniorCount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm text-gray-600">Mid (3★)</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${(midCount / count) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">{midCount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm text-gray-600">Junior (2★)</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${(juniorCount / count) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">{juniorCount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm text-gray-600">Beginner (1★)</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${(beginnerCount / count) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">{beginnerCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}