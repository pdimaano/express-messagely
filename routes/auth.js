"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const { BadRequestError, UnauthorizedError } = require("../expressError");

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { username, password } = req.body;
  const result = await db.query(
    "SELECT password FROM users WHERE username = $1",
    [username]
  );
  const hashPassword = result.rows[0];

  if (hashPassword) {
    if ((await bcrypt.compare(password, hashPassword.password)) === true) {
      const token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token });
    }
  }
  throw new UnauthorizedError("Invalid user/password");
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const user = await User.register(req.body);
  const token = jwt.sign({ username: user.username }, SECRET_KEY);
  return res.json({ token });
});

module.exports = router;
