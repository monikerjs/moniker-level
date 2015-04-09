
import { create } from 'errno';

/**
 * NotFoundError
 * @type <Error>
 * Adds a `notFound` prop to an Error
 */
export var NotFoundError = create( 'NotFoundError' );
NotFoundError.prototype.notFound = true;
