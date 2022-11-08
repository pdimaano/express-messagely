"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth")
const User = require("../models/user");

/** GET / - get list of users.
 * Goes through autheticateJWT, ensureLoggedIn middleware
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async function(req, res) {
  const users = await User.all();
  return res.json({users});
});

/** GET /:username - get detail of users.
 * Goes through autheticateJWT, ensureCorrectUser middleware
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async function(req, res) {
  const user = await User.get(req.params.username);
  return res.json({user});
});


/** GET /:username/to - get messages to user
 * Goes through autheticateJWT, ensureCorrectUser middleware
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async function(req, res) {
  const messages = await User.messagesTo(req.params.username);
  return res.json({messages});
});


/** GET /:username/from - get messages from user
 * Goes through autheticateJWT, ensureCorrectUser middleware
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async function(req, res) {
  const messages = await User.messagesFrom(req.params.username);
  return res.json({messages});
});

module.exports = router;