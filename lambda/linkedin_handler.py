import json
import urllib.request
import urllib.parse
import os

CLIENT_ID = os.environ.get('LINKEDIN_CLIENT_ID', '')
CLIENT_SECRET = os.environ.get('LINKEDIN_CLIENT_SECRET', '')


def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }


def lambda_handler(event, context):
    headers = cors_headers()
    method = event.get('requestContext', {}).get('http', {}).get('method', '')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    raw_path = event.get('rawPath', '')

    if raw_path.endswith('/linkedin/token'):
        return handle_token(event, headers)
    else:
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}


def handle_token(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        code = body.get('code', '').strip()
        redirect_uri = body.get('redirect_uri', '').strip()

        if not code or not redirect_uri:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'code and redirect_uri required'})}

        data = urllib.parse.urlencode({
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://www.linkedin.com/oauth/v2/accessToken',
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))

        if 'error' in result:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': result.get('error_description', result.get('error'))}),
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'access_token': result.get('access_token'),
                'expires_in': result.get('expires_in'),
                'scope': result.get('scope'),
            }),
        }

    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
