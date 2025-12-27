export const getStats = (req, res) => {
    res.json({
        revenue: 182000,
        activeServices: 945,
        totalCustomers: 3780,
        avgBranchRevenue: 60666,
        branches: [
            { id: 'BR001', name: 'Downtown Branch', status: 'Open', customers: 1250, revenue: 67000 },
            { id: 'BR002', name: 'Uptown Branch', status: 'Open', customers: 980, revenue: 55000 },
            { id: 'BR003', name: 'Suburbs Branch', status: 'Open', customers: 1100, revenue: 60000 },
        ]
    });
};
