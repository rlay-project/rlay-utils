const EntityFactoryInterface = require('./factory-interface');
const EntityInterface = require('./interface');
const { mix } = require('mixwith');

/**
 * @summary The Entity Class
 *
 * @classdesc Everything is an `Entity` Class.<br>
 * <br>
 * For example: The higher-level `Annotation`,
 * `AnnotationProperty`, `Class`, `ClassAssertion`,
 * `DataPropertyAssertion`, `Individual`, etc. all inherent
 * from `Entity` and have therefore the same interface.<br>
 * <br>
 * As an end-user you never interact with the `Entity` Class
 * directly, but rather interact with the higher-level Classes,
 * which extend the `Entity` Class - see `Client` for more.
 *
 * @see Client
 *
 * @class
 * @extends EntityInterface
 * @extends EntityFactoryInterface
 * @author Michael Hirn <michael.j.hirn+rlay[]gmail.com>
 *
 * @example <caption>Create new Entity</caption>
 */
class Entity extends mix(EntityInterface).with(EntityFactoryInterface) { }

module.exports = Entity;
