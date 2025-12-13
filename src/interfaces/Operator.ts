interface Operator {
  id: string;
  code: string;
  name: string;
  priceHour: number;
  operatorType: OperatorType;
  active: boolean;
  annualVacationDays?: number;
}

export enum OperatorType {
  Maintenance,
  Production,
  Quality,
  Repairs,
  Assembly,
}

export default Operator;
