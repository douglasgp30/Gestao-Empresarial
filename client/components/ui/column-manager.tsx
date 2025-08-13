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
import { Settings, GripVertical, Eye, EyeOff, RotateCcw } from "lucide-react";
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
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Colunas ({visibleCount}/{columns.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
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
                          className={`flex items-center space-x-3 p-3 border rounded-lg ${
                            snapshot.isDragging
                              ? "shadow-lg bg-background"
                              : "bg-card"
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="flex-1">
                            <Label className="text-sm font-medium">
                              {column.label}
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {column.visible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Switch
                              checked={column.visible}
                              onCheckedChange={() =>
                                onToggleVisibility(column.key)
                              }
                            />
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
