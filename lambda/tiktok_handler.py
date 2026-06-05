import json
import urllib.request
import urllib.parse
import os
import math

CLIENT_KEY = os.environ.get('TIKTOK_CLIENT_KEY', '')
CLIENT_SECRET = os.environ.get('TIKTOK_CLIENT_SECRET', '')
REDIRECT_URI = os.environ.get('TIKTOK_REDIRECT_URI', 'https://hpocanada.com/auth/tiktok')

CHUNK_SIZE = 5 * 1024 * 1024  # 5MB


def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }


def lambda_handler(event, context):
    headers = cors_headers()
    method = event.get('requestContext', {}).get('http', {}).get('method', '')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    raw_path = event.get('rawPath', '')

    if raw_path.endswith('/tiktok/token'):
        return handle_token(event, headers)
    elif raw_path.endswith('/tiktok/init'):
        return handle_init(event, headers)
    elif raw_path.endswith('/tiktok/status'):
        return handle_status(event, headers)
    else:
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}


def handle_token(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        code = body.get('code', '').strip()

        if not code:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Code is required'})}

        data = urllib.parse.urlencode({
            'client_key': CLIENT_KEY,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://open.tiktokapis.com/v2/oauth/token/',
            data=data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))

        if result.get('error'):
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
                'open_id': result.get('open_id'),
                'expires_in': result.get('expires_in'),
                'refresh_token': result.get('refresh_token'),
                'scope': result.get('scope'),
            })
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}


def handle_init(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')
        title = body.get('title', '')[:150]
        video_size = int(body.get('video_size', 0))

        if not access_token or not video_size:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'access_token and video_size required'})}

        total_chunks = max(1, math.ceil(video_size / CHUNK_SIZE))

        payload = json.dumps({
            'post_info': {
                'title': title,
                'privacy_level': 'PUBLIC_TO_EVERYONE',
                'disable_duet': False,
                'disable_comment': False,
                'disable_stitch': False,
                'video_cover_timestamp_ms': 1000,
            },
            'source_info': {
                'source': 'FILE_UPLOAD',
                'video_size': video_size,
                'chunk_size': CHUNK_SIZE,
                'total_chunk_count': total_chunks,
            },
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://open.tiktokapis.com/v2/post/publish/video/init/',
            data=payload,
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))

        error = result.get('error', {})
        if error.get('code', 'ok') != 'ok':
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': error.get('message', 'Init failed')}),
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'publish_id': result['data']['publish_id'],
                'upload_url': result['data']['upload_url'],
                'chunk_size': CHUNK_SIZE,
                'total_chunks': total_chunks,
            })
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}


def handle_status(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')
        publish_id = body.get('publish_id', '')

        payload = json.dumps({'publish_id': publish_id}).encode('utf-8')

        req = urllib.request.Request(
            'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
            data=payload,
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))

        data = result.get('data', {})
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': data.get('status', 'UNKNOWN'),
                'fail_reason': data.get('fail_reason'),
                'post_id': data.get('publicaly_available_post_id'),
            })
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
