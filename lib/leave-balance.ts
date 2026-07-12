function daysInclusive(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
    return Math.max(diff, 0);
}

export function computeLeaveBalance(
    entitlement: number,
    approvedRequests: { startDate: string; endDate: string }[]
) {
    const year = new Date().getFullYear();
    const used = approvedRequests
        .filter((r) => new Date(r.startDate).getFullYear() === year)
        .reduce((sum, r) => sum + daysInclusive(r.startDate, r.endDate), 0);

    return {
        entitlement,
        used,
        remaining: Math.max(entitlement - used, 0),
    };
}