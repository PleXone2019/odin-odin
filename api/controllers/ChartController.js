"use strict";

/**
 * ChartController
 * @description :: Server-side logic for ...
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');


module.exports = {
    publish: function(req, res) {
        const pk = actionUtil.requirePk(req);
        return PublishService.publishModel(Chart, pk, 'publishedStatus', res)
    },
    unpublish: function(req, res) {
        const pk = actionUtil.requirePk(req);
        return PublishService.publishModel(Chart, pk, 'unpublishedStatus', res)
    },
    create: function(req, res) {
        this.createChart(req, res, function(values) {
            UploadService.metadataSave(Chart, values, 'chart', req, res);
        });
    },
    update: function(req, res) {
        this.createChart(req, res, function(values) {
            UploadService.metadataUpdate(Chart, values, 'chart', req, res);
        });
    },

    createChart: function(req, res, cb) {


        const values = actionUtil.parseValues(req);

        var link = _.get(values, 'link', null);

        if (link !== null) {
            cb(values);
        } else {

            var fileId = _.get(values, 'file', '');
            var type = _.get(values, 'type', '');
            var dataType = _.get(values, 'dataType', '');
            values.dataSeries = _.split(_.get(values, 'dataSeries', ''), ',');

            var element1 = values.dataSeries[0];
            var element2 = values.dataSeries[1];
            // var serie = [element1];
            File.findOne(fileId).exec(function(err, record) {

                if (err) return res.negotiate(err);
                FileContentsService.mongoContents(record.dataset, record.fileName, 0, 0, res, function(table) {

                    if (dataType === 'qualitative') {

                        //if the map is qualitative we group all the data referenced by the element asked

                        var chartData = _.groupBy(table, function(value) {
                            return value[element1];
                        });
                    } else {
                        if (dataType === 'quantitative') {
                            //if the chart is quantitative return associative array
                            var chartData = _.transform(table, function(result, value) {
                                var key = value[element1];
                                var val = value[element2];
                                result[key] = val;
                            }, {});
                        }
                    }
                    values.data = {
                        labels: _.keys(chartData),
                        data: (dataType === 'quantitative') ? _.values(chartData) : _.map(_.values(chartData), _.size)
                    };

                    cb(values);

                });
            });
        }
    }
};