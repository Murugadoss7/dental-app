import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ToothChart } from './ToothChart';
import { dentalCatalogService } from '@/services/api';
import { Plus, X } from 'lucide-react';
import { treatmentService } from '@/services/api';

interface ClinicalFinding {
    id: string;
    colorCode: string;
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

interface ClinicalFindingsFormProps {
    onSubmit: (findings: string) => void;
}

const COLORS = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
];

export function ClinicalFindingsForm({ onSubmit }: ClinicalFindingsFormProps) {
    const [findings, setFindings] = useState<ClinicalFinding[]>([]);
    const [selectedTeeth, setSelectedTeeth] = useState<{ number: string; group: 'upper' | 'lower'; colorCode: string }[]>([]);

    // Fetch dental issues and treatments with caching
    const { data: issues } = useQuery({
        queryKey: ['dental-catalog', 'category'],
        queryFn: () => dentalCatalogService.getAll('category'),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const { data: treatments } = useQuery({
        queryKey: ['dental-catalog', 'treatment'],
        queryFn: () => dentalCatalogService.getAll('treatment'),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['prescriptions', treatments?.[0]?._id],
        queryFn: () => {
            const treatmentId = treatments?.[0]?._id;
            if (!treatmentId) return [];
            return treatmentService.getTreatmentPrescriptions(treatmentId);
        },
        enabled: !!treatments?.[0]?._id,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const addFindingGroup = () => {
        const newFinding: ClinicalFinding = {
            id: uuidv4(),
            colorCode: COLORS[findings.length % COLORS.length],
            teeth: {
                group: 'upper',
                numbers: []
            },
            issue: {
                name: '',
                is_custom: false
            },
            finding: '',
            recommended_treatment: {
                name: '',
                is_custom: false
            }
        };
        setFindings([...findings, newFinding]);
    };

    const removeFindingGroup = (id: string) => {
        setFindings(findings.filter(f => f.id !== id));
        setSelectedTeeth(selectedTeeth.filter(t => !findings.find(f => f.id === id)?.teeth.numbers.includes(t.number)));
    };

    const updateFinding = (id: string, updates: Partial<ClinicalFinding>) => {
        setFindings(findings.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleTeethSelect = (findingId: string, teeth: { number: string; group: 'upper' | 'lower' }[]) => {
        const finding = findings.find(f => f.id === findingId);
        if (!finding) return;

        // Remove previously selected teeth for this finding
        const updatedSelectedTeeth = selectedTeeth.filter(t => !finding.teeth.numbers.includes(t.number));

        // Add newly selected teeth with the finding's color
        const newSelectedTeeth = teeth.map(t => ({
            ...t,
            colorCode: finding.colorCode
        }));

        setSelectedTeeth([...updatedSelectedTeeth, ...newSelectedTeeth]);
        updateFinding(findingId, {
            teeth: {
                group: teeth[0]?.group || 'upper',
                numbers: teeth.map(t => t.number)
            }
        });
    };

    const formatFindings = (findings: ClinicalFinding[]) => {
        return findings.map(f =>
            `Teeth ${f.teeth.numbers.join(', ')}: ${f.issue.name} - ${f.finding} (Recommended: ${f.recommended_treatment.name})`
        ).join('\n');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <ToothChart
                    selectedTeeth={selectedTeeth}
                    onTeethSelect={(teeth) => {
                        if (findings.length === 0) {
                            addFindingGroup();
                        }
                        handleTeethSelect(findings[findings.length - 1].id, teeth);
                    }}
                />

                <div className="space-y-4">
                    {findings.map((finding, index) => (
                        <Card key={finding.id} className={cn("relative", finding.colorCode)}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => removeFindingGroup(finding.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Group {index + 1}</span>
                                        <span className="text-sm">
                                            ({finding.teeth.numbers.join(', ')})
                                        </span>
                                    </div>

                                    <FormField
                                        name={`findings.${index}.issue`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Issue</FormLabel>
                                                <Select
                                                    value={finding.issue.id || ''}
                                                    onValueChange={(value) => {
                                                        const selectedIssue = issues?.find(i => i._id === value);
                                                        updateFinding(finding.id, {
                                                            issue: {
                                                                id: selectedIssue?._id,
                                                                name: selectedIssue?.name || value,
                                                                is_custom: !selectedIssue
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select or enter issue" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {issues?.map((issue) => (
                                                            <SelectItem key={issue._id} value={issue._id}>
                                                                {issue.name}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="custom">+ Add Custom Issue</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {finding.issue.is_custom && (
                                        <FormField
                                            name={`findings.${index}.customIssue`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Custom Issue</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={finding.issue.name}
                                                            onChange={(e) => updateFinding(finding.id, {
                                                                issue: {
                                                                    name: e.target.value,
                                                                    is_custom: true
                                                                }
                                                            })}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        name={`findings.${index}.finding`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Clinical Finding</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        value={finding.finding}
                                                        onChange={(e) => updateFinding(finding.id, {
                                                            finding: e.target.value
                                                        })}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        name={`findings.${index}.treatment`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Recommended Treatment</FormLabel>
                                                <Select
                                                    value={finding.recommended_treatment.id || ''}
                                                    onValueChange={(value) => {
                                                        const selectedTreatment = treatments?.find(t => t._id === value);
                                                        updateFinding(finding.id, {
                                                            recommended_treatment: {
                                                                id: selectedTreatment?._id,
                                                                name: selectedTreatment?.name || value,
                                                                is_custom: !selectedTreatment
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select or enter treatment" />
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {finding.recommended_treatment.is_custom && (
                                        <FormField
                                            name={`findings.${index}.customTreatment`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Custom Treatment</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={finding.recommended_treatment.name}
                                                            onChange={(e) => updateFinding(finding.id, {
                                                                recommended_treatment: {
                                                                    name: e.target.value,
                                                                    is_custom: true
                                                                }
                                                            })}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={addFindingGroup}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Finding Group
                    </Button>

                    <Button
                        type="button"
                        className="w-full"
                        onClick={() => onSubmit(formatFindings(findings))}
                    >
                        Save Clinical Findings
                    </Button>
                </div>
            </div>
        </div>
    );
} 