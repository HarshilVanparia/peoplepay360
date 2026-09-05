'use server';

import { query } from '../lib/db';

export async function getSalaryStructures() {
  return await query(`
    SELECT s.*, 
    (SELECT COUNT(*) FROM salary_rules WHERE structure_id = s.id) as rule_count,
    (SELECT COUNT(*) FROM contracts WHERE salary_structure_id = s.id AND status = 'Active') as active_employees
    FROM salary_structures s
    ORDER BY s.created_at DESC
  `);
}

export async function getStructureWithRules(structureId: string) {
  const [structure] = await query(
    `SELECT * FROM salary_structures WHERE id = ?`, 
    [structureId]
  ) as any[];

  const rules = await query(
    `SELECT * FROM salary_rules WHERE structure_id = ? ORDER BY sequence ASC`,
    [structureId]
  );

  return { structure, rules };
}