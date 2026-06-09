import json
import urllib.request
import urllib.parse
import os

CLIENT_ID = os.environ.get('LINKEDIN_CLIENT_ID', '')
CLIENT_SECRET = os.environ.get('LINKEDIN_CLIENT_SECRET', '')

LI_API = 'https://api.linkedin.com'
LI_VERSION = '202401'


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
    elif raw_path.endswith('/linkedin/userinfo'):
        return handle_userinfo(event, headers)
    elif raw_path.endswith('/linkedin/post'):
        return handle_post(event, headers)
    elif raw_path.endswith('/linkedin/image-init'):
        return handle_image_init(event, headers)
    elif raw_path.endswith('/linkedin/video-init'):
        return handle_video_init(event, headers)
    elif raw_path.endswith('/linkedin/video-finalize'):
        return handle_video_finalize(event, headers)
    else:
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}


def li_request(url, access_token, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'LinkedIn-Version': LI_VERSION,
            'X-Restli-Protocol-Version': '2.0.0',
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode('utf-8')
        result = json.loads(body) if body else {}
        # Capture x-restli-id header for post ID
        post_id = resp.headers.get('x-restli-id', '')
        return result, post_id, resp.status


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
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': result.get('error_description', result.get('error'))})}

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


def handle_userinfo(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')

        req = urllib.request.Request(
            f'{LI_API}/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            method='GET'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'sub': result.get('sub'), 'name': result.get('name')})}
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}


def handle_post(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')
        person_id = body.get('person_id', '')
        text = body.get('text', '')
        media_id = body.get('media_id')

        if not access_token or not person_id or not text:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'access_token, person_id and text required'})}

        payload = {
            'author': f'urn:li:person:{person_id}',
            'commentary': text,
            'visibility': 'PUBLIC',
            'distribution': {'feedDistribution': 'MAIN_FEED', 'targetEntities': [], 'thirdPartyDistributionChannels': []},
            'lifecycleState': 'PUBLISHED',
            'isReshareDisabledByAuthor': False,
        }

        if media_id:
            payload['content'] = {'media': {'id': media_id}}

        result, post_id, status = li_request(f'{LI_API}/rest/posts', access_token, payload)

        if status not in (200, 201):
            return {'statusCode': status, 'headers': headers, 'body': json.dumps({'error': result.get('message', 'Post failed')})}

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'post_url': f'https://www.linkedin.com/feed/update/{post_id}'}),
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}


def handle_image_init(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')
        person_id = body.get('person_id', '')

        result, _, _ = li_request(
            f'{LI_API}/rest/images?action=initializeUpload',
            access_token,
            {'initializeUploadRequest': {'owner': f'urn:li:person:{person_id}'}}
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'upload_url': result['value']['uploadUrl'], 'image_urn': result['value']['image']}),
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}


def handle_video_init(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')
        person_id = body.get('person_id', '')
        file_size = int(body.get('file_size', 0))

        result, _, _ = li_request(
            f'{LI_API}/rest/videos?action=initializeUpload',
            access_token,
            {'initializeUploadRequest': {
                'owner': f'urn:li:person:{person_id}',
                'fileSizeBytes': file_size,
                'uploadCaptions': False,
                'uploadThumbnail': False,
            }}
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'upload_instructions': result['value']['uploadInstructions'],
                'video_urn': result['value']['video'],
            }),
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}


def handle_video_finalize(event, headers):
    try:
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '')
        video_urn = body.get('video_urn', '')
        etags = body.get('etags', [])

        li_request(
            f'{LI_API}/rest/videos?action=finalizeUpload',
            access_token,
            {'finalizeUploadRequest': {'video': video_urn, 'uploadToken': '', 'uploadedPartIds': etags}}
        )

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
