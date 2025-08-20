import React, { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Search, X } from "lucide-react";
import { Label } from "./label";

interface SearchCodigoServicoProps {
  onSearch: (codigo: string) => void;
  onClear: () => void;
  placeholder?: string;
  value?: string;
}

export function SearchCodigoServico({
  onSearch,
  onClear,
  placeholder = "Digite o código do serviço...",
  value = "",
}: SearchCodigoServicoProps) {
  const [searchValue, setSearchValue] = useState(value);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="searchCodigo" className="text-sm font-medium">
        Pesquisar por Código do Serviço
      </Label>
      <div className="flex gap-2">
        <Input
          id="searchCodigo"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={!searchValue.trim()}
          size="sm"
          variant="outline"
        >
          <Search className="h-4 w-4" />
        </Button>
        {searchValue && (
          <Button onClick={handleClear} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {searchValue && (
        <p className="text-xs text-muted-foreground">
          Pesquisando por: <span className="font-mono">{searchValue}</span>
        </p>
      )}
    </div>
  );
}
