function FellaAdapter($document, $window, httpBatchConfig, UrlEncoder) {
  var self = this;

  self.key = 'fellaAdapter';
  self.buildRequest = buildRequestFn;
  self.parseResponse = parseResponseFn;
  self.canBatchRequest = canBatchRequestFn;

  function buildRequestFn(requests, config) {
    var httpConfig = {
        method: 'POST',
        url: config.batchEndpointUrl,
        cache: false,
        headers: config.batchRequestHeaders || {},
        data: {
          ops: [],
          sequential: true
        }
      },
      i, request,
      ops, params;

    for (i = 0; i < requests.length; i += 1) {
      request = requests[i];

      if (angular.isString(request.data)) {
        request.data = JSON.parse(request.data);
      }
      if (angular.isUndefined(request.data)) {
        request.data = {
          headers: {
            http_batcher: true
          }
        };
      } else {
        request.data.headers = {
          http_batcher: true
        };
      }
      if (!angular.isUndefined(request.data)) {
        params = angular.extend(request.data, createParams(request.url, config));
      } else {
        params = createParams(request.url, config);
      }

      ops = {
        url: createUrl(request.url, config),
        method: request.method,
        params: params,
        headers: request.headers
      };
      httpConfig.data.ops.push(ops);
    }

    return httpConfig;
  }

  function createUrl(url, config) {
    var index = url.indexOf('?');
    if (index > -1) {
      url = url.substring(0, url.indexOf('?'));
    }
    return url.replace(config.serviceUrl, '');
  }

  function createParams(url, config) {
    var index = url.indexOf('?');
    if (index > -1) {
      url = url.substring(url.indexOf('?')).slice(1);
      return UrlEncoder.decode(url);
    } else {
      return {};
    }
  }

  function parseResponseFn(requests, rawResponse) {
    var batchResponses = [],
      i, request,
      responseData = rawResponse.data.results,
      dataPart;

    for (i = 0; i < requests.length; i += 1) {
      request = requests[i];
      dataPart = responseData[i.toString()];

      batchResponses.push(new window.ahb.HttpBatchResponseData(
        request,
        dataPart.status,
        '',
        dataPart.body,
        dataPart.headers));
    }

    return batchResponses;
  }

  function canBatchRequestFn(request, config) {
    return true;
  }
}

FellaAdapter.$inject = [
  '$document',
  '$window',
  'httpBatchConfig',
  'UrlEncoder'
];

angular.module(window.ahb.name).service('fellaAdapter', FellaAdapter);
