import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TreatmentPlanItem } from "@/types/treatment";

interface TreatmentPlanFormProps {
    treatments: TreatmentPlanItem[];
    onUpdate: (treatments: TreatmentPlanItem[]) => void;
    onSave: (treatments: TreatmentPlanItem[]) => void;
}
//TreatmentPlanForm is a React functional component that manages a dental treatment plan interface.
export function TreatmentPlanForm({ treatments, onUpdate, onSave }: TreatmentPlanFormProps) {
    const handleUpdateTreatment = (index: number, updates: Partial<TreatmentPlanItem>) => {
        const updatedTreatments = [...treatments];
        updatedTreatments[index] = { ...updatedTreatments[index], ...updates };
        onUpdate(updatedTreatments);
    };

    const calculateTotalCost = () => {
        return treatments.reduce((total, t) => total + (t.estimated_cost || 0), 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Treatment Plan</h3>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
                    <div className="text-2xl font-bold">${calculateTotalCost()}</div>
                </div>
            </div>

            <div className="space-y-4">
                {treatments.map((treatment, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-12 gap-4">
                                {/* Treatment Info */}
                                <div className="col-span-4">
                                    <h4 className="font-medium">{treatment.treatment_name}</h4>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Category: {treatment.category}
                                    </div>
                                    {treatment.teeth_involved && (
                                        <div className="text-sm text-muted-foreground">
                                            Teeth: {treatment.teeth_involved.numbers.join(', ')}
                                            {treatment.teeth_involved.group && ` (${treatment.teeth_involved.group})`}
                                        </div>
                                    )}
                                </div>

                                {/* Cost */}
                                <div className="col-span-2">
                                    <Label>Estimated Cost</Label>
                                    <Input
                                        type="number"
                                        value={treatment.estimated_cost || ''}
                                        onChange={(e) => handleUpdateTreatment(index, {
                                            estimated_cost: parseFloat(e.target.value) || 0
                                        })}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Schedule */}
                                <div className="col-span-2">
                                    <Label>Schedule Date</Label>
                                    <Input
                                        type="date"
                                        value={treatment.scheduled_date ?
                                            new Date(treatment.scheduled_date).toISOString().split('T')[0] :
                                            ''}
                                        onChange={(e) => handleUpdateTreatment(index, {
                                            scheduled_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                                        })}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Priority */}
                                <div className="col-span-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={treatment.priority}
                                        onValueChange={(value) => handleUpdateTreatment(index, {
                                            priority: value as 'high' | 'medium' | 'low'
                                        })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={treatment.status}
                                        onValueChange={(value) => handleUpdateTreatment(index, {
                                            status: value as 'planned' | 'in_progress' | 'completed' | 'cancelled'
                                        })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Notes */}
                            {treatment.finding_notes && (
                                <div className="mt-4 text-sm">
                                    <div className="text-muted-foreground">
                                        <span className="font-medium">Finding:</span> {treatment.finding_notes}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button
                type="button"
                className="w-full"
                onClick={() => onSave(treatments)}
            >
                Save Treatment Plan
            </Button>
        </div>
    );
} 