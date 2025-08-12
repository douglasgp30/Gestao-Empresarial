import React from "react";
import { formatDate, formatDateTime, formatDateRange } from "../../lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

export function TesteDatas() {
  // Testando diferentes tipos de entrada de data
  const testCases = [
    { label: "Date object", value: new Date() },
    { label: "ISO string", value: "2024-01-15T10:30:00Z" },
    { label: "Date string", value: "2024-01-15" },
    { label: "Null", value: null },
    { label: "Undefined", value: undefined },
    { label: "Invalid string", value: "invalid-date" },
    { label: "Empty string", value: "" }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🧪 Teste de Formatação de Datas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {testCases.map((test, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{test.label}</div>
              <div className="text-sm text-gray-600">
                Input: {typeof test.value} - {String(test.value)}
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">
                {formatDate(test.value as any)}
              </Badge>
              <div className="text-xs text-gray-500">
                DateTime: {formatDateTime(test.value as any)}
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="font-medium mb-2">Teste de Range:</div>
          <div>
            {formatDateRange("2024-01-01", "2024-01-31")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
