
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
     */
    add( name, sub ) {
        // Ensure name does not exist already in collection
        if ( this.find( name ) ) {
            throw new Error( name + 'already exists' );
        }

        this.collection[ name ] = sub;

        return this.collection[ name ];
    }

    /**
     * Finds a sublevel instance by id
     * @param name <String>
     * @returns <Level-Sublevel>
     */
    find( name ) {
        if ( Object.keys( this.collection ).includes( name ) ) {
            return this.collection[ name ];
        }

        throw new Error({
            code: 'notFound',
            notFound: true,
            message: name + ' not found in sublevel collection'
        });
    }
}
