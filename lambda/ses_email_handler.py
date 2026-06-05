import json
import boto3
import os

# Production access granted in ca-central-1
ses = boto3.client('ses', region_name='ca-central-1')

FROM_EMAIL = os.environ.get('FROM_EMAIL', 'marketing@hpocanada.com')


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

    try:
        body = json.loads(event.get('body', '{}'))
        to_raw = body.get('to', [])
        subject = body.get('subject', '').strip()
        html_body = body.get('html', '').strip()
        text_body = body.get('text', '').strip()

        if not subject:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'subject is required'})}

        # Accept comma-separated string or array
        if isinstance(to_raw, str):
            to_addresses = [e.strip() for e in to_raw.replace('\n', ',').split(',') if e.strip()]
        else:
            to_addresses = [e.strip() for e in to_raw if e.strip()]

        if not to_addresses:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'at least one recipient is required'})}

        # Strip HTML for plain text fallback
        if not text_body and html_body:
            import re
            text_body = re.sub(r'<[^>]+>', ' ', html_body)
            text_body = re.sub(r'\s+', ' ', text_body).strip()

        response = ses.send_email(
            Source=f'HPO Canada <{FROM_EMAIL}>',
            Destination={'ToAddresses': to_addresses},
            Message={
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {'Data': html_body or text_body, 'Charset': 'UTF-8'},
                    'Text': {'Data': text_body or subject, 'Charset': 'UTF-8'},
                },
            },
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message_id': response['MessageId'],
                'sent_to': len(to_addresses),
            }),
        }

    except ses.exceptions.MessageRejected as e:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': f'Message rejected: {str(e)}'})}
    except ses.exceptions.MailFromDomainNotVerifiedException as e:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Sender domain not verified in SES'})}
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
