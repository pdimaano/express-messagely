"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const app = require("../app");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get('/', async function(req, res) {
  //TODO: USE THEIR ENSURELOGGEDIN FUNCTION BECAUSE YOU ARE DUMB (SPENCER IS)
  const user = res.locals.user;
  if(!user) throw new UnauthorizedError();
  return res.json(await User.all());
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

module.exports = router;