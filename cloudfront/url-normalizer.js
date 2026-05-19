// CloudFront Function — Viewer Request
// Attach to the distribution's default cache behaviour on the "viewer request" event.
// Rewrites paths without a file extension to include a trailing slash, so
// /reserve_slot behaves identically to /reserve_slot/ and S3 returns the same
// key-miss that the custom error page mapping converts to index.html.
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (!uri.includes('.') && !uri.endsWith('/')) {
    request.uri = uri + '/';
  }
  return request;
}
