"use client";
import { Download } from "lucide-react";
import { getBillingStatementItems } from "@/actions/billing-statement.item.api";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import {
  billing_statement,
  billing_statement_item,
} from "@/types/billing-statement";
import { convertirNumeroALetras } from "@/lib/numeroALetras";
import { formatBillingDate } from "@/lib/billing-date";
import { useEffect, useState } from "react";

export const styles = StyleSheet.create({
  page: {
    paddingVertical: 100,
    paddingHorizontal: 80,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  amount: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  section: {
    marginVertical: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bulletpoint: {
    textAlign: "right",
    paddingRight: 10,
  },
  description: {
    flex: 2,
    textAlign: "left",
    paddingRight: 10,
  },
  amountColumn: {
    flex: 1,
    textAlign: "right",
  },
  signatureSection: {
    marginTop: 40,
    textAlign: "left",
    alignItems: "flex-start",
  },
  signatureLine: {
    marginTop: 30,
    borderTop: "1 solid black",
    width: 200,
    paddingTop: 5,
  },
});

function DocTypeAdapter(docType: string): string {
  if (docType === "CC") return "Cédula de ciudadanía";
  if (docType === "CE") return "Cédula de extranjería";
  if (docType === "NIT") return "NIT";
  return docType;
}

export const BillingStatementPDF: React.FC<{
  data: billing_statement;
  items: billing_statement_item[];
}> = ({ data, items }) => {
  const date = formatBillingDate(data.payDate);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>CUENTA DE COBRO</Text>
          <Text style={styles.text}>
            {date.ok ? date.value : "Fecha no válida"}
          </Text>
          <Text style={styles.text}>{data.client.name.toUpperCase()}</Text>
          <Text style={styles.text}>
            {DocTypeAdapter(data.client.docType) + ": " + data.client.docNumber}
            {data.client.expeditionPlace &&
            data.client.expeditionPlace.length > 0
              ? " de " + data.client.expeditionPlace
              : ""}
          </Text>
          <Text style={styles.text}>Debe a</Text>
          <Text style={styles.text}>{data.creditor.name.toUpperCase()}</Text>
          <Text style={styles.text}>
            {DocTypeAdapter(data.creditor.docType) +
              ": " +
              data.creditor.docNumber}
            {data.creditor.expeditionPlace &&
            data.creditor.expeditionPlace.length > 0
              ? " de " + data.creditor.expeditionPlace
              : ""}
          </Text>
          <Text style={styles.amount}>
            La suma de ${data.amount?.toLocaleString('es-CO')} (
            {convertirNumeroALetras(data.amount as number)}).
          </Text>
        </View>

        {/* Lista de conceptos en formato tabla con sangría */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Por concepto de:</Text>
          <View style={styles.table}>
            {items.map(
              (item) =>
                item.desc && (
                  <View style={styles.row} key={item.id}>
                    <Text style={styles.bulletpoint}>{"•   "}</Text>
                    <Text style={styles.description}>
                      {item.desc}
                    </Text>
                    {data.showItemAmount && (
                      <Text style={styles.amountColumn}>
                        ${item.amount?.toLocaleString("es-CO")}
                      </Text>
                    )}
                  </View>
                ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>{data.extraInfo}</Text>
        </View>

        <View style={styles.section}></View>
        <View style={styles.section}></View>
        {/* Firma */}
        <Text style={styles.text}>Atentamente,</Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine} />
          <Text>{data.creditor.name}</Text>
          <Text>
            {data.creditor.docType +
              ": " +
              data.creditor.docNumber}
          </Text>
          <Text>
            {data.creditor.telephone && data.creditor.telephone.length > 0
              ? "Teléfono: " + data.creditor.telephone
              : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const DownloadPDFButton = ({ data }: { data: billing_statement }) => {
  const [result, setResult] = useState<{ id: string; items: billing_statement_item[] | null } | null>(null);

  useEffect(() => {
    let active = true;
    if (!data.id) return;
    const id = data.id;
    void getBillingStatementItems(id).then((response) => {
      if (active) setResult({ id, items: response.success && response.data ? response.data : null });
    }).catch(() => { if (active) setResult({ id, items: null }); });
    return () => { active = false; };
  }, [data.id]);

  if (!data.id) {
    return <span role="status">No se pudo preparar el PDF.</span>;
  }
  if (!result || result.id !== data.id) {
    return <button type="button" disabled aria-label="Cargando ítems para el PDF"><Download size={24} /></button>;
  }
  if (result.items === null) return <span role="status">No se pudo preparar el PDF.</span>;
  const items = result.items;
  const date = formatBillingDate(data.payDate);
  if (!date.ok) return <span role="status">No se pudo preparar el PDF: fecha no válida.</span>;

  return (
    <PDFDownloadLink
      document={<BillingStatementPDF data={data} items={items} />}
      fileName={`Cuenta de cobro ${data.client.name} (${date.value}).pdf`}
      onClick={(event, instance?: { loading: boolean; error: string | null; url: string | null }) => {
        if (!instance || instance.loading || instance.error || !instance.url) event.preventDefault();
      }}
    >
      {({ loading, error }) => error ? (
        <span role="status">No se pudo generar el PDF.</span>
      ) : (
        <button
          type="button"
          aria-label={loading ? "Preparando PDF" : "Descargar PDF"}
          className={`flex items-center justify-center ${loading ? "cursor-not-allowed" : "cursor-pointer"} `}
          disabled={loading}
        >
          {<Download size={24} />}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default DownloadPDFButton;
