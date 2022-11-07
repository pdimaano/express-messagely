"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {
  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username,
                                 password,
                                 first_name,
                                 last_name,
                                 phone,
                                 join_at)
             VALUES
               ($1, $2, $3, $4, $5, current_timestamp)
             RETURNING username, password, first_name, last_name, phone`,
      [username, hashPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let currUser = User.get(username);
    return (await bcrypt.compare(password, currUser.password)) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    db.query(
      `UPDATE users
            SET last_login_at = current_timestamp
            WHERE username = $1`[username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username,
                  first_name,
                  last_name,
              FROM users`
    );

    return results.rows[0];
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
                  first_name,
                  last_name,
                  phone,
                  join_at,
                  last_login_at,
             FROM users
             WHERE username = $1`,
      [username]
    );

    let user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return { user };
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let messages = await db.query(
      `SELECT `
    )
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
