import { supabase } from './supabase';
import type { Certification, Employee } from '../types';

type DataSource = 'mock' | 'supabase';

interface EmployeeInput {
  name: string;
  title: string;
  years_of_experience: number;
  skills: string[];
  country_code?: string;
}

interface MockDatabase {
  employees: Employee[];
  certifications: Certification[];
}

const STORAGE_KEY = 'skillsfinder-mock-db';

const sampleEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Sofia Ramirez',
    title: 'Frontend Engineer',
    years_of_experience: 6,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Testing Library'],
    country_code: 'ES',
    is_favorite: true,
    linkedin_url: 'https://www.linkedin.com/in/sofia-ramirez-dev',
    skill_ratings: {
      React: 5,
      TypeScript: 4,
      'Tailwind CSS': 4,
      'Testing Library': 4,
    },
  },
  {
    id: 'emp-002',
    name: 'Daniel Kim',
    title: 'Full Stack Developer',
    years_of_experience: 8,
    skills: ['Node.js', 'PostgreSQL', 'React', 'AWS'],
    country_code: 'US',
    linkedin_url: 'https://www.linkedin.com/in/daniel-kim-stack',
    skill_ratings: {
      'Node.js': 5,
      PostgreSQL: 4,
      React: 4,
      AWS: 4,
    },
  },
  {
    id: 'emp-003',
    name: 'Lucia Gomez',
    title: 'Data Analyst',
    years_of_experience: 4,
    skills: ['SQL', 'Python', 'Power BI', 'Excel'],
    country_code: 'CO',
    is_favorite: true,
    linkedin_url: 'https://www.linkedin.com/in/lucia-gomez-data',
    skill_ratings: {
      SQL: 5,
      Python: 4,
      'Power BI': 5,
      Excel: 4,
    },
  },
  {
    id: 'emp-004',
    name: 'Mateo Alvarez',
    title: 'DevOps Engineer',
    years_of_experience: 10,
    skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    country_code: 'AR',
    skill_ratings: {
      Docker: 5,
      Kubernetes: 5,
      Terraform: 4,
      'CI/CD': 5,
    },
  },
  {
    id: 'emp-005',
    name: 'Emma Wilson',
    title: 'UX Designer',
    years_of_experience: 5,
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    country_code: 'GB',
    linkedin_url: 'https://www.linkedin.com/in/emma-wilson-ux',
    skill_ratings: {
      Figma: 5,
      'Design Systems': 4,
      'User Research': 4,
      Prototyping: 5,
    },
  },
  {
    id: 'emp-006',
    name: 'Aarav Shah',
    title: 'Backend Engineer',
    years_of_experience: 7,
    skills: ['Go', 'Microservices', 'Redis', 'Kafka'],
    country_code: 'IN',
    skill_ratings: {
      Go: 5,
      Microservices: 4,
      Redis: 4,
      Kafka: 3,
    },
  },
  {
    id: 'emp-007',
    name: 'Camila Torres',
    title: 'QA Automation Engineer',
    years_of_experience: 3,
    skills: ['Playwright', 'Cypress', 'API Testing', 'JavaScript'],
    country_code: 'MX',
    skill_ratings: {
      Playwright: 4,
      Cypress: 4,
      'API Testing': 4,
      JavaScript: 3,
    },
  },
  {
    id: 'emp-008',
    name: 'Noah Fischer',
    title: 'Engineering Manager',
    years_of_experience: 12,
    skills: ['Team Leadership', 'System Design', 'Agile', 'Mentoring'],
    country_code: 'DE',
    is_favorite: true,
    linkedin_url: 'https://www.linkedin.com/in/noah-fischer-eng',
    skill_ratings: {
      'Team Leadership': 5,
      'System Design': 5,
      Agile: 4,
      Mentoring: 5,
    },
  },
];

const sampleCertifications: Certification[] = [
  {
    id: 'cert-001',
    employee_id: 'emp-001',
    title: 'Advanced React Patterns',
    udemy_url: 'https://www.udemy.com/course/advanced-react-patterns/',
    completed_at: '2025-10-14T00:00:00.000Z',
    created_at: '2025-10-14T00:00:00.000Z',
  },
  {
    id: 'cert-002',
    employee_id: 'emp-002',
    title: 'AWS Certified Developer Practice',
    udemy_url: 'https://www.udemy.com/course/aws-certified-developer-practice/',
    completed_at: '2025-08-22T00:00:00.000Z',
    created_at: '2025-08-22T00:00:00.000Z',
  },
  {
    id: 'cert-003',
    employee_id: 'emp-004',
    title: 'Terraform on Azure and AWS',
    udemy_url: 'https://www.udemy.com/course/terraform-on-azure-and-aws/',
    completed_at: '2025-12-02T00:00:00.000Z',
    created_at: '2025-12-02T00:00:00.000Z',
  },
];

function getConfiguredSource(): DataSource {
  return import.meta.env.VITE_DATA_SOURCE === 'supabase' ? 'supabase' : 'mock';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortEmployees(employees: Employee[]) {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
}

function sortCertifications(certifications: Certification[]) {
  return [...certifications].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
}

function createInitialDatabase(): MockDatabase {
  return {
    employees: clone(sampleEmployees),
    certifications: clone(sampleCertifications),
  };
}

function loadMockDatabase(): MockDatabase {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    const initialDatabase = createInitialDatabase();
    saveMockDatabase(initialDatabase);
    return initialDatabase;
  }

  try {
    const parsed = JSON.parse(storedValue) as MockDatabase;
    return {
      employees: parsed.employees ?? [],
      certifications: parsed.certifications ?? [],
    };
  } catch {
    const initialDatabase = createInitialDatabase();
    saveMockDatabase(initialDatabase);
    return initialDatabase;
  }
}

function saveMockDatabase(database: MockDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function ensureSkillRatings(employee: Employee): Employee {
  const skillRatings = employee.skill_ratings ?? {};
  const completedRatings = employee.skills.reduce<Record<string, number>>((ratings, skill) => {
    ratings[skill] = skillRatings[skill] ?? 3;
    return ratings;
  }, {});

  return {
    ...employee,
    skill_ratings: completedRatings,
  };
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

async function listEmployeesFromSupabase(): Promise<Employee[]> {
  const { data: employeesData, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .order('name');

  if (employeesError) throw employeesError;
  if (!employeesData) return [];

  const employeesWithSkills = await Promise.all(
    employeesData.map(async (employee) => {
      const { data: skillsData, error: skillsError } = await supabase
        .from('employee_skills')
        .select('skill')
        .eq('employee_id', employee.id);

      if (skillsError) throw skillsError;

      const { data: favoriteData } = await supabase
        .from('employee_favorites')
        .select('id')
        .eq('employee_id', employee.id);

      return ensureSkillRatings({
        ...employee,
        skills: skillsData?.map((skillRow) => skillRow.skill) || [],
        is_favorite: Boolean(favoriteData && favoriteData.length > 0),
      });
    })
  );

  return sortEmployees(employeesWithSkills);
}

async function listEmployeesFromMock(): Promise<Employee[]> {
  const database = loadMockDatabase();
  return sortEmployees(database.employees.map(ensureSkillRatings));
}

async function getEmployeeFromSupabase(employeeId: string): Promise<Employee | null> {
  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (employeeError) throw employeeError;
  if (!employeeData) return null;

  const { data: skillsData, error: skillsError } = await supabase
    .from('employee_skills')
    .select('skill')
    .eq('employee_id', employeeId);

  if (skillsError) throw skillsError;

  const { data: favoriteData } = await supabase
    .from('employee_favorites')
    .select('id')
    .eq('employee_id', employeeId);

  return ensureSkillRatings({
    ...employeeData,
    skills: skillsData?.map((skillRow) => skillRow.skill) || [],
    is_favorite: Boolean(favoriteData && favoriteData.length > 0),
  });
}

async function getEmployeeFromMock(employeeId: string): Promise<Employee | null> {
  const database = loadMockDatabase();
  const employee = database.employees.find((entry) => entry.id === employeeId);
  return employee ? ensureSkillRatings(employee) : null;
}

async function toggleFavoriteInSupabase(employee: Employee): Promise<Employee> {
  if (employee.is_favorite) {
    const { error } = await supabase
      .from('employee_favorites')
      .delete()
      .eq('employee_id', employee.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('employee_favorites')
      .insert({ employee_id: employee.id });
    if (error) throw error;
  }

  return {
    ...employee,
    is_favorite: !employee.is_favorite,
  };
}

async function toggleFavoriteInMock(employee: Employee): Promise<Employee> {
  const database = loadMockDatabase();
  const nextEmployees = database.employees.map((entry) =>
    entry.id === employee.id ? { ...entry, is_favorite: !entry.is_favorite } : entry
  );
  saveMockDatabase({ ...database, employees: nextEmployees });
  const updatedEmployee = nextEmployees.find((entry) => entry.id === employee.id);
  if (!updatedEmployee) {
    throw new Error('Employee not found');
  }
  return ensureSkillRatings(updatedEmployee);
}

async function createEmployeeInSupabase(employee: EmployeeInput): Promise<Employee> {
  const employeeToCreate = {
    name: employee.name.trim(),
    title: employee.title.trim(),
    years_of_experience: employee.years_of_experience,
    country_code: employee.country_code,
  };

  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .insert(employeeToCreate)
    .select()
    .single();

  if (employeeError) throw employeeError;
  if (!employeeData) {
    throw new Error('No employee data returned after insert');
  }

  const skillsToInsert = employee.skills.map((skill) => ({
    employee_id: employeeData.id,
    skill,
  }));

  const { error: skillsError } = await supabase
    .from('employee_skills')
    .insert(skillsToInsert);

  if (skillsError) throw skillsError;

  return ensureSkillRatings({
    ...employeeData,
    skills: employee.skills,
    is_favorite: false,
  });
}

async function createEmployeeInMock(employee: EmployeeInput): Promise<Employee> {
  const database = loadMockDatabase();
  const createdEmployee = ensureSkillRatings({
    id: createId('emp'),
    name: employee.name.trim(),
    title: employee.title.trim(),
    years_of_experience: employee.years_of_experience,
    skills: employee.skills,
    country_code: employee.country_code,
    is_favorite: false,
    skill_ratings: employee.skills.reduce<Record<string, number>>((ratings, skill) => {
      ratings[skill] = 3;
      return ratings;
    }, {}),
  });

  saveMockDatabase({
    ...database,
    employees: [...database.employees, createdEmployee],
  });

  return createdEmployee;
}

async function updateEmployeeInSupabase(employee: Employee): Promise<Employee> {
  const { error: updateError } = await supabase
    .from('employees')
    .update({
      name: employee.name.trim(),
      title: employee.title.trim(),
      years_of_experience: employee.years_of_experience,
      country_code: employee.country_code,
    })
    .eq('id', employee.id);

  if (updateError) throw updateError;

  const { error: deleteError } = await supabase
    .from('employee_skills')
    .delete()
    .eq('employee_id', employee.id);

  if (deleteError) throw deleteError;

  const skillsToInsert = employee.skills.map((skill) => ({
    employee_id: employee.id,
    skill,
  }));

  const { error: skillsError } = await supabase
    .from('employee_skills')
    .insert(skillsToInsert);

  if (skillsError) throw skillsError;

  return ensureSkillRatings(employee);
}

async function updateEmployeeInMock(employee: Employee): Promise<Employee> {
  const database = loadMockDatabase();
  const updatedEmployees = database.employees.map((entry) =>
    entry.id === employee.id
      ? ensureSkillRatings({
          ...entry,
          ...employee,
          name: employee.name.trim(),
          title: employee.title.trim(),
          skills: employee.skills,
          skill_ratings: employee.skills.reduce<Record<string, number>>((ratings, skill) => {
            ratings[skill] = employee.skill_ratings?.[skill] ?? entry.skill_ratings?.[skill] ?? 3;
            return ratings;
          }, {}),
        })
      : entry
  );

  saveMockDatabase({
    ...database,
    employees: updatedEmployees,
  });

  const updatedEmployee = updatedEmployees.find((entry) => entry.id === employee.id);
  if (!updatedEmployee) {
    throw new Error('Employee not found');
  }

  return ensureSkillRatings(updatedEmployee);
}

async function deleteEmployeeInSupabase(employeeId: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);

  if (error) throw error;
}

async function deleteEmployeeInMock(employeeId: string): Promise<void> {
  const database = loadMockDatabase();

  saveMockDatabase({
    employees: database.employees.filter((entry) => entry.id !== employeeId),
    certifications: database.certifications.filter((entry) => entry.employee_id !== employeeId),
  });
}

async function uploadEmployeeAvatarInSupabase(employeeId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${employeeId}-${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('employees')
    .update({ avatar_url: publicUrl })
    .eq('id', employeeId);

  if (updateError) throw updateError;

  return publicUrl;
}

async function uploadEmployeeAvatarInMock(employeeId: string, file: File): Promise<string> {
  const avatarUrl = await fileToDataUrl(file);
  const database = loadMockDatabase();
  const updatedEmployees = database.employees.map((entry) =>
    entry.id === employeeId ? { ...entry, avatar_url: avatarUrl } : entry
  );

  saveMockDatabase({
    ...database,
    employees: updatedEmployees,
  });

  return avatarUrl;
}

async function updateLinkedInUrlInSupabase(employeeId: string, linkedInUrl: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .update({ linkedin_url: linkedInUrl })
    .eq('id', employeeId);

  if (error) throw error;
}

async function updateLinkedInUrlInMock(employeeId: string, linkedInUrl: string): Promise<void> {
  const database = loadMockDatabase();
  const updatedEmployees = database.employees.map((entry) =>
    entry.id === employeeId ? { ...entry, linkedin_url: linkedInUrl } : entry
  );
  saveMockDatabase({
    ...database,
    employees: updatedEmployees,
  });
}

async function updateSkillRatingsInSupabase(employeeId: string, skillRatings: Record<string, number>): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .update({ skill_ratings: skillRatings })
    .eq('id', employeeId);

  if (error) throw error;
}

async function updateSkillRatingsInMock(employeeId: string, skillRatings: Record<string, number>): Promise<void> {
  const database = loadMockDatabase();
  const updatedEmployees = database.employees.map((entry) =>
    entry.id === employeeId ? { ...entry, skill_ratings: skillRatings } : entry
  );
  saveMockDatabase({
    ...database,
    employees: updatedEmployees,
  });
}

async function listCertificationsFromSupabase(employeeId: string): Promise<Certification[]> {
  const { data, error } = await supabase
    .from('employee_certifications')
    .select('*')
    .eq('employee_id', employeeId)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function listCertificationsFromMock(employeeId: string): Promise<Certification[]> {
  const database = loadMockDatabase();
  return sortCertifications(
    database.certifications.filter((certification) => certification.employee_id === employeeId)
  );
}

async function addCertificationInSupabase(
  employeeId: string,
  certification: Pick<Certification, 'title' | 'udemy_url' | 'completed_at'>
): Promise<Certification> {
  const { data, error } = await supabase
    .from('employee_certifications')
    .insert({
      employee_id: employeeId,
      title: certification.title,
      udemy_url: certification.udemy_url,
      completed_at: new Date(certification.completed_at).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function addCertificationInMock(
  employeeId: string,
  certification: Pick<Certification, 'title' | 'udemy_url' | 'completed_at'>
): Promise<Certification> {
  const database = loadMockDatabase();
  const createdCertification: Certification = {
    id: createId('cert'),
    employee_id: employeeId,
    title: certification.title,
    udemy_url: certification.udemy_url,
    completed_at: new Date(certification.completed_at).toISOString(),
    created_at: new Date().toISOString(),
  };

  saveMockDatabase({
    ...database,
    certifications: [createdCertification, ...database.certifications],
  });

  return createdCertification;
}

async function updateCertificationInSupabase(certification: Certification): Promise<void> {
  const { error } = await supabase
    .from('employee_certifications')
    .update({
      title: certification.title,
      udemy_url: certification.udemy_url,
      completed_at: new Date(certification.completed_at).toISOString(),
    })
    .eq('id', certification.id);

  if (error) throw error;
}

async function updateCertificationInMock(certification: Certification): Promise<void> {
  const database = loadMockDatabase();
  const updatedCertifications = database.certifications.map((entry) =>
    entry.id === certification.id
      ? {
          ...entry,
          title: certification.title,
          udemy_url: certification.udemy_url,
          completed_at: new Date(certification.completed_at).toISOString(),
        }
      : entry
  );

  saveMockDatabase({
    ...database,
    certifications: updatedCertifications,
  });
}

async function deleteCertificationInSupabase(certificationId: string): Promise<void> {
  const { error } = await supabase
    .from('employee_certifications')
    .delete()
    .eq('id', certificationId);

  if (error) throw error;
}

async function deleteCertificationInMock(certificationId: string): Promise<void> {
  const database = loadMockDatabase();
  saveMockDatabase({
    ...database,
    certifications: database.certifications.filter((entry) => entry.id !== certificationId),
  });
}

export const dataService = {
  getDataSource(): DataSource {
    return getConfiguredSource();
  },

  async listEmployees() {
    return getConfiguredSource() === 'supabase'
      ? await listEmployeesFromSupabase()
      : await listEmployeesFromMock();
  },

  async getEmployee(employeeId: string) {
    return getConfiguredSource() === 'supabase'
      ? await getEmployeeFromSupabase(employeeId)
      : await getEmployeeFromMock(employeeId);
  },

  async toggleFavorite(employee: Employee) {
    return getConfiguredSource() === 'supabase'
      ? await toggleFavoriteInSupabase(employee)
      : await toggleFavoriteInMock(employee);
  },

  async createEmployee(employee: EmployeeInput) {
    return getConfiguredSource() === 'supabase'
      ? await createEmployeeInSupabase(employee)
      : await createEmployeeInMock(employee);
  },

  async updateEmployee(employee: Employee) {
    return getConfiguredSource() === 'supabase'
      ? await updateEmployeeInSupabase(employee)
      : await updateEmployeeInMock(employee);
  },

  async deleteEmployee(employeeId: string) {
    if (getConfiguredSource() === 'supabase') {
      await deleteEmployeeInSupabase(employeeId);
      return;
    }

    await deleteEmployeeInMock(employeeId);
  },

  async uploadEmployeeAvatar(employeeId: string, file: File) {
    return getConfiguredSource() === 'supabase'
      ? await uploadEmployeeAvatarInSupabase(employeeId, file)
      : await uploadEmployeeAvatarInMock(employeeId, file);
  },

  async updateLinkedInUrl(employeeId: string, linkedInUrl: string) {
    if (getConfiguredSource() === 'supabase') {
      await updateLinkedInUrlInSupabase(employeeId, linkedInUrl);
      return;
    }

    await updateLinkedInUrlInMock(employeeId, linkedInUrl);
  },

  async updateSkillRatings(employeeId: string, skillRatings: Record<string, number>) {
    if (getConfiguredSource() === 'supabase') {
      await updateSkillRatingsInSupabase(employeeId, skillRatings);
      return;
    }

    await updateSkillRatingsInMock(employeeId, skillRatings);
  },

  async listCertifications(employeeId: string) {
    return getConfiguredSource() === 'supabase'
      ? await listCertificationsFromSupabase(employeeId)
      : await listCertificationsFromMock(employeeId);
  },

  async addCertification(employeeId: string, certification: Pick<Certification, 'title' | 'udemy_url' | 'completed_at'>) {
    return getConfiguredSource() === 'supabase'
      ? await addCertificationInSupabase(employeeId, certification)
      : await addCertificationInMock(employeeId, certification);
  },

  async updateCertification(certification: Certification) {
    if (getConfiguredSource() === 'supabase') {
      await updateCertificationInSupabase(certification);
      return;
    }

    await updateCertificationInMock(certification);
  },

  async deleteCertification(certificationId: string) {
    if (getConfiguredSource() === 'supabase') {
      await deleteCertificationInSupabase(certificationId);
      return;
    }

    await deleteCertificationInMock(certificationId);
  },

  resetMockData() {
    saveMockDatabase(createInitialDatabase());
  },
};
