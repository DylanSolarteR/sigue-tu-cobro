"use client";
import { Download } from "lucide-react";
import { getBillingStatementItems } from "@/actions/billing-statement.item.api";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import {
  billing_statement,
  billing_statement_item,
} from "@/types/billing-statement";
import { convertirNumeroALetras } from "@/lib/numeroALetras";
import { formatBillingDate } from "@/lib/billing-date";
import { useState } from "react";

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
  const [preparing, setPreparing] = useState(false);
  const [message, setMessage] = useState("");
  const date = formatBillingDate(data.payDate);

  async function download() {
    if (!data.id || preparing || !date.ok) return;
    setPreparing(true);
    setMessage("");
    try {
      // Fetch and render only on demand; lists must not generate every PDF on mount.
      const result = await getBillingStatementItems(data.id);
      if (!result.success || !result.data) {
        setMessage("No se pudo preparar el PDF.");
        return;
      }
      const blob = await pdf(<BillingStatementPDF data={data} items={result.data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Cuenta de cobro ${data.client.name} (${date.value}).pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      const revoke = URL.revokeObjectURL.bind(URL);
      setTimeout(() => revoke(url), 1000);
    } catch {
      setMessage("No se pudo generar el PDF.");
    } finally {
      setPreparing(false);
    }
  }

  if (!data.id || !date.ok) return <span role="status">No se pudo preparar el PDF: cuenta o fecha no válida.</span>;
  return <div className="flex flex-col gap-2">
    <button type="button" onClick={() => void download()} disabled={preparing} aria-label={preparing ? "Preparando PDF" : "Descargar PDF"} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-transparent outline-none hover:bg-stc-hover focus-visible:border-stc-focus disabled:cursor-wait disabled:opacity-50">
      <Download size={24} aria-hidden="true" />
    </button>
    {message && <span role="status">{message}</span>}
  </div>;
};

export default DownloadPDFButton;
