const fetch = require('node-fetch');
const { query } = require('../db');

async function proxyRequest(req, res, next) {
  try {
    const { method = 'GET', url, headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: headers,
    };

    // Only attach body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body !== undefined) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let responseStatus;
    let responseBody;

    try {
      const response = await fetch(url, fetchOptions);
      responseStatus = response.status;
      const text = await response.text();
      try {
        responseBody = JSON.parse(text);
      } catch {
        responseBody = { raw: text };
      }
    } catch (fetchErr) {
      // Network error — log it, return error response
      responseStatus = 0;
      responseBody = { error: fetchErr.message };
    }

    // Save to api_logs regardless of fetch success/failure
    await query(
      `INSERT INTO api_logs (user_id, method, url, request_body, response_status, response_body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        method.toUpperCase(),
        url,
        body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null,
        responseStatus,
        JSON.stringify(responseBody),
      ]
    );

    res.status(200).json({
      status: responseStatus,
      body: responseBody,
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const result = await query(
      `SELECT id, method, url, request_body, response_status, response_body, created_at
       FROM api_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.status(200).json({ history: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { proxyRequest, getHistory };
