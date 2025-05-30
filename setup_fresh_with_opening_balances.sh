#!/bin/bash
# Script zum kompletten Neusetup der Datenbank MIT ANFANGSBESTÄNDEN
# Für Vollimport seit Geschäftsstart September 2024
# Autor: Claude Code

echo "🏦 Starte Datenbank-Setup MIT Anfangsbeständen..."

CONTAINER_NAME="supabase-db"

# Prüfe, ob der Container läuft
if ! docker ps | grep -q $CONTAINER_NAME; then
  echo "❌ Fehler: Der Container '$CONTAINER_NAME' läuft nicht."
  echo "Bitte starte den Container und versuche es erneut."
  exit 1
fi

echo "✅ Container '$CONTAINER_NAME' läuft"

# 1. Frische Datenbank Setup
echo "🧹 Führe Fresh Database Setup aus..."
./setup_fresh_db.sh

if [ $? -ne 0 ]; then
    echo "❌ Fehler bei Fresh Database Setup"
    exit 1
fi

# 2. Anfangsbestände einrichten
echo "💰 Setze Geschäftseröffnung Anfangsbestände..."

# Benutzer nach Anfangsbeständen fragen
echo ""
echo "💡 Bitte gib deine tatsächlichen Anfangsbestände vom 1. September 2024 ein:"
echo ""

# Cash Anfangsbestand
read -p "🏦 Cash Anfangsbestand (CHF): " CASH_OPENING
CASH_OPENING=${CASH_OPENING:-500}

# Bank Anfangsbestand  
read -p "🏧 Bank Anfangsbestand (CHF): " BANK_OPENING
BANK_OPENING=${BANK_OPENING:-2000}

echo ""
echo "📊 Setze Anfangsbestände:"
echo "   💵 Cash: CHF $CASH_OPENING"
echo "   🏦 Bank: CHF $BANK_OPENING"

# Temporäres SQL mit benutzerdefinierten Werten erstellen
cat > /tmp/custom_opening_balances.sql << EOF
-- Geschäftseröffnung mit benutzerdefinierten Anfangsbeständen

-- Cash Anfangsbestand
INSERT INTO expenses (
    description,
    amount,
    category,
    payment_method,
    receipt_date,
    created_by,
    notes,
    created_at
) VALUES (
    'Geschäftseröffnung - Anfangsbestand Cash',
    -$CASH_OPENING,
    'opening_balance',
    'cash',
    '2024-09-01',
    '00000000-0000-0000-0000-000000000000',
    'Anfangsbestand Kasse bei Geschäftseröffnung - Salon Lia Hair',
    '2024-09-01 08:00:00+00'
);

-- Bank Anfangsbestand
INSERT INTO expenses (
    description,
    amount,
    category,
    payment_method,
    receipt_date,
    created_by,
    notes,
    created_at
) VALUES (
    'Geschäftseröffnung - Anfangsbestand Bank',
    -$BANK_OPENING,
    'opening_balance',
    'bank',
    '2024-09-01',
    '00000000-0000-0000-0000-000000000000',
    'Anfangsbestand Geschäftskonto bei Geschäftseröffnung',
    '2024-09-01 08:00:00+00'
);

-- September 2024 Daily Summary
INSERT INTO daily_summaries (
    report_date,
    cash_starting,
    cash_ending,
    sales_cash,
    sales_twint,
    sales_sumup,
    sales_total,
    expenses_cash,
    expenses_bank,
    expenses_total,
    cash_difference,
    status,
    notes,
    created_by,
    created_at,
    closed_at
) VALUES (
    '2024-09-01',
    $CASH_OPENING,
    $CASH_OPENING,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    'closed',
    'Geschäftseröffnung Salon Lia Hair - Anfangsbestände erfasst',
    '00000000-0000-0000-0000-000000000000',
    '2024-09-01 20:00:00+00',
    '2024-09-01 20:00:00+00'
);
EOF

# SQL in Container kopieren und ausführen
docker cp /tmp/custom_opening_balances.sql $CONTAINER_NAME:/tmp/custom_opening_balances.sql
docker exec $CONTAINER_NAME psql -U postgres -d postgres -f /tmp/custom_opening_balances.sql

if [ $? -eq 0 ]; then
    echo "✅ Anfangsbestände erfolgreich gesetzt"
else
    echo "❌ Fehler beim Setzen der Anfangsbestände"
    exit 1
fi

# 3. Kontrolle der Anfangsbestände
echo "🔍 Kontrolliere Anfangsbestände..."
docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "
SELECT 
    'Opening Balance Expenses' as type,
    description, 
    amount as 'Amount (CHF)', 
    payment_method,
    receipt_date
FROM expenses 
WHERE category = 'opening_balance'
ORDER BY payment_method;
"

echo ""
docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "
SELECT 
    'Daily Summary' as type,
    report_date, 
    cash_starting as 'Cash Starting (CHF)',
    sales_total as 'Sales Total (CHF)',
    status
FROM daily_summaries 
WHERE report_date = '2024-09-01';
"

# Cleanup
rm /tmp/custom_opening_balances.sql

echo ""
echo "🎯 Setup MIT Anfangsbeständen abgeschlossen!"
echo ""
echo "✅ Erfolgreich durchgeführt:"
echo "   🧹 Frische Datenbank erstellt"
echo "   💰 Anfangsbestände gesetzt:"
echo "      💵 Cash: CHF $CASH_OPENING"
echo "      🏦 Bank: CHF $BANK_OPENING"
echo "   📅 September 2024 Geschäftseröffnung dokumentiert"
echo ""
echo "📋 NÄCHSTE SCHRITTE FÜR VOLLIMPORT:"
echo ""
echo "1️⃣  CSV-Dateien sammeln (September 2024 → heute):"
echo "    📄 TWINT Transaction Reports (monatlich)"
echo "    📄 SumUp Transaction Reports (monatlich)"  
echo "    📄 Bank CAMT.053 Statements (monatlich)"
echo ""
echo "2️⃣  Chronologisch importieren:"
echo "    📅 September 2024 → 5-Step Wizard"
echo "    📅 Oktober 2024 → 5-Step Wizard" 
echo "    📅 November 2024 → 5-Step Wizard"
echo "    📅 ... bis heute"
echo ""
echo "3️⃣  App starten und loslegen:"
echo "    🚀 npm run dev"
echo "    🧙‍♂️ /monthly-closure → Wizard starten"
echo ""
echo "💡 TIPP: Beginne mit September 2024 und arbeite dich chronologisch vor!"
echo "    Cross-Month Settlement Detection funktioniert optimal bei chronologischem Import."