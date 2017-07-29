import ComparisonPointPage from '.';

let loaded = false;

export default function load() {
  if (!loaded) {
    loaded = true;
  }
  return ComparisonPointPage;
}
