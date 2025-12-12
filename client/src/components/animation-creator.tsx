"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Location } from "@/lib/mock-data";
import { AnimationType, AnimationConfig } from "@/lib/animations/types";
import { Checkpoint } from "@/lib/route-animation";

interface AnimationCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  onCreateAnimation: (config: AnimationConfig) => void;
}

export function AnimationCreator({
  open,
  onOpenChange,
  locations,
  onCreateAnimation,
}: AnimationCreatorProps) {
  const [pointAId, setPointAId] = useState<string>("");
  const [pointBId, setPointBId] = useState<string>("");
  const [animationType, setAnimationType] = useState<AnimationType>("straight");

  const handleCreate = () => {
    if (!pointAId || !pointBId || pointAId === pointBId) {
      return;
    }

    const pointA = locations.find((loc) => loc.id === pointAId);
    const pointB = locations.find((loc) => loc.id === pointBId);

    if (!pointA || !pointB) return;

    const pointACheckpoint: Checkpoint = {
      id: pointA.id,
      name: pointA.name,
      lat: pointA.lat,
      lng: pointA.lng,
    };

    const pointBCheckpoint: Checkpoint = {
      id: pointB.id,
      name: pointB.name,
      lat: pointB.lat,
      lng: pointB.lng,
    };

    onCreateAnimation({
      pointA: pointACheckpoint,
      pointB: pointBCheckpoint,
      type: animationType,
      duration: 3000,
      resolution: 60,
    });

    // Reset form
    setPointAId("");
    setPointBId("");
    setAnimationType("straight");
    onOpenChange(false);
  };

  const isValid = pointAId && pointBId && pointAId !== pointBId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Animação</DialogTitle>
          <DialogDescription>
            Escolha o ponto A, ponto B e o tipo de animação para criar uma
            transição.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pointA">Ponto A (Início)</Label>
            <Select value={pointAId} onValueChange={setPointAId}>
              <SelectTrigger id="pointA">
                <SelectValue placeholder="Selecione o ponto A" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pointB">Ponto B (Destino)</Label>
            <Select value={pointBId} onValueChange={setPointBId}>
              <SelectTrigger id="pointB">
                <SelectValue placeholder="Selecione o ponto B" />
              </SelectTrigger>
              <SelectContent>
                {locations
                  .filter((loc) => loc.id !== pointAId)
                  .map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Tipo de Animação</Label>
            <RadioGroup
              value={animationType}
              onValueChange={(value) => setAnimationType(value as AnimationType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="straight" id="straight" />
                <Label htmlFor="straight" className="font-normal cursor-pointer">
                  Reta/Curva (linha direta)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="route" id="route" />
                <Label htmlFor="route" className="font-normal cursor-pointer">
                  Trajeto Maps (rota real)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teleport" id="teleport" />
                <Label htmlFor="teleport" className="font-normal cursor-pointer">
                  Teleporte (sem linha)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!isValid}>
            Criar Animação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

