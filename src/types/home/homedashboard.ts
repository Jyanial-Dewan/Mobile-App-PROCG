export interface DashboardItem {
  id: string;
  name: string;
  creation_date: string | null;
}

export interface DashboardSection {
  total?: number;
  active?: number;
  cancelled?: number;
  scheduled?: number;
  srs?: number;
  sf?: number;
  items?: DashboardItem[];
}
export interface DashboardData {
  async_tasks: DashboardSection;
  scheduled_tasks: DashboardSection;
  executors: DashboardSection;
  users: DashboardSection;
  tenants: DashboardSection;
  enterprises: DashboardSection;
  workflows: DashboardSection;
}
