/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      var project = req.params.project;
      let query = req.query;
      if (query._id) {
        query._id = new ObjectId(query._id);
      }
      if (query.open) {
        query.open = String(query.open) == "true";
      }
      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true },
        function(err, db) {
          db.db()
            .collection(project)
            .find(query).toArray((err, issues) => {
              res.json(issues);
            });
        }
      );
    })

    .post(function(req, res) {
      var project = req.params.project;
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to ? req.body.assigned_to : "",
        status_text: req.body.status_text ? req.body.status_text : "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };
      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true },
        function(err, db) {
          db.db()
            .collection(project)
            .insertOne(
              {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to ? req.body.assigned_to : "",
                status_text: req.body.status_text ? req.body.status_text : "",
                created_on: new Date(),
                updated_on: new Date(),
                open: true
              },
              (err, doc) => {
                issue._id = doc.insertedId;
                res.json(issue);
              }
            );
        }
      );
    })

    .put(function(req, res) {
      var project = req.params.project;
      let id = req.body._id;
      delete req.body._id;
      let updates = req.body;
      for (let ele in updates) {
        if (!updates[ele]) {
          delete updates[ele];
        }
      }
      if (Object.keys(updates).length === 0) {
        return res.send("no updated field sent");
      }
      updates.updated_on = new Date();
      MongoClient.connect(
        CONNECTION_STRING,
        { useUnifiedTopology: true },
        function(err, db) {
          db.db()
            .collection(project)
            .findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: updates },
              { upsert: true },
              (err, issue) => {
                if (err) res.send(`could not update ${id} ${err}`);
                else res.send("successfully updated");
              }
            );
        }
      );
    })

    .delete(function(req, res) {
      var project = req.params.project;
      var issue = req.body._id;
      if (!issue) {
        res.send('_id error');
      } else {
        MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true }, function(err, db) {
          var collection = db.db().collection(project);
          collection.findOneAndDelete({_id:new ObjectId(issue)},function(err,doc){
            (!err) ? res.send('deleted '+issue) : res.send('could not delete '+issue+' '+err);
          });
        });
      }
    });
};
