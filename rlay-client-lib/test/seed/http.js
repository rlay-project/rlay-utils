const rlay = require('@rlay/web3-rlay');
const utils = require('./utils');

const classes = () => ({
  ...utils.class({
    name: 'httpConnection',
    label: 'Connection',
    description: 'A connection used for HTTP transfer.',
  }),

  ...utils.class({
    name: 'httpEntityHeader',
    label: 'Entity Header',
    description: 'An entity header in an HTTP message.',
    superClassExpression: ['*httpMessageHeader']
  }),

  ...utils.class({
    name: 'httpGeneralHeader',
    label: 'General Header',
    description: 'A general header in an HTTP message.',
    superClassExpression: ['*httpMessageHeader']
  }),

  ...utils.class({
    name: 'httpHeaderElement',
    label: 'Header Element',
    description: 'A part of a...utils.classons...utils.classted header value.',
  }),

  ...utils.class({
    name: 'httpHeaderName',
    label: 'Header Name',
    description: 'The Header Name.',
  }),

  ...utils.class({
    name: 'httpMessage',
    label: 'Message',
    description: 'An HTTP message.',
  }),

  ...utils.class({
    name: 'httpMessageHeader',
    label: 'Message Header',
    description: 'A header in an HTTP message.',
  }),

  ...utils.class({
    name: 'httpMethod',
    label: 'Method',
    description: 'The HTTP method used for a request.',
  }),

  ...utils.class({
    name: 'httpParameter',
    label: 'Parameter',
    description: 'A parameter for a part of a header value.',
  }),

  ...utils.class({
    name: 'httpRequest',
    label: 'Request',
    description: 'An HTTP request.',
    superClassExpression: ['*httpMessage']
  }),

  ...utils.class({
    name: 'httpRequestHeader',
    label: 'Request Header',
    description: 'A header in an HTTP request message.',
    superClassExpression: ['*httpMessageHeader']
  }),

  ...utils.class({
    name: 'httpResponse',
    label: 'Response',
    description: 'An HTTP response.',
    superClassExpression: ['*httpMessage']
  }),

  ...utils.class({
    name: 'httpResponseHeader',
    label: 'Response Header',
    description: 'A general header in an HTTP response message.',
    superClassExpression: ['*httpMessageHeader']
  }),

  ...utils.class({
    name: 'httpStatusCode',
    label: 'Status Code',
    description: 'The stat...utils.classode of an HTTP response.',
  }),
})

const dataProperties = () => ({
  ...utils.dataProp({ // literal
    name: 'httpAbsolutePath',
    label: 'Request URI',
    description: 'Request URI that is an absolute path.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpAbsoluteURI',
    label: 'Request URI',
    description: 'Request URI that is an absolute path.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpAuthority',
    label: 'Request URI',
    description: 'Request URI that is an absolute path.',
  }),

  ...utils.dataProp({ // cnt:ContentAsBase64
    name: 'httpBody',
    label: 'Entity Body',
    description: 'The entity body of an HTTP message.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpConnectionAuthority',
    label: 'Connection Authority',
    description: 'The authority of a connection used for the HTTP transfer.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpElementName',
    label: 'Header Element Name',
    description: 'The name of a header element.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpElementValue',
    label: 'Header Element Value',
    description: 'The value of a header element.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpFieldName',
    label: 'Field Name',
    description: 'The name of an HTTP header field.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpFieldValue',
    label: 'Field Value',
    description: 'The value of an HTTP header field.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpHTTPVersion',
    label: 'HTTP Version',
    description: 'The HTTP version of an HTTP message.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpMethodName',
    label: 'Method Name',
    description: 'The HTTP method name used for the HTTP request.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpParamName',
    label: 'Parameter Name',
    description: 'The name of a parameter in a part of a deconstructed HTTP header value.	',
  }),

  ...utils.dataProp({ // literal
    name: 'httpParamValue',
    label: 'Parameter Value',
    description: 'The value of a parameter in a part of a deconstructed HTTP header value.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpReasonPhrase',
    label: 'Reason Phrase',
    description: 'The reason phrase (status text) of an HTTP response.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpRequestURI',
    label: 'Request URI',
    description: 'The request URI of an HTTP request.',
  }),

  ...utils.dataProp({ // http://www.w3.org/2001/XMLSchema#int
    name: 'httpStatusCodeNumber',
    label: 'Status Code Number',
    description: 'The standardized status code number.',
  }),

  ...utils.dataProp({ // literal
    name: 'httpStatusCodeValue',
    label: 'Status Code Value',
    description: 'The status code value of an HTTP response.',
  }),
})

const objectProperties = () => ({
  ...utils.objectProp({ // http:HeaderName
    name: 'httpHdrName',
    label: 'Header Name',
    description: 'The name of an HTTP header.',
  }),

  ...utils.objectProp({ // Collection of http:HeaderElement
    name: 'httpHeaderElements',
    label: 'Header Elements',
    description: 'The deconstructed parts of an HTTP header value.',
  }),

  ...utils.objectProp({ // Collection of http:MessageHeader
    name: 'httpHeaders',
    label: 'Headers',
    description: 'The headers in an HTTP message.',
  }),

  ...utils.objectProp({ // http:Method
    name: 'httpMthd',
    label: 'Method',
    description: 'The HTTP method used for the HTTP request.',
  }),

  ...utils.objectProp({ // Collection of http:Parameter
    name: 'httpParams',
    label: 'Parameters',
    description: 'The parameters in a part of a deconstructed HTTP header value.',
  }),

  ...utils.objectProp({ // Collection of http:Request
    name: 'httpRequests',
    label: 'Requests',
    description: 'The HTTP requests made via a connection.',
  }),

  ...utils.objectProp({ // http:Response
    name: 'httpResp',
    label: 'Response',
    description: 'The HTTP response sent in answer to an HTTP request.',
  }),

  ...utils.objectProp({ // http:StatusCode
    name: 'httpSc',
    label: 'Status Code',
    description: 'The status code of an HTTP response.',
  }),
})

module.exports = {
  version: '2',
  includeImportsInOutput: true,
  imports: {
    ...rlay.builtins,
  },
  entities: {
    ...classes(),
    ...dataProperties(),
    ...objectProperties(),
  },
};
