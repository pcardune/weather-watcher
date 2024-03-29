import PropTypes from 'prop-types';

export const ScoreConfigShape = PropTypes.shape({
  tempRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  windRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  precipRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  quantityRange: PropTypes.arrayOf(PropTypes.number).isRequired,
});

export const ComparisonProps = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  comparisonPointIds: PropTypes.object,
  scoreConfig: ScoreConfigShape,
};

export const ComparisonShape = PropTypes.shape(ComparisonProps);

export const ComparisonPointProps = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
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
  comparisonPoints: PropTypes.arrayOf(AugmentedComparisonPointShape),
});
