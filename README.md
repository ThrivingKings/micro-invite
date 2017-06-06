# Invitation micro-service
Super simple, super small, super duper.

## Assumptions being made
* You have a rethink database running locally
* You have an `invitations` table in that database
* You have a secondary index for `hash` on that table

## Using
`yarn install && yarn start`

## API
Creating invitations
```
POST /create -d '{"email":"myname@hello.net"}'

❯ 201, {
  hash: 'ef32e540-472d-11e7-a574-43adb376c9f6',
  status: 'pending',
  email: 'myname@hello.net'
}
```
Redeeming invitations
```
GET /:hash

❯ 200, {
  hash: 'ef32e540-472d-11e7-a574-43adb376c9f6',
  status: 'redeemed',
  email: 'myname@hello.net'
}

❯ 404, 'Invitation not found'
❯ 409, 'Invitation already redeemed'
```
Asserting invitations
```
HEAD /:hash

❯ 200
❯ 404
```
