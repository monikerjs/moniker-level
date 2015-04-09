
import path from 'path';
import fs from 'fs';

import mkdirp from 'mkdirp';
import osenv from 'osenv';
import pkg from '../package.json';


/**
 * Manages db paths
 */
export default class Paths {
    /**
     * @constructs
     * @param dbpath <String> _optional_ path to db folder
     * @param dbname <String> _optional_ db folder name
     */
    constructor( dbpath, dbname ) {
        this.dbpath = dbpath || path.join( osenv.home(), process.env.DBPATH ||
            process.env.npm_package_config_dbpath ||
            pkg.name );

        this.dbname = dbname ||
            process.env.DBNAME ||
            process.env.npm_package_config_dbname ||
            '/names.lev';
    }

    /**
     * Returns the full dbpath
     * @getter
     * @returns <String>
     */
    get fullPath() {
        return path.join( this.dbpath, this.dbname );
    }

    /**
     * Makes the db path if necessary
     * @synchronous
     * @throws if fs.statSync throws anything other than a not found
     */
    make() {
        try {
            fs.statSync( this.dbpath );
        } catch( err ) {
            if ( err.code === 'ENOENT' ) {
                mkdirp.sync( this.dbpath );
            } else {
                throw new Error( err );
            }
        }
    }

}
