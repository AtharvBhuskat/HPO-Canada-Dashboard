import json
import boto3

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

SYSTEM_PROMPT = """You are an AI assistant for HPO Canada, a professional marketing and business growth company based in Canada.

You help the HPO Canada team with:
- Marketing strategy and content ideas
- Social media planning (Facebook, Instagram, YouTube, TikTok, LinkedIn, Reddit)
- Analyzing leads and business opportunities
- Writing and improving blog posts, emails, and research briefs
- Answering questions about AI tools and digital marketing
- Campaign planning and scheduling

Be concise, professional, and practical. Always tailor advice to the Canadian market context when relevant."""

def lambda_handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }

    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        message = body.get('message', '').strip()
        history = body.get('history', [])

        if not message:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Message is required'})}

        messages = history + [{'role': 'user', 'content': [{'text': message}]}]

        response = bedrock.converse(
            modelId='amazon.nova-lite-v1:0',
            system=[{'text': SYSTEM_PROMPT}],
            messages=messages,
            inferenceConfig={'maxTokens': 1024, 'temperature': 0.7},
        )

        reply = response['output']['message']['content'][0]['text']

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'reply': reply}),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
        }
