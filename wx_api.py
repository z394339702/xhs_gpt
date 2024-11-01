from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
 
app = Flask(__name__)
CORS(app)  # 启用CORS
 
CLIENT_ID = 'API Key'  # 替换为你的API Key
CLIENT_SECRET = 'Secret Key'  # 替换为你的Secret Key
 
@app.route('/getAccessToken', methods=['GET', 'POST'])
def get_access_token():
    url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}"
    print(url)
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=headers, json={})
    print(response.text)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to retrieve access token'}), response.status_code
 
@app.route('/getWenxinResponse', methods=['POST'])
def get_wenxin_response():
    data = request.get_json()
    access_token = data['access_token']
    prompt = data['prompt']
    url = f"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-tiny-8k?access_token={access_token}"
    payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "top_p": 0,
    }
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to retrieve Wenxin response'}), response.status_code
 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)


