-- Solo después de poblar staging. Todas las consultas deben devolver cero.
-- No contiene datos identificadores en los resultados.
SELECT ABS((SELECT COUNT(*) FROM stc_billing_statement_table) -
           (SELECT COUNT(*) FROM stc_billing_statement_table_v013)) AS diferencia_cuentas;
SELECT ABS((SELECT COUNT(*) FROM stc_billing_statement_item_table) -
           (SELECT COUNT(*) FROM stc_billing_statement_item_table_v013)) AS diferencia_items;

SELECT COUNT(*) AS cuentas_con_cambios_inesperados
FROM stc_billing_statement_table s
LEFT JOIN stc_billing_statement_table_v013 n ON n.id = s.id
WHERE n.id IS NULL OR NOT (s.owner_id <=> n.owner_id)
   OR NOT (s.client_id <=> n.client_id) OR NOT (s.creditor_id <=> n.creditor_id)
   OR NOT (s.amount <=> n.amount) OR NOT (s.extra_info <=> n.extra_info)
   OR NOT (s.show_item_amount <=> n.show_item_amount) OR NOT (s.pay_date <=> n.pay_date)
   OR NOT (s.is_active <=> n.is_active) OR NOT (s.created_at <=> n.created_at)
   OR NOT (s.updated_at <=> n.updated_at)
   OR NOT ((CASE s.status WHEN 'payed' THEN 'paid' ELSE 'pending' END) <=> n.status);

SELECT COUNT(*) AS items_con_cambios_inesperados
FROM stc_billing_statement_item_table i
JOIN stc_billing_statement_table s ON s.id = i.billing_statement_id
LEFT JOIN stc_billing_statement_item_table_v013 n ON n.id = i.id
WHERE n.id IS NULL OR NOT (i.owner_id <=> n.owner_id)
   OR NOT (s.client_id <=> n.client_id)
   OR NOT (i.billing_statement_id <=> n.billing_statement_id)
   OR NOT (i.`desc` <=> n.`desc`) OR NOT (i.amount <=> n.amount)
   OR NOT (i.is_active <=> n.is_active) OR NOT (i.created_at <=> n.created_at)
   OR NOT (i.updated_at <=> n.updated_at)
   OR NOT ((CASE s.status WHEN 'payed' THEN 'paid' ELSE 'added' END) <=> n.status);
