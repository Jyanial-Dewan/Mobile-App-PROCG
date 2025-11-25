export interface ITenantsTypes {
  tenant_id: number;
  tenant_name: string;
}
export interface IJobTitle {
  job_title_id: number;
  job_title_name: string;
  tenant_id: number;
  created_by?: number;
  created_on?: Date;
  last_updated_by?: number;
  last_updated_on?: Date;
}
