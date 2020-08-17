export class Forbidden extends Error {
  extensions: { name: 'Forbidden' }

  constructor(message: string) {
    super(message)
    this.name = 'Forbidden'
    this.extensions = {
      name: 'Forbidden',
    }
  }
}

export class MustBeAnAdministrator extends Error {
  extensions: { name: 'Forbidden' }

  constructor(
    message: string = 'You must be an administrator to do this action',
  ) {
    super(message)
    this.name = 'Forbidden'
    this.extensions = {
      name: 'Forbidden',
    }
  }
}

export class MustBeAuthenticated extends Error {
  extensions: { name: 'Forbidden' }

  constructor(
    message: string = 'You must be authenticated to do this action',
  ) {
    super(message)
    this.name = 'Forbidden'
    this.extensions = {
      name: 'Forbidden',
    }
  }
}

export class InvalidCredentials extends Error {
  extensions: { name: 'Forbidden' }

  constructor(
    message: string = 'The provided secret is invalid',
  ) {
    super(message)
    this.name = 'InvalidSecret'
    this.extensions = {
      name: 'Forbidden',
    }
  }
}

export class YouMustBeLoggedIn extends Error {
  constructor(message: string = 'You must be logged in to do this action') {
    super(message)
    this.name = 'YouMustBeLoggedIn'
  }
}
