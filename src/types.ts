export interface Employee {
  id: string;
  name: string;
  title: string;
  years_of_experience: number;
  skills: string[];
  avatar_url?: string;
  is_favorite?: boolean;
  linkedin_url?: string;
  country_code?: string;
  skill_ratings?: Record<string, number>;
}

export interface Certification {
  id: string;
  employee_id: string;
  title: string;
  udemy_url: string;
  completed_at: string;
  created_at: string;
}