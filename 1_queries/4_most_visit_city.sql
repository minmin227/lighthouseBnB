SELECT city, COUNT(property_reviews.*) as most_visited_cities
FROM properties JOIN property_reviews ON (properties.id = property_id)
GROUP BY city
ORDER BY most_visited_city DESC;