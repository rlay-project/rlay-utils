const label = value => ({
  type: 'Annotation',
  property: '*labelAnnotationProperty',
  value: value,
});

// Creates a `Class`
const c = params => ({
  [`${params.name}ClassLabel`]: label(params.label),
  [`${params.name}ClassDescription`]: {
    type: 'Annotation',
    property: '*commentAnnotationProperty',
    value: params.description,
  },
  [`${params.name}Class`]: {
    type: 'Class',
    annotations: [
      `*${params.name}ClassLabel`,
      `*${params.name}ClassDescription`,
    ],
    ...(params.classFields || {}),
  },
});

// Creates a `DataProperty`
const dp = params => ({
  [`${params.name}DataPropertyLabel`]: label(params.label),
  [`${params.name}DataPropertyDescription`]: {
    type: 'Annotation',
    property: '*commentAnnotationProperty',
    value: params.description,
  },
  [`${params.name}DataProperty`]: {
    type: 'DataProperty',
    annotations: [
      `*${params.name}DataPropertyLabel`,
      `*${params.name}DataPropertyDescription`,
    ],
    ...(params.classFields || {}),
  },
})

// Creates a `ObjectProperty`
const op = params => ({
  [`${params.name}ObjectPropertyLabel`]: label(params.label),
  [`${params.name}ObjectPropertyDescription`]: {
    type: 'Annotation',
    property: '*commentAnnotationProperty',
    value: params.description,
  },
  [`${params.name}ObjectProperty`]: {
    type: 'ObjectProperty',
    annotations: [
      `*${params.name}ObjectPropertyLabel`,
      `*${params.name}ObjectPropertyDescription`,
    ],
    ...(params.classFields || {}),
  },
})

module.exports = {
  class: c,
  dataProp: dp,
  objectProp: op,
};
