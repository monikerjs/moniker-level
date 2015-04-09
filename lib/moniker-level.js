
import EventEmitter from 'events';
import uuid from 'node-uuid';

import party from 'level-party';
import sublevel from 'level-sublevel';
import promisify from 'level-promisify';

import SublevelCollection from './sublevel-collection';



// Grab path manager and ensure the db path exists
import Paths from './paths';
var paths = new Paths();



/**
 * The db instance
 */
export default class MonikerLevel extends EventEmitter {
    constructor() {
        super();

        this.level = party( paths.fullPath );
        this.master = sublevel( this.level );

        // Create sublevels
        this.subs = new SublevelCollection();

        // Add meta collection
        this.meta = this.subs.add( 'meta', promisify( this.master.sublevel( 'meta', {
            encoding: 'json'
        })));

        // Add other categories
        this.meta.get( 'categories' )
            .then( res => {
                if ( !res.length ) {
                    return this.emit( 'ready', [] );
                }

                Promise.all( res.map( this.createCategory.bind( this ) ) )
                    .then( categories => {
                        this.emit( 'ready', res );
                    })
                    .catch( err => {
                        console.log( '[DB] Init Error' );
                        console.dir( err );
                        throw new Error( err );
                    });
            })
            .catch( err => {
                if ( err && err.notFound ) {
                    this.meta.put( 'categories', [] )
                        .then( () => {
                            this.emit( 'ready', [] );
                        })
                        .catch( err => {
                            throw new Error( err );
                        });

                    return;
                }

                throw new Error( err );
            });
    }

    /**
     * Creates category structure.
     * Each category holds 'common', 'uncommon', 'rare' commonality ranges.
     * Each commonality holds 'first' and 'last' for first name and last name.
     * @param name <String> name of category  to create
     * @returns <Promise> resolves with the created category sublevel
     */
    createCategory( category ) {
        return new Promise( ( resolve, reject ) => {
            console.log( 'Creating category:', category );
            if ( !category ) {
                return reject();
            }

            var cat = promisify( this.master.sublevel( category, {
                encoding: 'json'
            }));

            [ 'common', 'uncommon', 'rare' ].forEach( commonality => {
                cat.root.sublevel( commonality, {
                    encoding: 'json'
                });
            });

            this.subs.add( category, cat );

            // Add new sublevel category to categories meta
            this.meta.get( 'categories' )
                .then( res => {
                    if ( res.includes( category ) ) {
                        console.warn( '[DB] Sublevel already exists in categories ' + category );
                    } else {
                        res.push( category );
                    }

                    this.meta.put( 'categories', res )
                        .then( () => {
                            resolve( cat );
                        })
                        .catch( reject );
                })
                .catch( reject );
        });
    }


    /**
     * Creates a name structure.
     * @param category <String>
     * @param commonality <enum:commonality>
     * @param name <String>
     * @returns <Promise> resolves with the newly created name structure
     */
    createName( category, commonality, name ) {
        return new Promise( ( resolve, reject ) => {
            var cat = this.subs.find( category );

            if ( !cat ) {
                return reject({
                    status: 500,
                    message: '[DB] error creating new name :: category does not exist'
                });
            }

            var sublevel = promisify( cat.root.sublevel( commonality, {
                encoding: 'json'
            }));

            sublevel
                .get( name )
                .then( res => {
                    reject({
                        status: 500,
                        message: 'Name already exists'
                    });
                })
                .catch( err => {
                    if ( err && err.notFound ) {
                        return sublevel.put( name, uuid.v4() );
                    }

                    reject( err );
                })
                .then( res => {
                    console.log( 'Successfully put', name, 'into', category );
                    resolve();
                })
                .catch( reject );
        });
    }


    /**
     * Deletes the name for the given category and commonality
     */
    deleteName( category, commonality, name ) {
        return new Promise( ( resolve, reject ) => {
            var cat = this.subs.find( category );

            if ( !cat ) {
                return reject({
                    status: 500,
                    message: '[DB] error deleting new name :: category does not exist'
                });
            }

            var sublevel = promisify( cat.root.sublevel( commonality, {
                encoding: 'json'
            }));

            sublevel
                .get( name )
                .then( res => {
                    // If the result exists then return the sublevel to delete it,
                    // otherwise it'll throw and be caught later
                    return sublevel.del( name );
                })
                .then( res => {
                    console.log( 'Successfully deleted', name, 'in', category );
                    resolve();
                })
                .catch( reject );
        });
    }


    /**
     * Returns the names for a given category and commonality
     */
    getNames( category, commonality ) {
        return new Promise( ( resolve, reject ) => {
            var cat = this.subs.find( category );

            if ( !cat ) {
                return reject({
                    status: 500,
                    message: '[DB] error getting names :: category does not exist'
                });
            }

            var results = [];

            cat.root.sublevel( commonality, {
                encoding: 'json'
            })
                .createReadStream({
                    keys: true,
                    values: false
                })
                .on( 'data', res => {
                    results.push( res );
                })
                .on( 'error', err => {
                    reject( err );
                })
                .on( 'end', () => {
                    resolve( results );
                });
        });
    }
}
