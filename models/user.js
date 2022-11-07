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
                                 join_at,
                                 last_login_at)
             VALUES
               ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
             RETURNING username, password, first_name, last_name, phone`,
      [username, hashPassword, first_name, last_name, phone]
    );

    //TODO: add check to make sure we got rows[0] can also add try/catch
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `
      SELECT username, password
        FROM users
        WHERE username = $1
      `, [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`); //TODO: return false

    return (await bcrypt.compare(password, user.password)) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    db.query( //TODO: await this
      `UPDATE users
            SET last_login_at = current_timestamp
            WHERE username = $1`, [username]
    );

    //TODO: add a returning clause to check if you got anything back
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username,
                  first_name,
                  last_name
              FROM users` //TODO: ORDER BY
    );

    return results.rows;
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
                  last_login_at
             FROM users
             WHERE username = $1`,
      [username]
    );

    let user = result.rows[0];
    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let results = await db.query(
      `SELECT
              m.id,
              m.body,
              m.sent_at,
              m.read_at,
              t.username,
              t.first_name,
              t.last_name,
              t.phone
        FROM users AS f
          JOIN messages AS m ON f.username = m.from_username
          JOIN users AS t ON m.to_username = t.username
        WHERE f.username = $1`, //NOTE we dont' need all 3 tables (can trim down to 2 message<->user)
      [username]
    );

    let messagesFrom = results.rows;

    if (!messagesFrom[0]) throw new NotFoundError(`No such user: ${username}`); //TODO: don't need this user can have 0 messages

    return messagesFrom.map(message => {
      return {
        id: message.id,
        to_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      };
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    let results = await db.query(
      `SELECT
              m.id,
              m.body,
              m.sent_at,
              m.read_at,
              f.username,
              f.first_name,
              f.last_name,
              f.phone
        FROM users AS t
          JOIN messages AS m ON t.username = m.to_username
          JOIN users AS f ON m.from_username = f.username
        WHERE t.username = $1`,
      [username]
    );

    let messagesTo = results.rows;

    if (!messagesTo[0]) throw new NotFoundError(`No such user: ${username}`);

    return messagesTo.map(message => {
      return {
        id: message.id,
        from_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      };
    });
  }
}

module.exports = User;
