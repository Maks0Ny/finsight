import numpy as np


# Градиентный спуск
class GradientDescent:
    def __init__(self, learning_rate=0.01):
        self.learning_rate = learning_rate

    def step(self, weights: np.ndarray, bias: float, dw: np.ndarray, db: float) -> tuple:
        
        weights -= self.learning_rate * dw
        bias -= self.learning_rate * db
        
        return weights, bias