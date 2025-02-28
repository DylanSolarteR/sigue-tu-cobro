import { Card, CardContent, CardHeader, CardTitle } from "../../ui";

interface props {
  title: string;
  value: string | number;
}

function KPICard({ title, value }: props) {
  return (
    <Card className="flex h-full max-h-[16rem] w-full max-w-[20rem] flex-col border-none bg-secondary">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full w-full items-center justify-center px-6 text-5xl">
        <span className="text-ellipsis" title={value as string}>
          {value}
        </span>
      </CardContent>
    </Card>
  );
}

export default KPICard;
