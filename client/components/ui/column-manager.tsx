import React, { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Switch } from "./switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Settings, GripVertical, Eye, EyeOff, RotateCcw, Lock } from "lucide-react";
import { ColumnConfig } from "../../hooks/use-table-columns";

interface ColumnManagerProps {
  columns: ColumnConfig[];
  onToggleVisibility: (columnKey: string) => void;
  onReorderColumns: (sourceIndex: number, destinationIndex: number) => void;
  onReset: () => void;
}

export function ColumnManager({
  columns,
  onToggleVisibility,
  onReorderColumns,
  onReset,
}: ColumnManagerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    onReorderColumns(result.source.index, result.destination.index);
  };

  const visibleCount = columns.filter((col) => col.visible).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background hover:bg-accent/80 border-2 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Settings className="h-4 w-4" />
          Colunas ({visibleCount}/{columns.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gerenciar Colunas</DialogTitle>
          <DialogDescription>
            Arraste para reordenar e use os switches para mostrar/ocultar
            colunas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-96 overflow-y-auto pr-2"
                >
                  {columns.map((column, index) => (
                    <Draggable
                      key={column.key}
                      draggableId={column.key}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${
                            snapshot.isDragging
                              ? "shadow-lg bg-background scale-105"
                              : "bg-card hover:bg-accent/50"
                          } ${
                            column.key === "data" || column.key === "acoes"
                              ? "border-primary/30 bg-primary/5"
                              : ""
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="flex-1 flex items-center space-x-2">
                            <Label className="text-sm font-medium">
                              {column.label}
                            </Label>
                            {(column.key === "data" || column.key === "acoes") && (
                              <Lock className="h-3 w-3 text-primary opacity-60" />
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {column.visible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            {/* Tornar Data e Ações obrigatórias (não removíveis) */}
                            {column.key === "data" || column.key === "acoes" ? (
                              <Switch
                                checked={true}
                                disabled={true}
                                className="opacity-50"
                              />
                            ) : (
                              <Switch
                                checked={column.visible}
                                onCheckedChange={() =>
                                  onToggleVisibility(column.key)
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button onClick={() => setIsOpen(false)} className="px-6">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
