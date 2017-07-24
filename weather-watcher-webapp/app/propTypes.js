import {PropTypes} from 'react';

export const ScoreConfigShape = PropTypes.shape({
  idealTemp: PropTypes.number.isRequired,
});

export const ComparisonProps = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  comparisonPointIds: PropTypes.object.isRequired,
  scoreConfig: ScoreConfigShape,
};

export const ComparisonShape = PropTypes.shape(ComparisonProps);

export const ComparisonPointProps = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  noaaPointId: PropTypes.string,
  noaaGridForecastId: PropTypes.string,
};
export const ComparisonPointShape = PropTypes.shape(ComparisonPointProps);

export const NOAAPointProps = {};

export const NOAAPointShape = PropTypes.shape(NOAAPointProps);

export const NOAAGridForecastProps = {};

export const NOAAGridForecastShape = PropTypes.shape(NOAAGridForecastProps);

export const AugmentedComparisonPointShape = PropTypes.shape({
  ...ComparisonPointProps,
  noaaPoint: NOAAPointShape,
  noaaGridForecast: NOAAGridForecastShape,
});

export const AugmentedComparisonShape = PropTypes.shape({
  ...ComparisonProps,
  comparisonPoints: PropTypes.arrayOf(AugmentedComparisonPointShape).isRequired,
});
