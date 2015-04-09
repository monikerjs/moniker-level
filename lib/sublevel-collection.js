
import { NotFoundError } from './errors';

/**
 * Collection of sublevel categories.
 * Db categories are specified by user e.g. English, French, Australian.
 */
export default class SublevelCollection {
    /**
     * @constructs
     */
    constructor() {

        /**
         * Collection object
         * @type <object>
         * name <string> : sublevel<level-sublevel>
         */
        this.collection = {};
    }

    /**
     * Adds a sublevel to the collection object
     * @param name <String> id
     * @param sub <Level-Sublevel> sublevel instance
     * @returns sublevel instance
     * @throws if name already exists
     * @throws if trying to find a name throws anything other than a notFound
     */
    add( name, sub ) {
        // Ensure name does not exist already in collection
        try {
            // Will throw if not found
            this.find( name );

            throw new Error( name + ' already exists' );
        } catch( err ) {
            // Catching a notFound is fine, anything else, probably not
            if ( !err.notFound ) {
                throw new Error( 'Unspecified erroring finding collection' );
            }
        }

        this.collection[ name ] = sub;

        return this.collection[ name ];
    }

    /**
     * Finds a sublevel instance by id
     * @param name <String>
     * @returns <Level-Sublevel>
     * @throws NotFoundError on name not found in collection
     */
    find( name ) {
        if ( Object.keys( this.collection ).includes( name ) ) {
            return this.collection[ name ];
        }

        throw new NotFoundError( name + ' not found in sublevel collection' );
    }
}
