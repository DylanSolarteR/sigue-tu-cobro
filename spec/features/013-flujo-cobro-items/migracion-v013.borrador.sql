-- BORRADOR NO VALIDADO: NO ejecutar en producción ni con db:migrate.
-- Requiere ensayo en base aislada, respaldos comprobados, mantenimiento y
-- auditoria.sql con cero discrepancias. No incluye el intercambio de tablas.
-- Las tablas anteriores no se modifican; los nombres staging deben no existir.

CREATE TABLE stc_billing_statement_table_v013 (
  id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  owner_id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  client_id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  creditor_id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  amount INT NOT NULL,
  extra_info TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  status ENUM('pending', 'paid') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  show_item_amount BOOLEAN NOT NULL DEFAULT FALSE,
  pay_date TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  updated_at TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (id),
  SHARD KEY (id),
  SORT KEY (),
  KEY client_id (client_id) USING HASH,
  KEY creditor_id (creditor_id) USING HASH,
  KEY ownerId (owner_id) USING HASH
);

CREATE TABLE stc_billing_statement_item_table_v013 (
  id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  owner_id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  client_id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  billing_statement_id TEXT CHARACTER SET utf8 COLLATE utf8_general_ci,
  status ENUM('pending', 'added', 'paid') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'pending',
  `desc` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  amount INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  updated_at TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (id),
  SHARD KEY (id),
  SORT KEY (),
  KEY client_id (client_id) USING HASH,
  KEY billing_statement_id (billing_statement_id) USING HASH,
  KEY ownerId (owner_id) USING HASH
);

INSERT INTO stc_billing_statement_table_v013
  (id, owner_id, client_id, creditor_id, amount, extra_info, status,
   show_item_amount, pay_date, is_active, created_at, updated_at)
SELECT id, owner_id, client_id, creditor_id, amount, extra_info,
  CASE status WHEN 'payed' THEN 'paid' WHEN 'pending' THEN 'pending' ELSE NULL END,
  show_item_amount, pay_date, is_active, created_at, updated_at
FROM stc_billing_statement_table;

INSERT INTO stc_billing_statement_item_table_v013
  (id, owner_id, client_id, billing_statement_id, status, `desc`, amount,
   is_active, created_at, updated_at)
SELECT i.id, i.owner_id, s.client_id, i.billing_statement_id,
  CASE s.status WHEN 'payed' THEN 'paid' WHEN 'pending' THEN 'added' ELSE NULL END,
  i.`desc`, i.amount, i.is_active, i.created_at, i.updated_at
FROM stc_billing_statement_item_table i
JOIN stc_billing_statement_table s ON s.id = i.billing_statement_id;
