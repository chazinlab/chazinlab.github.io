// The order roles appear on the People page, top to bottom.
// People with the same role are sorted by last name.
// Every member's `role` must match one of these exactly. To use a new role, add a line here.
export const roles = [
  'Principal Investigator',
  'Research Assistant Professor',
  'Staff Scientist',
  'Lab Manager',
  'Postdoctoral Fellow',
  'Graduate Student',
  'Research Assistant',
] as const;
