"use strict";
const pluralize = require('pluralize');
const _actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

class ParamsProcessor {
    constructor(req, many) {
        this.req = req;
        // Don't forget to set 'many' in blueprints/find.js (eg, new Response.ResponseGET(req, res, true);
        this.many = many
        this.result = {};
    }

    parse(model) {
        this.query = '';
        this.fields = this.req.param('fields') ? this.req.param('fields').replace(/ /g, '').split(',') : [];
        this.includes = this.parseInclude(this.req);
        this.modelName = pluralize(model.adapter.identity);


        // For every custom param, once parsed and handled it must be deleted from req
        if (this.req.query.include) {
            delete this.req.query.include;
        }
        if (this.req.query.fields) {
            delete this.req.query.fields;
        }

        if (this.many) {
            this.where = this.parseCriteria(this.req, model);
            this.limit = _actionUtil.parseLimit(this.req) || sails.config.blueprints.defaultLimit;
            this.skip = this.req.param('page') * this.limit || _actionUtil.parseSkip(this.req) || 0;
            // const this.sort = _actionUtil.parseSort(this.req);
            this.sort = this.parseSort(this.req);
            this.page = this.skip !== 0 ? Math.floor(this.skip / this.limit) + 1 : 1;
            console.log('pepe')
                // Delete the skip query parameter
            this.requestQuery = this.req.query;
            delete this.requestQuery.skip;

            this.result = {
                fields: this.fields,
                where: this.where,
                limit: this.limit,
                skip: this.skip,
                sort: this.sort
            }

            // this.query = this.model.find(this.fields.length > 0 ? {
            //     select: this.fields
            // } : null).where(this.where).limit(this.limit).skip(this.skip).sort(this.sort);

            // this.countQuery = _.cloneDeep(this.req.query);
            // delete this.countQuery.limit;

            // this.model.count(this.countQuery).then(function(cant) {
            //     this.count = cant;
            //     this.pages = Math.ceil(parseFloat(this.count) / parseFloat(this.limit));
            // }.bind(this));
        } else {
            this.result = {
                    select: this.fields,
                }
                // this.pk = _actionUtil.requirePk(this.req);
                // this.query = this.model.find(this.pk, this.fields.length > 0 ? {
                // select: this.fields
                // } : null);
        }
        console.log('breakpoint')
        return this.result;
    }

    parseCriteria(req, model) {
        var criteria = _actionUtil.parseCriteria(req);

        _.forEach(criteria, function(value, key) {
            if (!model.schema[key]) delete criteria[key];
        });

        return criteria;
    }

    /*
     * Parses the 'sort' query param and builds an object with it
     */
    parseSort(req) {
        var sort = req.param('sort') || req.options.sort;
        var orderBy = req.param('orderBy') || req.options.orderBy;

        if (_.isUndefined(sort) || _.isUndefined(orderBy)) {
            return undefined;
        }
        return {
            [orderBy]: sort
        };
    }

    /*
     * Parses the 'include' query param and builds an object with it, to be consumed by populate()
     */
    parseInclude(req) {
        var includes = this.req.param('include') ? this.req.param('include').replace(/ /g, '').split(',') : [];
        var splits = [];
        var results = {
            full: [], // Here go the models that will be included with all their attributes
            partials: {} // Here, the models that will be included with only the specified attributes. Each model is a key holding an array of attributes.
        };

        if (includes.length > 0) {
            _.forEach(includes, function(element, i) {
                var testee = String(element);

                if (testee.indexOf('.') !== -1) {
                    var split = testee.split('.', 2);

                    if (_.isArray(split) && split.length > 1) {
                        if (_.isArray(results.partials[split[0]])) results.partials[split[0]].push(split[1]);
                        else results.partials[split[0]] = [split[1]];
                    };
                } else results.full.push(testee);
            });
        }

        this.partials = results.partials;

        return results;
    }

    parseFields(req) {
        var fields = this.req.param('fields') ? this.req.param('fields').replace(/ /g, '').split(',') : [];

        return fields;

        /*
        var splits = [];
        var results = {
            full: [], // Here go the models that will be included with all their attributes
            partials: {} // Here, the models that will be included with only the specified attributes. Each model is a key holding an array of attributes.
        };

        if (fields.length > 0) {
            _.forEach(fields, function(element, i) {
                var testee = String(element);

                if (testee.indexOf('.') !== -1) {
                    var split = testee.split('.', 2);

                    if (_.isArray(split) && split.length > 1) {
                        if (_.isArray(results.partials[split[0]])) results.partials[split[0]].push(split[1]);
                        else results.partials[split[0]] = [split[1]];
                    };
                } else results.full.push(testee);
            });
        }

        this.partials = results.partials;
        return results;
        */
    }

    select(query, fields) {
        return query.then(function(records) {
            // Filter out the partials
            // Each result item
            records.forEach(function(element, j) {
                records[j] = _.transform(element, function(result, value, key) {
                    _.forEach(fields.full, function(field) {
                        if (fields.full.indexOf(field) === -1) {
                            delete element[field];
                        } else result[key] = element[key];
                    });
                }, element);
            });

            return records;
        });
    }

    /*
     * Handles the population of related items and collections
     */
    populate(query, model, includes) {
        // Fully populate non collection items
        _.forEach(model.definition, function(value, key) {
            if (value.foreignKey) {
                query.populate(key).exec(function afterwards(err, populatedRecords) {
                    if (!err) query = populatedRecords;
                    else console.log(err);
                });
            }
        });

        // Fully populate collections
        _.forEach(includes.full, function(element) {
            query.populate(element).exec(function afterwards(err, populatedRecords) {
                if (!err) query = populatedRecords;
                else console.log(err);
            });
        }, this);

        // Partial includes are supported in Waterline, but are adapter dependant
        // Since not many adapters implement them we're doing it by hand
        // TODO: Check if the adapter supports them, to avoid the heavy load of the custom solution

        // Fully populate included partials (will be filtered out later)
        _.forEach(includes.partials, function(value, key) {
            query.populate(key).exec(function afterwards(err, populatedRecords) {
                if (!err) query = populatedRecords;
                else console.log(err);
            });
        }, this);

        return query.then(function(records) {
            // Filter out the partials
            // Each result item
            records.forEach(function(element, j) {
                records[j] = _.transform(element, function(result, value, key) {
                    // Each granular include, gruped by model
                    _.forEach(includes.partials, function(partialValue, partialKey) {
                        if (key === partialKey && _.isArray(element[partialKey])) {
                            // Each collection of included objects
                            element[partialKey].forEach(function(item, k) {
                                // Each included object in the collection
                                _.forEach(item, function(resultValue, resultKey) {
                                    // If it's not listed on the granular includes, delete it
                                    if (partialValue.indexOf(resultKey) === -1) {
                                        delete element[partialKey][k][resultKey];
                                    } else result[partialKey][k] = element[partialKey][k];
                                });
                            });
                        } else result[key] = element[key];
                    });
                }, element);
            });

            return records;
        });
    }
    toString() {
        return this.req.query;
    }
}

module.exports = {
    ParamsProcessor
};