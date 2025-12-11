SELECT i.id FROM item i
JOIN collection c ON i.collection_id = c.id
JOIN item_attribute ia ON ia.item_id = i.id
JOIN attribute a ON ia.attribute_id = a.id
WHERE c.name = "Tappi"
AND	a.name = "Colore"
AND	ia.value = "Verde";