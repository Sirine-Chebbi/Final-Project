import numpy as np
from scipy.stats import norm

def calculate_gaussian(values):
    if not values or len(values) < 2:
        return None
    
    values_array = np.array(values)
    mean = np.mean(values_array)
    std = np.std(values_array)
    
    # Ajustement des bornes pour une meilleure visualisation
    min_val = np.min(values_array)
    max_val = np.max(values_array)
    x = np.linspace(min_val - 3*std, max_val + 3*std, 100)
    y = norm.pdf(x, mean, std)
    
    return {
        'mean': float(mean),
        'std': float(std),
        'curve': {
            'x': x.tolist(),
            'y': y.tolist()
        },
        'original_data': values
    }