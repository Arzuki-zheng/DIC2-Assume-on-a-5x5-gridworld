import numpy as np
import random

# Actions: 0: LEFT, 1: RIGHT, 2: UP, 3: DOWN
ACTIONS = [(0, -1), (0, 1), (-1, 0), (1, 0)]

def is_valid_state(n, r, c, obstacles):
    if r < 0 or r >= n or c < 0 or c >= n:
        return False
    if [r, c] in obstacles:
        return False
    return True

def get_next_state(n, r, c, a_idx, obstacles):
    dr, dc = ACTIONS[a_idx]
    nr, nc = r + dr, c + dc
    if is_valid_state(n, nr, nc, obstacles):
        return nr, nc
    return r, c

def get_reward(nr, nc, end):
    if [nr, nc] == end:
        return 10.0
    return -0.1

def generate_random_policy(n, obstacles, end):
    policy = {}
    for r in range(n):
        for c in range(n):
            if [r, c] == end or [r, c] in obstacles:
                continue
            policy[(r, c)] = random.randint(0, 3)
    return policy

def evaluate_deterministic_policy(n, obstacles, end, policy, gamma=0.9, theta=1e-4):
    V = np.zeros((n, n))
    while True:
        delta = 0
        V_new = np.copy(V)
        for r in range(n):
            for c in range(n):
                if [r, c] == end or [r, c] in obstacles:
                    continue
                a_idx = policy[(r, c)]
                nr, nc = get_next_state(n, r, c, a_idx, obstacles)
                reward = get_reward(nr, nc, end)
                if [nr, nc] == end:
                    v = reward
                else:
                    v = reward + gamma * V[nr, nc]
                V_new[r, c] = v
                delta = max(delta, abs(v - V[r, c]))
        V = V_new
        if delta < theta:
            break
            
    policy_list = []
    for r in range(n):
        for c in range(n):
            if [r, c] in obstacles:
                policy_list.append(-2)
            elif [r, c] == end:
                policy_list.append(-1)
            else:
                policy_list.append(policy[(r, c)])
                
    return V.tolist(), policy_list

def value_iteration(n, obstacles, end, gamma=0.9, theta=1e-4):
    V = np.zeros((n, n))
    while True:
        delta = 0
        V_new = np.copy(V)
        for r in range(n):
            for c in range(n):
                if [r, c] == end or [r, c] in obstacles:
                    continue
                v_max = float('-inf')
                for a_idx in range(4):
                    nr, nc = get_next_state(n, r, c, a_idx, obstacles)
                    reward = get_reward(nr, nc, end)
                    if [nr, nc] == end:
                        val = reward
                    else:
                        val = reward + gamma * V[nr, nc]
                    if val > v_max:
                        v_max = val
                V_new[r, c] = v_max
                delta = max(delta, abs(v_max - V[r, c]))
        V = V_new
        if delta < theta:
            break
            
    policy_list = []
    for r in range(n):
        for c in range(n):
            if [r, c] in obstacles:
                policy_list.append(-2)
                continue
            if [r, c] == end:
                policy_list.append(-1)
                continue
            v_max = float('-inf')
            best_a = -1
            for a_idx in range(4):
                nr, nc = get_next_state(n, r, c, a_idx, obstacles)
                reward = get_reward(nr, nc, end)
                if [nr, nc] == end:
                    val = reward
                else:
                    val = reward + gamma * V[nr, nc]
                if val > v_max:
                    v_max = val
                    best_a = a_idx
            policy_list.append(best_a)
            
    return V.tolist(), policy_list
