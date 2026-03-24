from flask import Flask, request, jsonify, render_template
from rl_env import generate_random_policy, evaluate_deterministic_policy, value_iteration
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/evaluate_random', methods=['POST'])
def evaluate_random():
    data = request.json
    n = data.get('n')
    obstacles = data.get('obstacles', [])
    end = data.get('end')
    
    if n is None or end is None:
        return jsonify({"error": "Missing parameters"}), 400
        
    policy = generate_random_policy(n, obstacles, end)
    V, policy_list = evaluate_deterministic_policy(n, obstacles, end, policy)
    
    return jsonify({
        "values": V,
        "policy": policy_list
    })

@app.route('/api/value_iteration', methods=['POST'])
def run_value_iteration():
    data = request.json
    n = data.get('n')
    obstacles = data.get('obstacles', [])
    end = data.get('end')
    
    if n is None or end is None:
        return jsonify({"error": "Missing parameters"}), 400
        
    V, policy_list = value_iteration(n, obstacles, end)
    
    return jsonify({
        "values": V,
        "policy": policy_list
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
