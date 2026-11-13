-- OBSOLETO: reemplazado por spec/features/023-restauracion-historicos. NO EJECUTAR como procedimiento de restauración.
-- Consultas de solo lectura; ejecutar con escrituras detenidas antes de migrar.
-- Deben devolver cero inconsistencias. No muestran datos personales.
SELECT COUNT(*) AS items_sin_cuenta
FROM stc_billing_statement_item_table i
LEFT JOIN stc_billing_statement_table s ON s.id = i.billing_statement_id
WHERE s.id IS NULL;

SELECT COUNT(*) AS items_propietario_distinto
FROM stc_billing_statement_item_table i
JOIN stc_billing_statement_table s ON s.id = i.billing_statement_id
WHERE i.owner_id <> s.owner_id;

SELECT COUNT(*) AS clientes_invalidos
FROM stc_billing_statement_table s
LEFT JOIN stc_actor_table c ON c.id = s.client_id
WHERE c.id IS NULL OR c.owner_id <> s.owner_id OR c.type <> 'client';

SELECT COUNT(*) AS acreedores_invalidos
FROM stc_billing_statement_table s
LEFT JOIN stc_actor_table c ON c.id = s.creditor_id
WHERE c.id IS NULL OR c.owner_id <> s.owner_id OR c.type <> 'creditor';

SELECT COUNT(*) AS cuentas_con_total_distinto
FROM stc_billing_statement_table s
LEFT JOIN (
  SELECT billing_statement_id, SUM(amount) AS total
  FROM stc_billing_statement_item_table
  WHERE is_active = 1
  GROUP BY billing_statement_id
) i ON i.billing_statement_id = s.id
WHERE s.amount <> COALESCE(i.total, 0);

SELECT COUNT(*) AS estados_no_reconocidos
FROM stc_billing_statement_table
WHERE status NOT IN ('pending', 'payed') OR status IS NULL;
