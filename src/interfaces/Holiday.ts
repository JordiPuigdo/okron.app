import { BaseModel } from "./BaseModel";

export interface Holiday extends BaseModel {
  date: Date;
  name: string;
  description?: string;
  year: number;
}

export interface HolidayCreateRequest {
  date: Date;
  name: string;
  description?: string;
  year: number;
}

export interface HolidayUpdateRequest extends HolidayCreateRequest {
  id: string;
}
