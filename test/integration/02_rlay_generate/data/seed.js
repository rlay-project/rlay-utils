module.exports = {
  version: '2',
  entities: {
    'httpConnectionClassLabelAnnotation': {
      type: 'Annotation',
      property: '0x01',
      value: 'HTTP:Connection',
    },
    'httpConnectionClass': {
      type: 'Class',
      annotations: ['*httpConnectionClassLabelAnnotation']
    },
  }
};
