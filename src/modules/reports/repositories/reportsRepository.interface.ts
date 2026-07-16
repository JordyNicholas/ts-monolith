import { Report } from "@/shared/infra/database/client/client.js";

export interface IReportsRepository {
  findById(id: string): Promise<Report | null>;
}