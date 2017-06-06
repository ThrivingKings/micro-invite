const { send } = require('micro')
const uuid = require('uuid')

const {
  router,
  get,
  post,
  head
} = require('microrouter')

const { PENDING, REDEEMED } = require('./statuses')

const rethinkDB = require('rethinkdb')
let rethinkDBConnection
rethinkDB.connect({ host: 'localhost', port: 32775 }, (err, connection) => {
  if(err) throw err
  rethinkDBConnection = connection
})

const create = async (req, res) => {
  let invitation = Object.assign({
    hash: uuid.v1(),
    status: PENDING
  }, req.body)

  await rethinkDB.table('invitations')
    .insert(invitation)
    .run(rethinkDBConnection, err => {
      if (err) throw err
    })

  send(res, 201, invitation)
}

const redeem = async (req, res) => {
  const { hash } = req.params
  let invitation

  await rethinkDB.table('invitations')
    .filter({ hash })
    .update({ status: REDEEMED }, { returnChanges: true })
    .run(rethinkDBConnection, (err, result) => {
      if (err) throw err

      invitation = result
    })

  if (!invitation.changes) {
    send(res, 404, 'Invitation not found')
  } else if (!invitation.changes.length) {
    send(res, 409, 'Invitation already redeemed')
  } else {
    send(res, 200, invitation.changes[0].new_val)
  }
}

const assert = async (req, res) => {
  const { hash } = req.params
  let invitation

  await rethinkDB.table('invitations')
    .getAll(hash, { index: 'hash' })
    .coerceTo('array')
    .run(rethinkDBConnection, (err, result) => {
      if (err) throw err

      invitation = result
    })

  if (!invitation.length) {
    send(res, 404)
  } else {
    send(res, 200)
  }
}

const notfound = (req, res) =>
  send(res, 404, 'Route not found')

module.exports = router(
  post('/create', create),
  get('/:hash', redeem),
  head('/:hash', assert),
  get('/*', notfound)
)
