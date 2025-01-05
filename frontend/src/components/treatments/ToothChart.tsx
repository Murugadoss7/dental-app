import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToothProps {
    number: string;
    isSelected: boolean;
    onClick: () => void;
}

function Tooth({ number, isSelected, onClick }: ToothProps) {
    return (
        <Button
            variant="outline"
            className={cn(
                'w-12 h-12 p-0 font-medium',
                isSelected && 'bg-primary text-primary-foreground'
            )}
            onClick={onClick}
        >
            {number}
        </Button>
    );
}

const UPPER_TEETH = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_TEETH = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

interface ToothChartProps {
    selectedTeeth?: string[];
    onTeethChange?: (teeth: string[]) => void;
}

export function ToothChart({ selectedTeeth = [], onTeethChange }: ToothChartProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedTeeth));

    const toggleTooth = (tooth: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(tooth)) {
            newSelected.delete(tooth);
        } else {
            newSelected.add(tooth);
        }
        setSelected(newSelected);
        onTeethChange?.(Array.from(newSelected));
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-center">Upper Teeth</h3>
                <div className="grid grid-cols-8 gap-1">
                    {UPPER_TEETH.slice(0, 8).map((tooth) => (
                        <Tooth
                            key={tooth}
                            number={tooth}
                            isSelected={selected.has(tooth)}
                            onClick={() => toggleTooth(tooth)}
                        />
                    ))}
                    {UPPER_TEETH.slice(8).map((tooth) => (
                        <Tooth
                            key={tooth}
                            number={tooth}
                            isSelected={selected.has(tooth)}
                            onClick={() => toggleTooth(tooth)}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium text-center">Lower Teeth</h3>
                <div className="grid grid-cols-8 gap-1">
                    {LOWER_TEETH.slice(0, 8).map((tooth) => (
                        <Tooth
                            key={tooth}
                            number={tooth}
                            isSelected={selected.has(tooth)}
                            onClick={() => toggleTooth(tooth)}
                        />
                    ))}
                    {LOWER_TEETH.slice(8).map((tooth) => (
                        <Tooth
                            key={tooth}
                            number={tooth}
                            isSelected={selected.has(tooth)}
                            onClick={() => toggleTooth(tooth)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 