import math

def calculate_distance(point1, point2):
    """Calculate Euclidean distance between two points"""
    return math.sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)

def calculate_midpoint(point1, point2):
    """Calculate midpoint between two points"""
    return ((point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2)

def calculate_slope(point1, point2):
    """Calculate slope between two points"""
    if point2[0] == point1[0]:
        return float('inf')  # Vertical line
    return (point2[1] - point1[1]) / (point2[0] - point1[0])

def are_points_collinear(point1, point2, point3, tolerance=0.05):
    """Check if three points are collinear within tolerance"""
    area = abs(
        point1[0] * (point2[1] - point3[1]) +
        point2[0] * (point3[1] - point1[1]) +
        point3[0] * (point1[1] - point2[1])
    ) / 2.0
    
    return area < tolerance