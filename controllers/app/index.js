'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Message = mongoose.model('Message'),
    Category = mongoose.model('Category'),
    Tag = mongoose.model('Tag'),
    File = mongoose.model('File'),
    config = require('../../config'),
    _ = require('underscore'),
    core = require('../../libs/core');
exports.index = function(req, res) {
    console.log('前台')
    console.log(req.headers['x-forwarded-for'])
    //console.time('content-list');
    var condition = {};
    var obj = {
        slide: [],
        portfolio: []
    };
    /*Content.find({'category.flag': 'slide'}).populate('category').exec().then(function(data) {
        console.log(data)
    });*/
    Category.findOne({flag: 'slide'}).exec().then(function(obj) {
        return Content.find({category: obj.id}).populate('gallery category tags').limit(3).sort({created: -1}).exec();
    }).then(function(data) {
        //console.log(data)
        obj.slide = data;
        return Category.find({flag: {'$in': ['portfolio', 'slide']}}).exec();
    }).then(function(obj) {
        //console.log(obj)
        var ids = obj.map(function(item) {
            return item.id;
        });
        return Content.find({category: {'$in': ids}}).populate('gallery category tags author').sort({created: -1}).exec();
    }).then(function(data) {
        obj.portfolio = data;
        return Tag.find().exec();
    }).then(function(data) {
        obj.tags = data;
        //console.log(obj)
        res.render('app/index', {
            //title: '列表',
            title: '网站首页',
            slide: obj.slide,
            portfolio: obj.portfolio,
            tags: obj.tags
        });
    })
};

exports.contact = function(req, res) {
    if(req.method === 'GET') {
        res.render('app/contact', {});
    } else if (req.method === 'POST') {
        var obj = req.body;
        //obj.ip = req.ip;
        obj.ip = core.getIp(req);
        //console.log(obj.ip)
        var contact = new Message(obj);
        contact.save(function(err, result) {
            console.log(err, result);
            if (err) {
                return res.render('app/info', {
                    message: err
                });
            } else {
                res.render('app/info', {
                    message: '提交成功'
                });
            }
        })
        
    }
    
}