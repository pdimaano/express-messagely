"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");
const Message = require("../models/message");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function(req, res) {
  const { username } = res.locals.user;
  const id = req.params.id;
  const messageInfo = await Message.get(id);
  const fromUsername = messageInfo.from_user.username;
  const toUsername = messageInfo.to_user.username;

  if (username !== toUsername && username !== fromUsername) {
    throw new UnauthorizedError();
  }

  return res.json({message: messageInfo});
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req, res) {
  if (req.body === undefined) throw new BadRequestError();
  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;
  const messageInfo = await Message.create({ from_username, to_username, body});

  return res.status(201).sjson({message: messageInfo});
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async function(req, res) {
  const { username } = res.locals.user;
  const id = req.params.id;
  const messageInfo = await Message.get(id);
  const toUsername = messageInfo.to_user.username;

  if (username !== toUsername) throw new UnauthorizedError();
  const readConfirmation = await Message.markRead(id);
  return res.json({message: readConfirmation});
});

module.exports = router;