import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1794700000000 implements MigrationInterface {
  name = 'InitialSchema1794700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE departments (
        id         CHAR(36)     NOT NULL DEFAULT (UUID()),
        name       VARCHAR(100) NOT NULL,
        created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_departments_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE employees (
        id            CHAR(36)     NOT NULL DEFAULT (UUID()),
        employee_code VARCHAR(20)  NOT NULL,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          ENUM('EMPLOYEE','HR') NOT NULL DEFAULT 'EMPLOYEE',
        position      VARCHAR(100) NULL,
        department_id CHAR(36)     NULL,
        phone         VARCHAR(20)  NULL,
        is_active     TINYINT(1)   NOT NULL DEFAULT 1,
        created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_employees_code (employee_code),
        UNIQUE KEY uq_employees_email (email),
        KEY idx_employees_department (department_id),
        CONSTRAINT fk_employee_department
          FOREIGN KEY (department_id) REFERENCES departments (id)
          ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE attendances (
        id              CHAR(36)     NOT NULL DEFAULT (UUID()),
        employee_id     CHAR(36)     NOT NULL,
        attendance_date DATE         NOT NULL,
        attendance_time DATETIME     NOT NULL,
        clock_out_time  DATETIME     NULL,
        photo_path      VARCHAR(255) NOT NULL,
        notes           VARCHAR(255) NULL,
        created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_attendance_employee_date (employee_id, attendance_date),
        KEY idx_attendance_date (attendance_date),
        CONSTRAINT fk_attendance_employee
          FOREIGN KEY (employee_id) REFERENCES employees (id)
          ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE attendances');
    await queryRunner.query('DROP TABLE employees');
    await queryRunner.query('DROP TABLE departments');
  }
}
