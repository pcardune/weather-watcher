export const UPDATE_SCORE_CONFIG = 'app/Database/UPDATE_SCORE_CONFIG';
export const CREATE_COMPARISON = 'app/Database/CREATE_COMPARISON';
export const DEFAULT_SCORE_CONFIG = {
  idealTemp: 65,
  coldDeduction: 1,
  hotDeduction: 1,
  windDeduction: 1,
  rainDeduction: 0.01,
  rainRiskDeduction: 2,
  tempRange: [32, 45, 65, 75, 85],
  windRange: [0, 0, 0, 5, 20],
  precipRange: [0, 0, 0, 20, 50],
  quantityRange: [0, 0, 0, 0.03, 0.1],
};
