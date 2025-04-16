# statistics.py
import numpy as np
from scipy.stats import norm
import json

def calculate_gaussian(power_values):
    if not power_values:
        return None
    
    power_array = np.array(power_values)
    mean = np.mean(power_array)
    std = np.std(power_array)
    
    # Générer la courbe gaussienne
    min_val = np.min(power_array)
    max_val = np.max(power_array)
    x = np.linspace(min_val - 3*std, max_val + 3*std, 100)
    y = norm.pdf(x, mean, std)
    
    return {
        'mean': float(mean),
        'std': float(std),
        'curve': {
            'x': x.tolist(),
            'y': y.tolist()
        },
        'original_data': power_values
    }