module.exports = Object.create( Object.assign( {}, require('../lib/MyObject').prototype, {

    Enum: require('../lib/Enum'),

    initialize() {
        return this.getTableData()
    },

    query( query, args, opts = { } ) {
        return this._factory( opts ).query( query, args )
    },

    select( name, where, opts = { } ) {
        const keys = Object.keys( where )
              whereClause = keys.map( ( key, i ) => `"${key}" = $${i+1}` ).join(', ')

        return this._factory( opts ).query(
            `SELECT * FROM ${name} WHERE ${whereClause}`,
            keys.map( key => where[key] )
        )
    },

    getColumnDescription( table, column ) {
        const isEnum = Boolean( this.enumReference && this.enumReference[ table.table_name ] && this.enumReference[ table.table_name ][ column.column_name ] ),
              range = isEnum
                ? this.enumReference[ table.table_name ][ column.column_name ]
                : this.dataTypeToRange[column.data_type]

        return {
            isEnum,
            isNullable: column.is_nullable,
            maximumCharacterLength: column.data_type === "text" ? 1000 : column.character_maximum_length,
            name: column.column_name,
            range
        }
    }, 

    getSelectList( table, opts={} ) {
        const tableAlias = opts.alias ? opts.alias : table
        return this.tables[ table ].columns.map( column => `"${tableAlias}"."${column.name}" as "${tableAlias}.${column.name}"` ).join(', ')
    },

    getTableData() {
        return this.query( this._queries.selectAllTables() )
        .then( result =>
            Promise.all( result.rows.map( row =>
                this.query( this._queries.selectTableColumns( row.table_name ) )
                .then( columnResult =>
                    Promise.resolve(
                        this.tables[ row.table_name ] = { columns: columnResult.rows.map( columnRow => this.getColumnDescription( row, columnRow ) ) }
                    )
                )
            ) )
        )
        .then( () =>
            this.query( this._queries.selectForeignKeys() )
            .then( result =>
                Promise.resolve(
                    result.rows.forEach( row => {
                        const match = /FOREIGN KEY \("?(\w+)"?\) REFERENCES (\w+)\((\w+)\)/.exec( row.pg_get_constraintdef )
                        let column = this.tables[ row.tablefrom.replace(/"/g,'') ].columns.find( column => column.name === match[1] )
                        
                        column.fk = {
                            table: match[2],
                            column: match[3],
                            recordType: ( this.tables[ match[2] ].meta ) ? this.tables[ match[2] ].meta.recordType : null
                        }
                    } )
                )
            )
        )
    },

    _factory( data ) {
        return Object.create( {
            connect() {
                return new Promise( ( resolve, reject ) => {
                    this.pool.connect( ( err, client, done ) => {
                        if( err ) return reject( err )

                        this.client = client
                        this.done = done
                     
                        resolve()
                    } )
                } )
            },

            query( query, args ) {
                return this.connect().then( () =>
                    new Promise( ( resolve, reject ) => {
                        this.client.query( query, args, ( err, result ) => {
                            this.done()

                            if( err ) return reject( err )

                            resolve( result )
                        } )
                    } )
                )
            },
        }, { pool: { value: this.pool } } )
    },

    _queries: {

        selectAllTables() { return [
           "SELECT table_name",
           "FROM information_schema.tables",
           "WHERE table_schema='public'",
           "AND table_type='BASE TABLE';"
        ].join(' ') },

        selectForeignKeys() { return [
            "SELECT conrelid::regclass AS tableFrom, conname, pg_get_constraintdef(c.oid)",
            "FROM pg_constraint c",
            "JOIN pg_namespace n ON n.oid = c.connamespace",
            "WHERE contype = 'f' AND n.nspname = 'public';"
        ].join(' ') },

        selectTableColumns( tableName ) {
            return [
                'SELECT column_name, data_type, is_nullable, character_maximum_length',
                'FROM information_schema.columns',
                `WHERE table_name = '${tableName}'`
            ].join(' ')
        },

    },

    dataTypeToRange: {
        "bigint": "Integer",
        "boolean": "Boolean",
        "character varying": "Text",
        "date": "Date",
        "integer": "Integer",
        "money": "Float",
        "real": "Float",
        "timestamp with time zone": "DateTime",
        "text": "Text"
    },

    enumReference: {
        sensor: {
            location: 'Geography'
        }
    }
} ), {
    pool: { value: new (require('pg')).Pool() },
    tables: { value: { } }
} )
