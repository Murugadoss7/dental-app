import { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Tooth {
    number: string;
    label: string;
}

const UPPER_TEETH: Tooth[] = [
    { number: '18', label: '8' },
    { number: '17', label: '7' },
    { number: '16', label: '6' },
    { number: '15', label: '5' },
    { number: '14', label: '4' },
    { number: '13', label: '3' },
    { number: '12', label: '2' },
    { number: '11', label: '1' },
    { number: '21', label: '1' },
    { number: '22', label: '2' },
    { number: '23', label: '3' },
    { number: '24', label: '4' },
    { number: '25', label: '5' },
    { number: '26', label: '6' },
    { number: '27', label: '7' },
    { number: '28', label: '8' }
];

const LOWER_TEETH: Tooth[] = [
    { number: '48', label: '8' },
    { number: '47', label: '7' },
    { number: '46', label: '6' },
    { number: '45', label: '5' },
    { number: '44', label: '4' },
    { number: '43', label: '3' },
    { number: '42', label: '2' },
    { number: '41', label: '1' },
    { number: '31', label: '1' },
    { number: '32', label: '2' },
    { number: '33', label: '3' },
    { number: '34', label: '4' },
    { number: '35', label: '5' },
    { number: '36', label: '6' },
    { number: '37', label: '7' },
    { number: '38', label: '8' }
];

interface ToothButtonProps {
    number: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

function ToothButton({ number, label, isSelected, onClick }: ToothButtonProps) {
    return (
        <Button
            variant={isSelected ? "default" : "outline"}
            className={cn(
                "w-full h-10 p-0.5 hover:bg-primary/90 transition-colors",
                isSelected && "ring-1 ring-primary"
            )}
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
        >
            <div className="text-center">
                <div className="text-sm font-medium leading-none">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{number}</div>
            </div>
        </Button>
    );
}

interface ToothChartProps {
    selectedTeeth?: { number: string; group: 'upper' | 'lower' }[];
    onTeethSelect?: (teeth: { number: string; group: 'upper' | 'lower' }[]) => void;
    className?: string;
}

export function ToothChart({ selectedTeeth = [], onTeethSelect, className }: ToothChartProps) {
    const [selectedToothNumbers, setSelectedToothNumbers] = useState<string[]>([]);

    useEffect(() => {
        setSelectedToothNumbers(selectedTeeth.map(t => t.number));
    }, [selectedTeeth]);

    const handleToothClick = (toothNumber: string, group: 'upper' | 'lower') => {
        if (!onTeethSelect) return;

        let newSelectedTeeth: { number: string; group: 'upper' | 'lower' }[];

        if (selectedToothNumbers.includes(toothNumber)) {
            newSelectedTeeth = selectedTeeth.filter(t => t.number !== toothNumber);
            setSelectedToothNumbers(prev => prev.filter(n => n !== toothNumber));
        } else {
            newSelectedTeeth = [...selectedTeeth, { number: toothNumber, group }];
            setSelectedToothNumbers(prev => [...prev, toothNumber]);
        }

        onTeethSelect(newSelectedTeeth);
    };

    const isSelected = (toothNumber: string) => selectedToothNumbers.includes(toothNumber);

    return (
        <div className={cn("w-full max-w-3xl mx-auto p-3", className)}>
            <div className="space-y-4 bg-card rounded-lg p-3 shadow-sm">
                {/* Upper Teeth */}
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Upper Teeth</h3>
                    <div className="grid grid-cols-8 gap-1">
                        {UPPER_TEETH.map((tooth) => (
                            <ToothButton
                                key={tooth.number}
                                number={tooth.number}
                                label={tooth.label}
                                isSelected={isSelected(tooth.number)}
                                onClick={() => handleToothClick(tooth.number, 'upper')}
                            />
                        ))}
                    </div>
                </div>

                <div className="border-t border-border my-2" />

                {/* Lower Teeth */}
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Lower Teeth</h3>
                    <div className="grid grid-cols-8 gap-1">
                        {LOWER_TEETH.map((tooth) => (
                            <ToothButton
                                key={tooth.number}
                                number={tooth.number}
                                label={tooth.label}
                                isSelected={isSelected(tooth.number)}
                                onClick={() => handleToothClick(tooth.number, 'lower')}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 