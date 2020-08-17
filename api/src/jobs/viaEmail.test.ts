import R from 'ramda'
import { SES } from 'aws-sdk'
import * as viaEmailModule from './viaEmail'
import { encrypt } from '../lib/crypt'

const BASE_NOTIFICATION = {
  id: 1,
  app_id: 1,
  recipient: 'recipient',
  via: 'app',
  locale: 'pt-br',
  version: 1,
  template: 'Test template. Hello {{ testvar }}',
  data: JSON.stringify({
    testvar: 'duck'
  }),
  template_data: JSON.stringify({
    sender: 'Test sender',
    subject: 'Test {{ testvar }} subject',
  })
}

const EXPECTED_SES_PARAMS = {
  Destination: {
    ToAddresses: [ 'recipient' ]
  },
  Source: 'Test sender',
  ReplyToAddresses: [
    'Test sender'
  ],
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: 'Test template. Hello duck'
      },
      Text: {
        Charset: 'UTF-8',
        Data: 'Test template. Hello duck'
      }
    },
    Subject: {
      Charset: 'UTF-8',
        Data: 'Test duck subject'
    }
  },
}

beforeAll(() => {
  // mock getCredentials
  const mockedCredentials: viaEmailModule.Credential = {
    access_key: encrypt('test'),
    secret_key: encrypt('test'),
    region: encrypt('test'),
  }
  const spy = jest.spyOn(viaEmailModule, 'getCredentials');
  spy.mockReturnValue(Promise.resolve(mockedCredentials));
});

test('check parsed data', () => {
  const expected = {
    ...BASE_NOTIFICATION,
    data: JSON.parse(BASE_NOTIFICATION.data),
    template_data: JSON.parse(BASE_NOTIFICATION.template_data)
  }

  expect(
    viaEmailModule.parseData(BASE_NOTIFICATION)
  ).toStrictEqual(expected)
})

test('check parsed data when data is an empty string', () => {
  const notification = {
    ...BASE_NOTIFICATION,
    data: "",
    template_data: ""
  }
  const expected = {
    ...BASE_NOTIFICATION,
    data: {},
    template_data: {}
  }

  expect(
    viaEmailModule.parseData(notification)
  ).toStrictEqual(expected)
})

test('buildContext returns correct Context', async () => {
  const expected = {
    meta: {
      sender: 'Test sender',
      recipient: 'recipient',
      subject: 'Test duck subject',
    },
    html: 'Test template. Hello duck',
    txt: 'Test template. Hello duck'
  }

  expect(
    await R.pipe(
      viaEmailModule.parseData,
      viaEmailModule.buildContext
    )( BASE_NOTIFICATION )
  ).toStrictEqual(expected)
})

test('buildContext returns "(Sem assunto)" for undefined subjects', async () => {
  const notification = {
    ...BASE_NOTIFICATION,
    template_data: JSON.stringify({
      sender: 'Test sender',
    })
  }
  const expected = {
    meta: {
      sender: 'Test sender',
      recipient: 'recipient',
      subject: '(Sem assunto)',
    },
    html: 'Test template. Hello duck',
    txt: 'Test template. Hello duck'
  }

  expect(
    await R.pipe(
      viaEmailModule.parseData,
      viaEmailModule.buildContext
    )( notification )
  ).toStrictEqual(expected)
})

test('buildSesParams returns correct SES params', () => {
  const context = {
    meta: {
      sender: 'Test sender',
      recipient: 'recipient',
      subject: 'Test duck subject',
    },
    html: 'Test template. Hello duck',
    txt: 'Test template. Hello duck'
  }

  expect(
    viaEmailModule.buildSesParams(context)
  ).toStrictEqual(EXPECTED_SES_PARAMS)
})


test('validateCredentials should return credentials when they are present', () => {
  const data = {
    access_key: 'abc',
    secret_key: 'abc',
    region: 'abc'
  }

  expect(
    viaEmailModule.validateCredentials(data)
  ).toStrictEqual(data)
})

test('validateCredentials should raise an error when credentials are invalid', () => {
  const invalidCredentialsArray = [
    { access_key: 'abc', secret_key: '', region: 'abc' },
    { access_key: '', secret_key: 'abc', region: 'abc' },
    { access_key: '', secret_key: '', region: '' },
    { region: '' }
  ]

  R.forEach((invalidCredential) => {
    expect(
      () => {
        viaEmailModule.validateCredentials(invalidCredential)
      }
    ).toThrow('AWS credentials incorrectly set up')
  }, invalidCredentialsArray)
})

test('decodeCredentials should decode credentials with secret key', () => {
  const credentials = {
    access_key: 'abc',
    secret_key: 'abc',
    region: 'abc'
  }
  const encryptedCredentials = R.mapObjIndexed((v, _k, _o) => encrypt(v), credentials)
  expect(
    viaEmailModule.decodeCredentials(encryptedCredentials)
  ).toStrictEqual(credentials)
})

test('buildClient returns AWS.SES client', () => {
  const credentials = {
    access_key: 'abc',
    secret_key: 'abc',
    region: 'abc'
  }

  const client = viaEmailModule.buildClient(credentials)
  expect(client instanceof SES).toBe(true)
  expect(client.config?.accessKeyId).toBe(credentials.access_key)
  expect(client.config?.secretAccessKey).toBe(credentials.secret_key)
  expect(client.config?.region).toBe(credentials.region)
})

test('getClient generates AWS client for notification', async () => {

  const client = await viaEmailModule.getClient(BASE_NOTIFICATION)
  expect(client instanceof SES).toBe(true)
  expect(client.config?.accessKeyId).toBe('test')
  expect(client.config?.secretAccessKey).toBe('test')
  expect(client.config?.region).toBe('test')
})

test('getParams generates SES request params for notification', async () => {
  expect(
    await viaEmailModule.getParams(BASE_NOTIFICATION)
  ).toStrictEqual(EXPECTED_SES_PARAMS)
})

test('buildEmail generates Email object for notification', async () => {
  const email = await viaEmailModule.buildEmail(BASE_NOTIFICATION)

  expect(email.client instanceof SES).toBe(true)
  expect(email.params).toStrictEqual(EXPECTED_SES_PARAMS)
})

test('sendEmail calls client.sendEmail with params and chains .promise', async () => {
  const client = {
    sendEmail: jest.fn(() => ({
      promise: jest.fn()
    }))
  }

  const email = {
    client,
    params: EXPECTED_SES_PARAMS
  } as any as viaEmailModule.Email
  
  viaEmailModule.sendEmail(email)

  expect(client.sendEmail).toHaveBeenCalled()
  expect(client.sendEmail.mock.results[0].value.promise).toHaveBeenCalled()
})

test('sendEmail calls client.sendEmail with params and chains .promise', async () => {
  const client = {
    sendEmail: jest.fn(() => ({
      promise: jest.fn()
    }))
  }

  const email = {
    client,
    params: EXPECTED_SES_PARAMS
  } as any as viaEmailModule.Email
  
  viaEmailModule.sendEmail(email)

  expect(client.sendEmail).toHaveBeenCalled()
  expect(client.sendEmail.mock.results[0].value.promise).toHaveBeenCalled()
})

test('success returns a resolved success promise', async () => {
  const response = viaEmailModule.success({} as any as SES.SendEmailResponse)
  expect(response).resolves.toEqual({ 
    status: "SUCCESS",
    serviceResponse: {}
  })
})

test('job function calls buildEmail, sendEmail and success', async () => {
  const mockImplementation = R.forEach(
    (spy: jest.SpyInstance) => { spy.mockImplementation(() => Promise.resolve()) }
  )
  const restoreMocks = R.forEach(
    (spy: jest.SpyInstance) => spy.mockRestore()
  )
  const expectCalls = R.forEach(
    (spy: jest.SpyInstance) => expect(spy).toHaveBeenCalled()
  )

  // Mock methods
  const mockedMethods: Array<keyof typeof viaEmailModule> = ['buildEmail', 'sendEmail', 'success']
  const spies = R.map((name) => jest.spyOn(viaEmailModule, name), mockedMethods)
  mockImplementation(spies)

  // Test function
  await viaEmailModule.default(BASE_NOTIFICATION)
  expectCalls(spies)

  // Restore mocks
  restoreMocks(spies)
})
