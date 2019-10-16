SELECT 
properties.id as property_id, properties.title as title, properties.cost_per_night as cost_per_night, reservations.id, reservations.start_date as start_date, AVG(rating) as rating
FROM 
reservations JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id 
WHERE reservations.guest_id = 1 AND reservations.end_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY start_date
LIMIT 10; 