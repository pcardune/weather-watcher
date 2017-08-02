import {CREATE_COMPARISON} from './constants';

export function createComparison({name}) {
  return {
    type: CREATE_COMPARISON,
    comparison: {
      name,
    },
  };
}
