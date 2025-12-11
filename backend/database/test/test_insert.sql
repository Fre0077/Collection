INSERT INTO user (name, surname, password) VALUES
("Francesco", "De Santis", "Password12");

INSERT INTO collection (user_id, name) VALUES
(1 ,'Tappi');

INSERT INTO attribute (collection_id, name) VALUES
(1, 'Marca'),
(1, 'Colore');


INSERT INTO item (collection_id) VALUES
(1);

INSERT INTO item_attribute(item_id, attribute_id, value) VALUES
(1, 1, "Coca-Cola"),
(1, 2, "Rosso");

