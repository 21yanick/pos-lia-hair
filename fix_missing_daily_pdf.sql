-- Hot-Fix: Erstelle fehlende Daily Report Dokument-Einträge
-- Für alle geschlossenen Daily Summaries ohne entsprechendes Dokument

INSERT INTO documents (type, reference_id, file_path, payment_method, document_date, user_id)
SELECT 
  'daily_report',
  ds.id,
  'documents/daily_reports/tagesabschluss-' || ds.report_date || '.pdf',
  null,
  ds.report_date,
  ds.user_id
FROM daily_summaries ds
LEFT JOIN documents d ON d.reference_id = ds.id AND d.type = 'daily_report'
WHERE ds.status = 'closed' 
  AND d.id IS NULL;

-- Zeige Ergebnis
SELECT 'Dokumente erstellt für diese Daily Summaries:' as info;
SELECT ds.report_date, ds.status, 'Dokument erstellt' as result
FROM daily_summaries ds
JOIN documents d ON d.reference_id = ds.id AND d.type = 'daily_report'
WHERE ds.status = 'closed';