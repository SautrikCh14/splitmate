// PLACEHOLDER DATA for the dashboard layout only.
// Every value here is replaced by real backend data in later phases.
// All money values are integer paise.
export const dashboardPlaceholder = {
  user: { name: 'Alex Sharma' },
  summary: {
    youOwe: 32000,
    owedToYou: 182550,
    totalGroupExpenses: 1845000,
  },
  transactions: [
    { id: 1, title: 'Beach shack dinner', group: 'Goa Trip 2026', payer: 'Alex', date: '2026-11-06', total: 360000, yourShare: 120000 },
    { id: 2, title: 'Scooter rental', group: 'Goa Trip 2026', payer: 'Rahul', date: '2026-11-05', total: 150000, yourShare: 50000 },
    { id: 3, title: 'Electricity bill', group: 'Hostel Room 305', payer: 'Karan', date: '2026-11-03', total: 84000, yourShare: 21000 },
    { id: 4, title: 'Movie night', group: 'College Friends', payer: 'Priya', date: '2026-11-01', total: 120000, yourShare: 40000 },
  ],
  groups: [
    { id: 1, name: 'Goa Trip 2026', members: 3, total: 600000, balance: 160000 },
    { id: 2, name: 'Hostel Room 305', members: 4, total: 645000, balance: 22550 },
    { id: 3, name: 'College Friends', members: 5, total: 600000, balance: -32000 },
  ],
  owedToYou: [
    { id: 1, name: 'Aman Gupta', group: 'Goa Trip 2026', amount: 110000 },
    { id: 2, name: 'Rahul Verma', group: 'Goa Trip 2026', amount: 50000 },
    { id: 3, name: 'Karan Mehta', group: 'Hostel Room 305', amount: 22550 },
  ],
  youOwe: [{ id: 1, name: 'Priya Nair', group: 'College Friends', amount: 32000 }],
  activity: [
    { id: 1, text: 'Alex added “Beach shack dinner”', group: 'Goa Trip 2026', when: '2 days ago' },
    { id: 2, text: 'Rahul added “Scooter rental”', group: 'Goa Trip 2026', when: '3 days ago' },
    { id: 3, text: 'Karan joined the group', group: 'Hostel Room 305', when: '4 days ago' },
    { id: 4, text: 'Priya recorded a payment', group: 'College Friends', when: '6 days ago' },
  ],
};  