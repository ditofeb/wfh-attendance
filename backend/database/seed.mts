import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';

const DEMO_PASSWORD = 'Password123!';

const DEPARTMENTS = [
  'Information Technology',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
];

const EMPLOYEES = [
  { code: 'EMP-2026-0001', name: 'Siti Rahmawati', email: 'hr.admin@example.com', role: 'HR', position: 'HR Manager', department: 'Human Resources', phone: '081234567801', active: true },
  { code: 'EMP-2026-0002', name: 'Budi Santoso', email: 'budi@example.com', role: 'EMPLOYEE', position: 'Software Engineer', department: 'Information Technology', phone: '081234567802', active: true },
  { code: 'EMP-2026-0003', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'EMPLOYEE', position: 'Data Analyst', department: 'Information Technology', phone: '081234567803', active: true },
  { code: 'EMP-2026-0004', name: 'Rizky Pratama', email: 'rizky@example.com', role: 'EMPLOYEE', position: 'Finance Staff', department: 'Finance', phone: '081234567804', active: true },
  { code: 'EMP-2026-0005', name: 'Dewi Anggraini', email: 'dewi@example.com', role: 'EMPLOYEE', position: 'Marketing Specialist', department: 'Marketing', phone: '081234567805', active: true },
  { code: 'EMP-2026-0006', name: 'Andi Wijaya', email: 'andi@example.com', role: 'EMPLOYEE', position: 'Operations Staff', department: 'Operations', phone: '081234567806', active: false },
];

export async function seed(dataSource: DataSource): Promise<void> {
  const [{ total }] = await dataSource.query('SELECT COUNT(*) AS total FROM employees');
  if (Number(total) > 0) {
    console.log('Seed skipped: employees table already has data. Use "npm run db:reset" to start over.');
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const departmentIds = new Map(DEPARTMENTS.map((name) => [name, randomUUID()]));

  await dataSource.transaction(async (manager) => {
    for (const [name, id] of departmentIds) {
      await manager.query('INSERT INTO departments (id, name) VALUES (?, ?)', [id, name]);
    }

    for (const e of EMPLOYEES) {
      await manager.query(
        `INSERT INTO employees
          (id, employee_code, name, email, password_hash, role, position, department_id, phone, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), e.code, e.name, e.email, passwordHash, e.role, e.position, departmentIds.get(e.department), e.phone, e.active ? 1 : 0],
      );
    }
  });

  console.log(`Seeded ${DEPARTMENTS.length} departments and ${EMPLOYEES.length} employees (password: ${DEMO_PASSWORD}).`);
}
