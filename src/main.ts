import config from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import scaleRange from '@arcgis/core/smartMapping/heuristics/scaleRange';
import { getTemplates } from '@arcgis/core/smartMapping/popup/templates';
import { createRenderer } from '@arcgis/core/smartMapping/renderers/relationship';

import { initWidgets } from './widgets';

import './style.css';

config.apiKey = import.meta.env.VITE_API_KEY as string;

const featureLayer = new FeatureLayer({
  url: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/us_counties_landscape/FeatureServer/0',
  // outFields: ['NAME', 'STATE_NAME', 'VACANT', 'HSE_UNITS'],
  // outFields: ['*'],
  title: 'U.S. Counties',
  opacity: 0.8,
});

featureLayer.when(() => {
  view.goTo(featureLayer.fullExtent);
});

const view = new MapView({
  container: 'viewDiv',
  map: new Map({
    basemap: 'arcgis-topographic',
  }),
});

view.when(async () => {
  initWidgets({ view, layer: featureLayer });

  // smartmapping fun
  const { minScale, maxScale } = await scaleRange({
    layer: featureLayer,
    view,
  });

  featureLayer.minScale = minScale;
  featureLayer.maxScale = maxScale;

  const rendererResult = await createRenderer({
    layer: featureLayer,
    view,
    field1: {
      field: 'HSE_UNITS',
    },
    field2: {
      field: 'VACANT',
    },
  });

  console.log(rendererResult);

  featureLayer.renderer = rendererResult.renderer;

  const { primaryTemplate, secondaryTemplates } = await getTemplates({
    layer: featureLayer,
    renderer: featureLayer.renderer,
  });
  console.log('primaryTemplate', primaryTemplate);
  console.log('secondaryTemplates?', secondaryTemplates);
  if (primaryTemplate) {
    featureLayer.popupTemplate = primaryTemplate.value;
    featureLayer.popupTemplate.title = primaryTemplate.title;
  }

  view.map.add(featureLayer);
});
