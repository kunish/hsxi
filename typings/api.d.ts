export type ApiKey = {
  id: string
  prefix: string
  expiration: string
  createdAt: string
  lastSeen: string
}

export type PreAuthKey = {
  user: string
  id: string
  key: string
  reusable: boolean
  ephemeral: boolean
  used: boolean
  expiration: string
  createdAt: string
  aclTags: string[]
}

export type User = {
  id: string
  name: string
  createdAt: string
}

export type Node = {
  id: string
  machineKey: string
  nodeKey: string
  discoKey: string
  ipAddresses: string[]
  name: string
  user: User
  lastSeen: string
  expiry: string
  preAuthKey: PreAuthKey
  createdAt: string
  registerMethod: string
  forcedTags: string[]
  invalidTags: string[]
  validTags: string[]
  givenName: string
  online: boolean
}

export type Route = {
  id: string
  node: Node
  prefix: string
  advertised: boolean
  enabled: boolean
  isPrimary: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string
}
