import { useQuery } from '@tanstack/react-query';

export function useCurrentDoctor() {
    return useQuery({
        queryKey: ['currentDoctor'],
        queryFn: async () => {
            const response = await fetch('/api/doctors/me');
            if (!response.ok) {
                throw new Error('Failed to fetch current doctor');
            }
            return response.json();
        }
    });
} 