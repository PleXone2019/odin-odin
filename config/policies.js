"use strict";

/**
 * Policy Mappings
 *
 * Policies are simple functions which run before your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 */

module.exports = {
    policies: {
        '*': ['addLoggedUser', 'statistics', 'ensureQueryTypeCast'],
        BasemapController: {
            create: ['isAuthenticated', 'statistics'],
            update: ['isAuthenticated', 'statistics'],
            destroy: ['isAuthenticated', 'statistics']
        },
        CategoryController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            destroy: ['isAuthenticated', 'statistics', 'addCreatedBy'],
            image: ['addLoggedUser', 'statistics']
        },
        ChartController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            destroy: ['isAuthenticated', 'statistics'],
            publish: ['isAuthenticated', 'statistics'],
            unpublish: ['isAuthenticated', 'statistics']
        },
        ConfigController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            destroy: ['isAuthenticated', 'statistics', 'addCreatedBy']
        },
        DatasetController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            destroy: ['isAuthenticated', 'statistics'],
            publish: ['isAuthenticated', 'statistics'],
            unpublish: ['isAuthenticated', 'statistics']
        },
        FileController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            upload: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            destroy: ['isAuthenticated', 'statistics'],
            publish: ['isAuthenticated', 'statistics'],
            unpublish: ['isAuthenticated', 'statistics']
        },
        FileTypeController: {
            create: ['isAuthenticated', 'statistics'],
            update: ['isAuthenticated', 'statistics'],
            destroy: ['isAuthenticated', 'statistics']
        },
        LogController: {
            create: ['isAuthenticated', 'statistics'],
            update: ['isAuthenticated', 'statistics'],
            destroy: ['isAuthenticated', 'statistics']
        },
        MapController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy', 'addUrl'],
            destroy: ['isAuthenticated', 'statistics'],
            publish: ['isAuthenticated', 'statistics'],
            unpublish: ['isAuthenticated', 'statistics']
        },
        OptionsController: true,
        OrganizationController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            destroy: ['isAuthenticated', 'statistics']
        },
        TagController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            destroy: ['isAuthenticated', 'statistics']
        },
        StatusController: {
            create: ['isAuthenticated', 'statistics'],
            update: ['isAuthenticated', 'statistics'],
            destroy: ['isAuthenticated', 'statistics']
        },
        UserController: {
            create: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            update: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            login: true,
            refreshToken: true
        },
        DeleteController: {
            delete: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            restore: ['isAuthenticated', 'statistics', 'ensureQueryTypeCast', 'addCreatedBy'],
            deactivate: ['isAuthenticated', 'statistics']
        }
    }
};