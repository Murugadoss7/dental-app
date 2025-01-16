import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ToothChart } from "./ToothChart";
import { useQuery } from "@tanstack/react-query";
import { treatmentService } from "@/services/treatmentService";
import { Input } from "@/components/ui/input";

interface ClinicalFinding {
    id: string;
    teeth: {
        group: 'upper' | 'lower';
        numbers: string[];
    };
    issue: {
        id?: string;
        name: string;
        is_custom: boolean;
    };
    finding: string;
    recommended_treatment: {
        id?: string;
        name: string;
        is_custom: boolean;
    };
}

interface ClinicalFindingsGroupProps {
    finding: ClinicalFinding;
    onUpdate: (finding: ClinicalFinding) => void;
    onRemove: () => void;
}

export function ClinicalFindingsGroup({ finding, onUpdate, onRemove }: ClinicalFindingsGroupProps) {
    const { data: treatments } = useQuery({
        queryKey: ['dental-catalog', 'treatment'],
        queryFn: () => treatmentService.getCatalogItems('treatment')
    });

    const { data: categories } = useQuery({
        queryKey: ['dental-catalog', 'category'],
        queryFn: () => treatmentService.getCatalogItems('category')
    });

    const handleTeethSelect = (teeth: { number: string; group: 'upper' | 'lower' }[]) => {
        onUpdate({
            ...finding,
            teeth: {
                group: teeth[0]?.group || 'upper',
                numbers: teeth.map(t => t.number)
            }
        });
    };

    return (
        <div className="space-y-3 p-3 border rounded-lg">
            <div className="flex justify-between items-start">
                <div className="text-xs text-muted-foreground">
                    Selected Teeth: {finding.teeth.numbers.join(', ')}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6"
                    onClick={onRemove}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* Tooth Chart */}
            <div className="mb-3">
                <ToothChart
                    selectedTeeth={finding.teeth.numbers.map(number => ({
                        number,
                        group: finding.teeth.group
                    }))}
                    onTeethSelect={handleTeethSelect}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Left Section - Category and Finding */}
                <div className="space-y-3">
                    <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs">Category</FormLabel>
                        <Select
                            value={finding.issue.id}
                            onValueChange={(value) => {
                                if (value === 'custom') {
                                    onUpdate({
                                        ...finding,
                                        issue: {
                                            name: '',
                                            is_custom: true
                                        }
                                    });
                                } else {
                                    const category = categories?.find(c => c._id === value);
                                    onUpdate({
                                        ...finding,
                                        issue: {
                                            id: category?._id,
                                            name: category?.name || '',
                                            is_custom: false
                                        }
                                    });
                                }
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories?.map((category) => (
                                    <SelectItem key={category._id} value={category._id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom">+ Add Custom Category</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>

                    {finding.issue.is_custom && (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs">Custom Category</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-8"
                                    value={finding.issue.name}
                                    onChange={(e) => onUpdate({
                                        ...finding,
                                        issue: {
                                            name: e.target.value,
                                            is_custom: true
                                        }
                                    })}
                                />
                            </FormControl>
                        </FormItem>
                    )}

                    <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs">Clinical Finding</FormLabel>
                        <FormControl>
                            <Textarea
                                value={finding.finding}
                                onChange={(e) => onUpdate({ ...finding, finding: e.target.value })}
                                className="h-24 resize-none"
                            />
                        </FormControl>
                    </FormItem>
                </div>

                {/* Right Section - Treatment */}
                <div className="space-y-3">
                    <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs">Recommended Treatment</FormLabel>
                        <Select
                            value={finding.recommended_treatment.id}
                            onValueChange={(value) => {
                                if (value === 'custom') {
                                    onUpdate({
                                        ...finding,
                                        recommended_treatment: {
                                            name: '',
                                            is_custom: true
                                        }
                                    });
                                } else {
                                    const treatment = treatments?.find(t => t._id === value);
                                    onUpdate({
                                        ...finding,
                                        recommended_treatment: {
                                            id: treatment?._id,
                                            name: treatment?.name || '',
                                            is_custom: false
                                        }
                                    });
                                }
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {treatments?.map((treatment) => (
                                    <SelectItem key={treatment._id} value={treatment._id}>
                                        {treatment.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom">+ Add Custom Treatment</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>

                    {finding.recommended_treatment.is_custom && (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs">Custom Treatment</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-8"
                                    value={finding.recommended_treatment.name}
                                    onChange={(e) => onUpdate({
                                        ...finding,
                                        recommended_treatment: {
                                            name: e.target.value,
                                            is_custom: true
                                        }
                                    })}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                </div>
            </div>
        </div>
    );
} 