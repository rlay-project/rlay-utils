const Entity = require('../entity/entity');
const Rlay_Individual = require('./individual');

/* Annotation */
class Rlay_Annotation extends Entity { }
Rlay_Annotation.type = 'Annotation';
Rlay_Annotation.fields = ['annotations', 'property', 'value'];

/* AnnotationProperty */
class Rlay_AnnotationProperty extends Entity { }
Rlay_Annotation.type = 'AnnotationProperty';
Rlay_Annotation.fields = ['annotations'];

/* Class */
class Rlay_Class extends Entity { }
Rlay_Class.type = 'Class';
Rlay_Class.fields = ['annotations', 'superClassExpression'];

/* ClassAssertion */
class Rlay_ClassAssertion extends Entity { }
Rlay_ClassAssertion.type = 'ClassAssertion';
Rlay_ClassAssertion.fields = ['subject', 'class'];
Rlay_ClassAssertion.fieldsDefault = { subject: '0x00', class: '' };

/* DataProperty */
class Rlay_DataProperty extends Entity { }
Rlay_DataProperty.type = 'DataProperty';
Rlay_DataProperty.fields = ['annotations', 'superDataPropertyExpression'];

/* DataPropertyAssertion */
class Rlay_DataPropertyAssertion extends Entity { }
Rlay_DataPropertyAssertion.type = 'DataPropertyAssertion';
Rlay_DataPropertyAssertion.fields = ['subject', 'property', 'target'];

/* ObjectProperty */
class Rlay_ObjectProperty extends Entity { }
Rlay_ObjectProperty.type = 'ObjectProperty';
Rlay_ObjectProperty.fields = ['annotations', 'superObjectPropertyExpression'];

/* ObjectPropertyAssertion */
class Rlay_ObjectPropertyAssertion extends Entity { }
Rlay_ObjectPropertyAssertion.type = 'ObjectPropertyAssertion';
Rlay_ObjectPropertyAssertion.fields = ['subject', 'property', 'target'];

module.exports = {
  Entity,

  Rlay_Annotation,
  Rlay_AnnotationProperty,

  Rlay_Class,
  Rlay_ClassAssertion,

  Rlay_DataProperty,
  Rlay_DataPropertyAssertion,

  Rlay_ObjectProperty,
  Rlay_ObjectPropertyAssertion,

  Rlay_Individual,
}
